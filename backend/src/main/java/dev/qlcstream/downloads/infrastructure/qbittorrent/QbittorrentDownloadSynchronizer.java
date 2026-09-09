package dev.qlcstream.downloads.infrastructure.qbittorrent;

import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import dev.qlcstream.downloads.infrastructure.persistence.SpringDataDownloadRepository;

@Component
public class QbittorrentDownloadSynchronizer {

    private static final Set<String> FINAL_STATUSES = Set.of("COMPLETED", "SEEDING", "CANCELED", "REMOVED");

    private final SpringDataDownloadRepository downloads;
    private final QbittorrentClient qbittorrent;

    public QbittorrentDownloadSynchronizer(SpringDataDownloadRepository downloads, QbittorrentClient qbittorrent) {
        this.downloads = downloads;
        this.qbittorrent = qbittorrent;
    }

    @Scheduled(fixedDelayString = "${qlc-stream.qbittorrent.sync-delay:PT5S}")
    @Transactional
    public void synchronize() {
        var torrentsByPath = qbittorrent.torrents().stream()
                .collect(Collectors.toMap(QbittorrentClient.TorrentSnapshot::savePath, Function.identity(), (first, ignored) -> first));
        for (var download : downloads.findByStatusNotIn(FINAL_STATUSES)) {
            var torrent = torrentsByPath.get("/downloads/" + download.relativeDirectory());
            if (torrent != null) {
                download.synchronize(torrent.hash(), torrent.state(), torrent.progress(), torrent.size(), torrent.downloaded(),
                        torrent.downloadSpeedBps(), torrent.eta(), statusFor(torrent.state()));
            }
        }
    }

    private static String statusFor(String state) {
        return switch (state) {
            case "metaDL" -> "METADATA";
            case "downloading", "forcedDL" -> "DOWNLOADING";
            case "stalledDL" -> "STALLED";
            case "checkingDL", "checkingUP", "checkingResumeData" -> "CHECKING";
            case "pausedDL", "pausedUP", "stoppedDL", "stoppedUP" -> "PAUSED";
            case "uploading", "forcedUP", "stalledUP" -> "SEEDING";
            case "error", "missingFiles", "unknown" -> "ERROR";
            default -> "QUEUED";
        };
    }
}
