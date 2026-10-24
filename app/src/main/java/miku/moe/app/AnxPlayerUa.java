package miku.moe.app;

import android.os.Build;

/**
 * Player User-Agent required by the Anime X Nonton video CDN (whatbox).
 *
 * The CDN validates the User-Agent of whoever fetches a signed video URL:
 * the link signature (md5/expires) alone is not enough. Requests made with
 * a browser UA, a Dalvik UA, or any other app brand are rejected with
 * HTTP 403 even when the link itself is valid.
 *
 * The official app builds its player UA with ExoPlayer's
 * Util.getUserAgent(context, "Player Anime X Nonton v26.10.7"), producing:
 *   Player Anime X Nonton v26.10.7/25 (Linux; Android <release>; <model>)
 * The CDN's rule (verified empirically): the UA must start with
 * "Player Anime", carry a dotted version followed by "/<code>", and a
 * parenthesised segment containing "Android". The version/code/model/
 * release values themselves are free.
 *
 * Every ExoPlayer data source that can play an ANX episode must use this
 * UA; that was the missing piece that made episode videos fail to play.
 */
public final class AnxPlayerUa {

    private AnxPlayerUa() {}

    public static String userAgent() {
        String release = Build.VERSION.RELEASE;
        if (release == null || release.trim().isEmpty()) release = "14";
        String model = Build.MODEL;
        if (model == null || model.trim().isEmpty()) model = "Android";
        return "Player Anime X Nonton v26.10.7/25 (Linux; Android "
                + release + "; " + model + ")";
    }
}
