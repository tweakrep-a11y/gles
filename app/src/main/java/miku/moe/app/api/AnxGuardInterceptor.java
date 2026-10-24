package miku.moe.app.api;

import android.util.Base64;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import okhttp3.FormBody;
import okhttp3.HttpUrl;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okio.Buffer;

/**
 * Full port of the Anime X Nonton GuardInterceptor, updated for gen-2 new_api
 * (app 26.10.7; crypto scheme unchanged — smali i91 + h91):
 *  - derives per-request keys from MASTER + "anx-guard-v1-salt"
 *  - encrypts the original form body as anx=<urlenc b64(nonce12||ct+tag)> (AES-256-GCM, req key)
 *  - signs the request with X-Anx-Sig (HMAC over canonical string, sig key)
 *  - adds X-Anx-Ts / X-Anx-N / X-Anx-Ver / X-Anx-Cert / X-Anx-Rsp headers
 *
 * Signature algorithm verified byte-exact against a real capture:
 *   calc  : c57edfcf9f07305b1eac856a793c49d19896251a099f2b7db577cc0cab459aca
 *   target: c57edfcf9f07305b1eac856a793c49d19896251a099f2b7db577cc0cab459aca
 *
 * Cert fingerprint auto-update:
 *  - The server rejects a rotated-out cert with HTTP 403 + "x-anx-refused: cert"
 *    (body {"status":"error","message":"unofficial copy"}), so the cert can no
 *    longer be a fixed constant only.
 *  - The active cert is fetched from REMOTE_CERT_URL (plain text, one 16-hex
 *    cert value) once per app process, validated, and cached in memory.
 *  - If the remote fetch fails or returns an invalid value, the hardcoded
 *    FALLBACK_CERT is used, so behaviour never gets worse than a fixed cert.
 *  - If a request is refused with 403 + x-anx-refused: cert, the cert is
 *    force-refreshed from REMOTE_CERT_URL and, when it changed, the request is
 *    re-signed and retried once with the new cert.
 */
public final class AnxGuardInterceptor implements Interceptor {
    private static final String TAG = "AnxGuard";
    private static final String MASTER_HEX =
            "0f4be99c888e987925fad6650daae56e5fc002ee1286a6c24fead72f29365862"; // MyApplication.onCreate
    private static final byte[] SALT = "anx-guard-v1-salt".getBytes(StandardCharsets.UTF_8);
    private static final String FALLBACK_CERT = "1a70a8a890d82093"; // x-anx-cert of the 26.10.7 build (signer cert hash)
    private static final String REMOTE_CERT_URL = "https://pastebin.com/raw/Lfy0gjdU";
    private static final String VERSION_CODE = "25";
    private static final MediaType FORM =
            MediaType.parse("application/x-www-form-urlencoded; charset=utf-8");

    private static final Object CERT_LOCK = new Object();
    private static volatile String activeCert = FALLBACK_CERT;
    private static volatile boolean remoteCheckedThisProcess = false;
    private static volatile long lastFetchAttemptMs = 0L;
    private static final long MIN_FETCH_INTERVAL_MS = 5000L;
    private static final int REMOTE_TIMEOUT_MS = 4000;

    /** Paths (relative to the host) that belong to the gen-2 new_api and must be signed. */
    private static final java.util.Set<String> API2_PATHS = new java.util.HashSet<>(java.util.Arrays.asList(
            "animexnonton/new_api/get_posts/",
            "animexnonton/new_api/search_category_collection/",
            "animexnonton/new_api/get_category_not_ongoing/",
            "animexnonton/new_api/get_category_ongoing/",
            "animexnonton/new_api/get_anime_by_genre/",
            "animexnonton/new_api/get_anime_genre_list/",
            "animexnonton/new_api/get_post_description/",
            "animexnonton/new_api/get_category_posts_secure/",
            "animexnonton/new_api/get_current_next_previous/",
            "animexnonton/new_api/user_rating/",
            "animexnonton/new_api/update_view/",
            "animexnonton/new_api/home_info/",
            "animexnonton/new_api/user_count/",
            "animexnonton/new_api/count_views/",
            "animexnonton/new_api/register_user/",
            "animexnonton/new_api/device_status/",
            "animexnonton/new_api/access_challenge/",
            "animexnonton/new_api/integrity_verify/",
            "animexnonton/new_api/get_config/"
    ));

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request request = chain.request();
        String encodedPath = request.url().encodedPath();
        int i = encodedPath.indexOf("/new_api/");
        boolean isApi2 = i >= 0;
        String api2Path = isApi2 ? encodedPath.substring(i) : encodedPath;
        int appPathIndex = encodedPath.indexOf("animexnonton/");
        if (!isApi2 || appPathIndex < 0
                || !API2_PATHS.contains(encodedPath.substring(appPathIndex))) {
            return chain.proceed(request); // not a new_api endpoint: untouched
        }

