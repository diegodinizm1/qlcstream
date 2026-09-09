package dev.qlcstream.catalog.infrastructure.tmdb;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("qlc-stream.tmdb")
public record TmdbProperties(String baseUrl, String apiToken) {

    public boolean configured() {
        return apiToken != null && !apiToken.isBlank();
    }
}
