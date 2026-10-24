package miku.moe.app.api;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Identitas perangkat SINTETIS untuk Anime X Nonton gen-2 (new_api).
 *
 * Keputusan desain (koreksi pemilik): identitas TIDAK memakai ANDROID_ID asli
 * perangkat dan TIDAK memakai Build.MANUFACTURER / Build.MODEL asli. Semua
 * nilai dibangkitkan ACAK sekali per install, lalu disimpan persisten di
 * SharedPreferences — jadi stabil antar-run (tidak berubah) tetapi berbeda
 * antar pengguna/install:
 *  - device_id   : hex acak 16 char — format WAJIB meniru ANDROID_ID karena
 *                  server menolak format lain (register_user balas 500 untuk
 *                  UUID; terbukti dari uji langsung 2026-10-23). Nilai yang
 *                  sama dipakai sebagai android_id.
 *  - android_id  : nilai yang sama dengan device_id (di app resmi device_id
 *                  memang adalah ANDROID_ID perangkat).
 *  - anx_rt      : hex acak 40 char, persisten. Guard menyisipkannya ke
 *                  request desc; tanpa field ini server mengosongkan URL
 *                  HD/FHD (hanya SD yang dikirim).
 *  - device_name : dipilih acak sekali dari daftar nama perangkat Android
 *                  yang wajar (merek + model populer).
 *  - device_token: kosong untuk saat ini (diisi bila FCM dihubungkan nanti).
 *
 * ensureRegistered() mendaftarkan identitas ini ke endpoint register_user
 * (sekali per install, ditandai flag SharedPreferences) dan memeriksa
 * device_status tiap start. Seluruhnya fire-and-forget di thread latar dan
 * dibungkus try/catch total: kegagalan apa pun tidak boleh mengganggu aplikasi.
 */
public final class AnxDeviceIdentity {
    private static final String PREFS = "anx_device_identity";
    private static final String KEY_DEVICE_ID = "device_id";
    private static final String KEY_ANDROID_ID = "android_id";
    private static final String KEY_ANX_RT = "anx_rt";
    private static final String KEY_LAST_ROTATE_MS = "anx_last_rotate_ms";
    private static final long ROTATE_COOLDOWN_MS = 10L * 60L * 1000L;

    private static volatile String cachedDeviceId;
    private static volatile String cachedAnxRt;
    private static final String KEY_DEVICE_NAME = "device_name";
    private static final String KEY_REGISTERED = "anx_device_registered";
    private static final String KEY_BLOCKED = "anx_device_blocked";

    private static final String USER_AGENT = "AnimeXNonton/26.10.7 (25; Android 14; Pixel 8)";

    /** Nama perangkat wajar (merek + model populer) untuk identitas sintetis. */
    private static final String[] DEVICE_NAMES = {
            "Samsung Galaxy S23", "Samsung Galaxy S22", "Samsung Galaxy A54",
            "Samsung Galaxy A34", "Xiaomi 13", "Xiaomi 12", "Redmi Note 12",
            "Redmi Note 11", "POCO X5", "Google Pixel 8", "Google Pixel 7",
            "Google Pixel 6a", "OPPO Reno10", "OPPO A78", "vivo V29",
            "vivo Y36", "Realme 11 Pro", "Realme C55", "Infinix Note 30",
            "Infinix Hot 30", "ASUS Zenfone 10", "OnePlus 11", "Nokia G42"
    };

    private static OkHttpClient client;

    private AnxDeviceIdentity() {}

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    /**
     * device_id sintetis = hex acak 16 char (format ANDROID_ID), persisten
     * per install. Server menolak format device_id lain (UUID -> HTTP 500
     * pada register_user), jadi device_id dan android_id adalah nilai yang
     * sama, seperti di aplikasi resmi.
     */
    public static synchronized String getDeviceId(Context context) {
        SharedPreferences p = prefs(context);
        String value = p.getString(KEY_DEVICE_ID, null);
        if (value == null || value.isEmpty() || value.contains("-")) {
            value = p.getString(KEY_ANDROID_ID, null);
            if (value == null || value.isEmpty()) value = randomHex(16);
            p.edit().putString(KEY_DEVICE_ID, value)
                    .putString(KEY_ANDROID_ID, value).apply();
        }
        cachedDeviceId = value;
        return value;
    }

    /** android_id sintetis — nilai yang sama dengan device_id. */
    public static synchronized String getAndroidId(Context context) {
        return getDeviceId(context);
    }

    /** anx_rt sintetis (hex acak 40 char, persisten) — kunci pembuka URL HD/FHD. */
    public static synchronized String getAnxRt(Context context) {
        SharedPreferences p = prefs(context);
        String value = p.getString(KEY_ANX_RT, null);
        if (value == null || value.isEmpty()) {
            value = randomHex(40);
            p.edit().putString(KEY_ANX_RT, value).apply();
        }
        cachedAnxRt = value;
        return value;
    }

    /** Nilai device_id di memori (untuk interceptor tanpa Context); null bila belum dibangkitkan. */
    public static String peekDeviceId() {
        return cachedDeviceId;
    }

    /** Nilai anx_rt di memori (untuk interceptor tanpa Context); null bila belum dibangkitkan. */
    public static String peekAnxRt() {
        return cachedAnxRt;
    }

    /** Nama perangkat sintetis (dipilih acak sekali, persisten per install). */
    public static synchronized String getDeviceName(Context context) {
        SharedPreferences p = prefs(context);
        String value = p.getString(KEY_DEVICE_NAME, null);
        if (value == null || value.isEmpty()) {
            value = DEVICE_NAMES[new SecureRandom().nextInt(DEVICE_NAMES.length)];
            p.edit().putString(KEY_DEVICE_NAME, value).apply();
        }
        return value;
    }

