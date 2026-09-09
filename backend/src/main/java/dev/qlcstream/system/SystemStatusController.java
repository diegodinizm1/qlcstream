package dev.qlcstream.system;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.qlcstream.system.config.ProwlarrProperties;
import dev.qlcstream.system.config.QbittorrentProperties;
import dev.qlcstream.system.config.TmdbConfigurationProperties;

@RestController
@RequestMapping("/api/system")
class SystemStatusController {

    private final TmdbConfigurationProperties tmdb;
    private final ProwlarrProperties prowlarr;
    private final QbittorrentProperties qbittorrent;

    SystemStatusController(TmdbConfigurationProperties tmdb, ProwlarrProperties prowlarr, QbittorrentProperties qbittorrent) {
        this.tmdb = tmdb;
        this.prowlarr = prowlarr;
        this.qbittorrent = qbittorrent;
    }

    @GetMapping("/status")
    Map<String, Object> status() {
        return Map.of(
                "application", "QLC Stream",
                "status", "ready",
                "timestamp", Instant.now());
    }

    @GetMapping("/integrations")
    List<IntegrationResponse> integrations() {
        return List.of(
                new IntegrationResponse("tmdb", tmdb.configured()),
                new IntegrationResponse("prowlarr", prowlarr.configured()),
                new IntegrationResponse("qbittorrent", qbittorrent.configured()));
    }

    record IntegrationResponse(String id, boolean configured) { }
}
