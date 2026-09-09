package dev.qlcstream.downloads.infrastructure.qbittorrent;

import java.io.IOException;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import dev.qlcstream.downloads.config.DownloadQbittorrentProperties;

@Component
public class QbittorrentClient {

    private final DownloadQbittorrentProperties properties;

    public QbittorrentClient(DownloadQbittorrentProperties properties) {
        this.properties = properties;
    }

    public void add(String acquisitionRef, String savePath) {
        if (!properties.configured()) {
            throw new QbittorrentUnavailableException("qBittorrent não está configurado.");
        }
        try {
            var client = HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
                    .connectTimeout(Duration.ofSeconds(5)).build();
            var login = post(client, "/api/v2/auth/login", Map.of("username", properties.username(), "password", properties.password()));
            if (login.statusCode() < 200 || login.statusCode() >= 300) {
                throw new QbittorrentUnavailableException("Não foi possível autenticar no qBittorrent.");
            }
            var add = post(client, "/api/v2/torrents/add", Map.of("urls", acquisitionRef, "savepath", savePath));
            if (add.statusCode() < 200 || add.statusCode() >= 300) {
                throw new QbittorrentUnavailableException("O qBittorrent recusou esta fonte de download.");
            }
        } catch (IOException exception) {
            throw new QbittorrentUnavailableException("Não foi possível alcançar o qBittorrent.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new QbittorrentUnavailableException("A comunicação com o qBittorrent foi interrompida.", exception);
        }
    }

    private HttpResponse<String> post(HttpClient client, String path, Map<String, String> form) throws IOException, InterruptedException {
        var encoded = form.entrySet().stream()
                .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8) + "="
                        + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
        var request = HttpRequest.newBuilder(URI.create(properties.baseUrl() + path)).timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(encoded)).build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    public static class QbittorrentUnavailableException extends RuntimeException {
        QbittorrentUnavailableException(String message) {
            super(message);
        }

        QbittorrentUnavailableException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
