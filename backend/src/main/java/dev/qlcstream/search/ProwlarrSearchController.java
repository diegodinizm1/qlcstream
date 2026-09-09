package dev.qlcstream.search;

import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import dev.qlcstream.search.config.SearchProwlarrProperties;

@RestController
@RequestMapping("/api/search")
public class ProwlarrSearchController {
    private final RestClient client;
    private final SearchProwlarrProperties properties;

    public ProwlarrSearchController(SearchProwlarrProperties properties) {
        this.properties = properties;
        this.client = RestClient.builder().baseUrl(properties.baseUrl()).build();
    }

    @GetMapping("/releases")
    List<ReleaseResponse> releases(@RequestParam @NotBlank String query) {
        if (!properties.configured()) throw new IllegalStateException("Prowlarr não está configurado.");
        var response = client.get().uri(uri -> uri.path("/api/v1/search").queryParam("query", query).build())
                .header("X-Api-Key", properties.apiKey()).retrieve().body(ProwlarrRelease[].class);
        if (response == null) return List.of();
        return java.util.Arrays.stream(response).map(ReleaseResponse::from).toList();
    }

    record ProwlarrRelease(String title, String protocol, String indexer, Long size, Integer seeders, Integer leechers,
            String downloadUrl, String infoUrl, Instant publishDate) { }
    record ReleaseResponse(String title, String protocol, String indexer, Long size, Integer seeders, Integer leechers,
            String downloadUrl, String infoUrl, Instant publishDate) {
        static ReleaseResponse from(ProwlarrRelease release) { return new ReleaseResponse(release.title(), release.protocol(), release.indexer(), release.size(), release.seeders(), release.leechers(), release.downloadUrl(), release.infoUrl(), release.publishDate()); }
    }
}
