package dev.qlcstream.search.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("qlc-stream.prowlarr")
public record SearchProwlarrProperties(String baseUrl, String apiKey) {
    public boolean configured() { return baseUrl != null && !baseUrl.isBlank() && apiKey != null && !apiKey.isBlank(); }
}
