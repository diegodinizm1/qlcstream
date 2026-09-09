package dev.qlcstream.system.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("qlc-stream.prowlarr")
public record ProwlarrProperties(String baseUrl, String apiKey) {
    public boolean configured() { return present(baseUrl) && present(apiKey); }
    private static boolean present(String value) { return value != null && !value.isBlank(); }
}
