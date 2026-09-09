package dev.qlcstream.downloads.infrastructure.qbittorrent;

import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import dev.qlcstream.downloads.infrastructure.persistence.SpringDataDownloadRepository;
import dev.qlcstream.library.LocalLibraryRegistrar;
import dev.qlcstream.downloads.infrastructure.web.DownloadUpdatePublisher;

@Component
public class QbittorrentDownloadSynchronizer {

    private static final Set<String> FINAL_STATUSES = Set.of("COMPLETED", "CANCELED", "REMOVED");

    private final SpringDataDownloadRepository downloads;
    private final QbittorrentClient qbittorrent;
    private final LocalLibraryRegistrar library;
    private final DownloadUpdatePublisher updates;

    public QbittorrentDownloadSynchronizer(SpringDataDownloadRepository downloads, QbittorrentClient qbittorrent,
            LocalLibraryRegistrar library, DownloadUpdatePublisher updates) {
        this.downloads = downloads;
        this.qbittorrent = qbittorrent;
        this.library = library;
        this.updates = updates;
    }

    @Scheduled(fixedDelayString = "${qlc-stream.qbittorrent.sync-delay:PT5S}")
    @Transactional
    public void synchronize() {
        var torrentsByPath = qbittorrent.torrents().stream()
                .collect(Collectors.toMap(QbittorrentClient.TorrentSnapshot::savePath, Function.identity(), (first, ignored) -> first));
        var changed = false;
        for (var download : downloads.findByStatusNotIn(FINAL_STATUSES)) {
            var torrent = torrentsByPath.get("/downloads/" + download.relativeDirectory());
            if (torrent != null) {
                var status = statusFor(torrent.state());
                changed |= download.synchronize(torrent.hash(), torrent.state(), torrent.progress(), torrent.size(), torrent.downloaded(),
                        torrent.downloadSpeedBps(), torrent.eta(), status);
                if (status.equals("SEEDING") || status.equals("COMPLETED")) {
                    library.registerCompletedDownload(download.movieId(), download.id(), download.relativeDirectory());
                    if (!library.hasPresentVideo(download.id())) {
                        qbittorrent.remove(torrent.hash());
                        download.markRemoved();
                        changed = true;
                    }
                }
            }
        }
        if (changed) updates.publish();
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