        // This guard protocol encrypts form data into an "anx=..." request body.
        // GET/HEAD (and other bodyless methods) must never be rebuilt with a body;
        // OkHttp rejects that with IllegalArgumentException before the request is sent.
        // new_api calls in this app are expected to use POST; leave any unexpected method
        // untouched as a defensive fallback instead of crashing the OkHttp dispatcher.
        if (!"POST".equalsIgnoreCase(request.method())) {
            Log.w(TAG, "Skipping new_api body signing for unsupported method "
                    + request.method() + " " + api2Path);
            return chain.proceed(request);
        }

        Request signed;
        try {
            signed = buildSignedRequest(request, api2Path, currentCert(false));
        } catch (Exception e) {
            Log.e(TAG, "Guard signing failed for " + api2Path, e);
            AnxDiagnosticInterceptor.logParserError("Guard signing failed for " + api2Path, e);
            if (e instanceof IOException) throw (IOException) e;
            return chain.proceed(request); // preserve original behavior for non-I/O signing failures
        }

        Response response = chain.proceed(signed);

        // Self-healing: the server refused this cert (it rotated). Refresh the
        // cert from the remote source and retry once when it actually changed.
        if (response.code() == 403
                && "cert".equalsIgnoreCase(String.valueOf(response.header("x-anx-refused")))) {
            String usedCert = signed.header("X-Anx-Cert");
            String refreshedCert = currentCert(true);
            if (refreshedCert != null && !refreshedCert.equals(usedCert)) {
                Request resigned = null;
                try {
                    resigned = buildSignedRequest(request, api2Path, refreshedCert);
                } catch (Exception e) {
                    Log.e(TAG, "Re-signing with refreshed cert failed for " + api2Path, e);
                }
                if (resigned != null) {
                    response.close();
                    Log.i(TAG, "Cert refreshed " + usedCert + " -> " + refreshedCert
                            + ", retrying " + api2Path);
                    return chain.proceed(resigned);
                }
            }
        }
        return response;
    }

    /** Builds the encrypted + signed copy of a new_api POST request for one cert. */
    private static Request buildSignedRequest(Request request, String api2Path, String cert)
            throws Exception {
        long ts = System.currentTimeMillis() / 1000L;
        byte[] nonce16 = new byte[16];
        new java.security.SecureRandom().nextBytes(nonce16);

        byte[] session = h91b("master", hexToBytes(MASTER_HEX), SALT);
        byte[] reqKey = h91b("req", session, nonce16);
        byte[] sigKey = h91b("sig", session, nonce16);

        // 1) plaintext = original form fields "k=v&k2=v2"
        String plainBody = extractFormFields(request.body());
        // Capture parameter names/values before encryption for in-app diagnostics; device/token
        // fields are redacted by AnxDiagnosticInterceptor.
        AnxDiagnosticInterceptor.recordOriginalFormPayload(request.method(), api2Path, plainBody);
        if ("POST".equalsIgnoreCase(request.method()) && (request.body() == null || plainBody.isEmpty())) {
            MediaType originalType = request.body() == null ? null : request.body().contentType();
            throw new IOException("new_api POST form body unexpectedly empty for " + api2Path
                    + " (bodyType=" + (request.body() == null ? "<null>" : request.body().getClass().getName())
                    + ", contentType=" + (originalType == null ? "<null>" : originalType) + ")");
        }

        // 1b) Jalur desc (get_post_description & get_current_next_previous):
        //     sisipkan anx_rt + device_id persis seperti guard resmi gen-2.
        //     Tanpa anx_rt, server MENGOSONGKAN channel_url_hd/_fhd (respons
        //     hanya berisi URL SD) — terbukti dari uji langsung 2026-10-23.
        if (api2Path.contains("get_post_description") || api2Path.contains("get_current_next_previous")) {
            String devId = AnxDeviceIdentity.peekDeviceId();
            String rt = AnxDeviceIdentity.peekAnxRt();
            if (devId != null && !devId.isEmpty() && !plainBody.contains("device_id=")) {
                plainBody += "&device_id=" + URLEncoder.encode(devId, "UTF-8");
            }
            if (rt != null && !rt.isEmpty() && !plainBody.contains("anx_rt=")) {
                plainBody += "&anx_rt=" + URLEncoder.encode(rt, "UTF-8");
            }
        }

        // 2) encrypt: AES-GCM(reqKey), AAD "anx-req|<path>|<ts>", output b64(nonce12||ct+tag)
        byte[] nonce12 = new byte[12];
        new java.security.SecureRandom().nextBytes(nonce12);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(reqKey, "AES"),
                new GCMParameterSpec(128, nonce12));
        cipher.updateAAD(("anx-req|" + api2Path + "|" + ts).getBytes(StandardCharsets.UTF_8));
        byte[] ct = cipher.doFinal(plainBody.getBytes(StandardCharsets.UTF_8));
        byte[] payload = new byte[12 + ct.length];
        System.arraycopy(nonce12, 0, payload, 0, 12);
        System.arraycopy(ct, 0, payload, 12, ct.length);
        String encB64 = Base64.encodeToString(payload, Base64.NO_WRAP);
        String finalBody = "anx=" + URLEncoder.encode(encB64, "UTF-8");

        // 3) canonical signature string (VERIFIED against real capture)
        String params = sortedQueryParamValues(request.url()); // values only, sorted, '&'-joined
        String bodyHash = sha256Hex(finalBody.getBytes(StandardCharsets.UTF_8));
        String canonical = request.method() + "\n"
                + api2Path + "\n"
                + params + "\n"
                + ts + "\n"
                + VERSION_CODE + "\n"
                + cert + "\n"
                + bodyHash;
        String sig = hex(hmacSha256(sigKey, canonical.getBytes(StandardCharsets.UTF_8)));

        // 4) rebuild request
        RequestBody body = RequestBody.create(finalBody, FORM);
        return request.newBuilder()
                .method(request.method(), body)
                .header("User-Agent", "AnimeXNonton/26.10.7 (25; Android 14; Pixel 8)")
                .header("X-Anx-Ts", String.valueOf(ts))
                .header("X-Anx-N", urlSafeNoPad(nonce16))
                .header("X-Anx-Ver", VERSION_CODE)
                .header("X-Anx-Cert", cert)
                .header("X-Anx-Rsp", "1")
                .header("X-Anx-Sig", sig)
                .build();
    }

    /**
     * Returns the active cert fingerprint. On the first API2 request of the
     * process the remote source is consulted once; afterwards the in-memory
     * value is reused. A forced call (after a cert refusal) re-reads the remote
     * source, throttled so parallel refusals do not hammer it.
     */
    private static String currentCert(boolean forceRefresh) {
        synchronized (CERT_LOCK) {
            long now = System.currentTimeMillis();
            if (!forceRefresh && remoteCheckedThisProcess) return activeCert;
            if (now - lastFetchAttemptMs < MIN_FETCH_INTERVAL_MS) return activeCert;
            lastFetchAttemptMs = now;
            String fetched = fetchRemoteCert();
            if (fetched != null) {
                activeCert = fetched;
            }
            if (!forceRefresh) remoteCheckedThisProcess = true;
            return activeCert;
        }
    }

    /**
     * Fetches the cert from REMOTE_CERT_URL. The remote body must be exactly one
     * 16-char hex value (surrounding whitespace tolerated); anything else
     * (error pages, deleted-paste notices, HTML) is rejected and null returned.
     * A plain HttpURLConnection is used on purpose: this fetch must not pass
     * through the guard interceptor itself.
     */
    private static String fetchRemoteCert() {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(REMOTE_CERT_URL).openConnection();
            conn.setConnectTimeout(REMOTE_TIMEOUT_MS);
            conn.setReadTimeout(REMOTE_TIMEOUT_MS);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "okhttp/5.5.0");
            conn.setInstanceFollowRedirects(true);
            if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) return null;
            InputStream in = conn.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            char[] buf = new char[64];
            int read;
            while ((read = reader.read(buf)) != -1 && sb.length() <= 256) {
                sb.append(buf, 0, read);
            }
            reader.close();
            String candidate = sb.toString().trim().toLowerCase(java.util.Locale.US);
            if (candidate.length() != 16) return null;
            for (int k = 0; k < candidate.length(); k++) {
                char c = candidate.charAt(k);
                boolean hexChar = (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f');
                if (!hexChar) return null;
            }
            return candidate;
        } catch (Exception e) {
            Log.w(TAG, "Remote cert fetch failed, keeping " + activeCert, e);
            return null;
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    /**
     * Read the *serialized* url-encoded body before encrypting it.
     *
     * Do not rely only on `body instanceof FormBody`: Retrofit versions can supply a
     * different RequestBody implementation even for @FormUrlEncoded calls. The old
     * check silently returned an empty string, so a valid request was encrypted as
     * `anx=<encryption of empty text>` and the API answered with no posts.
     */
    private static String extractFormFields(RequestBody body) throws IOException {
        if (body == null) return "";
        MediaType type = body.contentType();
        boolean urlEncoded = type != null
                && "application".equalsIgnoreCase(type.type())
                && "x-www-form-urlencoded".equalsIgnoreCase(type.subtype());
        if (urlEncoded) {
            Buffer buffer = new Buffer();
            body.writeTo(buffer);
            return buffer.readUtf8();
        }
        // Compatibility fallback for FormBody implementations with an absent/unusual content type.
        if (body instanceof FormBody) {
            FormBody form = (FormBody) body;
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < form.size(); i++) {
                if (sb.length() > 0) sb.append('&');
                sb.append(URLEncoder.encode(form.name(i), "UTF-8"))
                  .append('=')
                  .append(URLEncoder.encode(form.value(i), "UTF-8"));
            }
            return sb.toString();
        }
        return "";
    }

    /** i91.a(HttpUrl): query param VALUES (not k=v), sorted, joined with '&'. */
    private static String sortedQueryParamValues(HttpUrl url) {
        List<String> values = new ArrayList<>();
        for (String name : url.queryParameterNames()) {
            for (String v : url.queryParameterValues(name)) values.add(v == null ? "" : v);
        }
        Collections.sort(values);
        StringBuilder sb = new StringBuilder();
        for (String v : values) {
            if (sb.length() > 0) sb.append('&');
            sb.append(v);
        }
        return sb.toString();
    }

    private static byte[] hmacSha256(byte[] key, byte[] msg) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return mac.doFinal(msg);
    }

    /** h91.b: two-layer HMAC key derivation with label + 0x01. */
    static byte[] h91b(String label, byte[] key, byte[] nonce) throws GeneralSecurityException {
        byte[] effectiveNonce = nonce.length == 0 ? new byte[32] : nonce;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(effectiveNonce, "HmacSHA256"));
        byte[] first = mac.doFinal(key);
        mac.init(new SecretKeySpec(first, "HmacSHA256"));
        return mac.doFinal((label + "\u0001").getBytes(StandardCharsets.UTF_8));
    }

    private static String sha256Hex(byte[] data) throws GeneralSecurityException {
        return hex(MessageDigest.getInstance("SHA-256").digest(data));
    }

    private static String hex(byte[] b) {
        StringBuilder sb = new StringBuilder(b.length * 2);
        for (byte x : b) sb.append(String.format("%02x", x & 0xff));
        return sb.toString();
    }

    private static byte[] hexToBytes(String hex) {
        byte[] out = new byte[hex.length() / 2];
        for (int i = 0; i < out.length; i++) {
            out[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        return out;
    }

    /** x-anx-n: URL-safe Base64 without padding. */
    private static String urlSafeNoPad(byte[] data) {
        return Base64.encodeToString(data, Base64.NO_WRAP | Base64.URL_SAFE)
                .replace("\n", "").replace("=", "");
    }
}
