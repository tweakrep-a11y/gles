package miku.moe.app.api;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.util.concurrent.TimeUnit;

import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Base URL dinamis Anime X Nonton gen-2 (new_api) — meniru pola aplikasi resmi:
 *
 *  - Alamat aktif disimpan di SharedPreferences (file "anx_config", kunci
 *    "anx_base_url"), format persis server_url resmi, contoh:
 *    "https://api.wincamp.web.id/animexnonton" (tanpa slash akhir).
 *  - Bila belum ada nilai tersimpan (atau nilainya tidak valid), dipakai
 *    FALLBACK hardcoded — sama seperti fallback di factory klien resmi.
 *  - Tiap start aplikasi, refreshAsync() memanggil get_config memakai base
 *    yang sedang aktif; bila respons memuat config.server_url yang valid dan
 *    berbeda, nilai baru disimpan dan dipakai untuk semua request berikutnya.
 *    Dengan ini aplikasi ikut pindah domain mengikuti sumber resmi tanpa
 *    perlu update aplikasi.
 *
 * Semua klien ANX wajib mengambil alamat dari kelas ini (base()/apiBase()),
 * jangan menulis literal host API di tempat lain.
 */
public final class AnxBaseUrl {
    private static final String FALLBACK = "https://api.wincamp.web.id/animexnonton";
    private static final String PREFS = "anx_config";
    private static final String KEY_BASE_URL = "anx_base_url";
    private static final String USER_AGENT = "AnimeXNonton/26.10.7 (25; Android 14; Pixel 8)";

    private static volatile String cached;
    private static OkHttpClient client;

    private AnxBaseUrl() {}

    /** Baca nilai tersimpan ke cache statis. Panggil sekali dari Application.onCreate. */
    public static void init(Context context) {
        try {
            SharedPreferences p = context.getApplicationContext()
                    .getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String stored = p.getString(KEY_BASE_URL, null);
            if (isValid(stored)) {
                cached = normalize(stored);
            }
        } catch (Throwable ignored) {
            // Cache tetap kosong -> base() memakai FALLBACK.
        }
    }

    /** Base aktif: nilai tersimpan bila ada, selain itu fallback hardcoded. Tanpa Context. */
    public static String base() {
        String value = cached;
        return value != null ? value : FALLBACK;
    }

    /** Base khusus API gen-2: base() + "/new_api/" (dengan slash akhir, siap ditempel nama method). */
    public static String apiBase() {
        return base() + "/new_api/";
    }

    /**
     * Segarkan base URL dari get_config (pola resmi: splash/start). Jalan di
     * thread latar, try/catch total — kegagalan apa pun membiarkan base yang
     * sedang aktif tetap dipakai.
     */
    public static void refreshAsync(final Context context) {
        try {
            final Context app = context.getApplicationContext();
            new Thread(() -> {
                try {
                    runRefresh(app);
                } catch (Throwable ignored) {
                    // Best-effort; abaikan semua kegagalan.
                }
            }, "anx-base-url").start();
        } catch (Throwable ignored) {
            // Tidak boleh mengganggu startup aplikasi.
        }
    }

    private static void runRefresh(Context context) throws Exception {
        FormBody form = new FormBody.Builder()
                .add("version_code", "25")
                .build();
        Request request = new Request.Builder()
                .url(apiBase() + "get_config/")
                .header("User-Agent", USER_AGENT)
                .post(form)
                .build();
        try (Response response = client().newCall(request).execute()) {
            if (!response.isSuccessful() || response.body() == null) return;
            JSONObject json = new JSONObject(response.body().string());
            JSONObject config = json.optJSONObject("config");
            if (config == null) return;
            String serverUrl = config.optString("server_url", "");
            if (!isValid(serverUrl)) return;
            String normalized = normalize(serverUrl);
            if (!normalized.equals(base())) {
                context.getApplicationContext()
                        .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                        .edit().putString(KEY_BASE_URL, normalized).apply();
                cached = normalized;
            }
        }
    }

    /** Validasi longgar: URL http/https utuh, tanpa spasi, panjang wajar. */
    private static boolean isValid(String value) {
        if (value == null) return false;
        String v = value.trim();
        if (v.length() < 10 || v.length() > 200) return false;
        if (!v.startsWith("http://") && !v.startsWith("https://")) return false;
        if (!v.contains("://")) return false;
        for (int i = 0; i < v.length(); i++) {
            if (Character.isWhitespace(v.charAt(i))) return false;
        }
        return true;
    }

    /** Normalisasi: trim + buang semua trailing "/". */
    private static String normalize(String value) {
        String v = value.trim();
        while (v.endsWith("/")) {
            v = v.substring(0, v.length() - 1);
        }
        return v;
    }

    /**
     * Klien khusus refresh config: request-nya ikut ditandatangani
     * AnxGuardInterceptor (get_config ada di daftar path new_api guard) dan
     * responsnya didekripsi AnxResponseDecryptInterceptor — pola yang sama
     * seperti client() di AnxDeviceIdentity.
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
}
