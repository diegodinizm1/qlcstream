package dev.qlcstream.downloads.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("qlc-stream.qbittorrent")
public record DownloadQbittorrentProperties(String baseUrl, String username, String password) {
    public boolean configured() {
        return present(baseUrl) && present(username) && present(password);
    }

    private static boolean present(String value) {
        return value != null && !value.isBlank();
    }
}