    /** Token perangkat (FCM) — belum dihubungkan; selalu kosong untuk saat ini. */
    public static String getDeviceToken() {
        return "";
    }

    public static boolean isDeviceBlocked(Context context) {
        return prefs(context).getBoolean(KEY_BLOCKED, false);
    }

    /**
     * Daftarkan identitas sintetis ke server (sekali per install) dan periksa
     * status perangkat. Fire-and-forget: jalan di thread latar, tidak pernah
     * melempar ke pemanggil.
     */
    public static void ensureRegistered(final Context context) {
        try {
            final Context app = context.getApplicationContext();
            new Thread(() -> {
                try {
                    runRegistration(app);
                } catch (Throwable ignored) {
                    // Identitas perangkat bersifat best-effort; abaikan semua kegagalan.
                }
            }, "anx-device-identity").start();
        } catch (Throwable ignored) {
            // Tidak boleh mengganggu startup aplikasi.
        }
    }

    private static void runRegistration(Context context) throws Exception {
        SharedPreferences p = prefs(context);
        String deviceId = getDeviceId(context);
        getAnxRt(context); // pancing cache statis agar guard bisa menyisipkan anx_rt ke desc

        registerIfNeeded(context, deviceId);
        boolean blocked = checkBlocked(context, deviceId);
        p.edit().putBoolean(KEY_BLOCKED, blocked).apply();

        // Auto-ganti identitas: server MENGONFIRMASI identitas ini diblokir ->
        // buang identitas lama, bangkitkan yang baru, daftar ulang, cek ulang.
        // Pengaman: maksimal 1x rotasi per start + jeda minimum antar-rotasi,
        // agar tidak berputar tanpa henti bila pemblokirannya bukan soal
        // identitas (mis. berbasis IP). Error jaringan TIDAK pernah memicu
        // rotasi: checkBlocked hanya true dari respons 200 berisi flag blocked.
        if (blocked) {
            long last = p.getLong(KEY_LAST_ROTATE_MS, 0L);
            if (System.currentTimeMillis() - last >= ROTATE_COOLDOWN_MS) {
                rotateIdentity(context);
                String freshId = getDeviceId(context);
                getAnxRt(context);
                registerIfNeeded(context, freshId);
                boolean stillBlocked = checkBlocked(context, freshId);
                p.edit().putBoolean(KEY_BLOCKED, stillBlocked)
                        .putLong(KEY_LAST_ROTATE_MS, System.currentTimeMillis()).apply();
            }
        }
    }

    private static void registerIfNeeded(Context context, String deviceId) throws Exception {
        SharedPreferences p = prefs(context);
        if (p.getBoolean(KEY_REGISTERED, false)) return;
        FormBody form = new FormBody.Builder()
                .add("device_id", deviceId)
                .add("device_name", getDeviceName(context))
                .add("device_token", getDeviceToken())
                .build();
        Request request = new Request.Builder()
                .url(AnxBaseUrl.apiBase() + "register_user/")
                .header("User-Agent", USER_AGENT)
                .post(form)
                .build();
        try (Response response = client().newCall(request).execute()) {
            if (response.isSuccessful()) {
                p.edit().putBoolean(KEY_REGISTERED, true).apply();
            }
        }
    }

    /** true HANYA bila server menjawab 200 dengan flag blocked; error jaringan -> false. */
    private static boolean checkBlocked(Context context, String deviceId) {
        try {
            FormBody statusForm = new FormBody.Builder()
                    .add("device_id", deviceId)
                    .build();
            Request statusRequest = new Request.Builder()
                    .url(AnxBaseUrl.apiBase() + "device_status/")
                    .header("User-Agent", USER_AGENT)
                    .post(statusForm)
                    .build();
            try (Response response = client().newCall(statusRequest).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    JSONObject json = new JSONObject(response.body().string());
                    return json.optBoolean("device_blocked", json.optBoolean("blocked", false));
                }
            }
        } catch (Exception ignored) {
            // Status tidak terkonfirmasi -> jangan rotasi.
        }
        return false;
    }

    /** Buang seluruh identitas sintetis; para getter akan membangkitkan yang baru. */
    private static void rotateIdentity(Context context) {
        SharedPreferences p = prefs(context);
        p.edit().remove(KEY_DEVICE_ID).remove(KEY_ANDROID_ID).remove(KEY_ANX_RT)
                .remove(KEY_DEVICE_NAME).remove(KEY_REGISTERED).remove(KEY_BLOCKED).apply();
        cachedDeviceId = null;
        cachedAnxRt = null;
    }

    /**
     * Klien khusus identitas: request-nya ikut ditandatangani AnxGuardInterceptor
     * (register_user & device_status ada di daftar path new_api guard) dan
     * responsnya didekripsi AnxResponseDecryptInterceptor, sama seperti pemanggil
     * ANX lainnya di aplikasi ini.
     */
    private static synchronized OkHttpClient client() {
        if (client == null) {
            client = new OkHttpClient.Builder()
                    .addInterceptor(new AnxGuardInterceptor())
                    .addInterceptor(new AnxResponseDecryptInterceptor())
                    .connectTimeout(15, TimeUnit.SECONDS)
                    .readTimeout(15, TimeUnit.SECONDS)
                    .writeTimeout(15, TimeUnit.SECONDS)
                    .build();
        }
        return client;
    }

    private static String randomHex(int length) {
        char[] hex = "0123456789abcdef".toCharArray();
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) sb.append(hex[random.nextInt(hex.length)]);
        return sb.toString();
    }
}
