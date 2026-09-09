package dev.qlcstream.downloads.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.qlcstream.downloads.infrastructure.persistence.SpringDataDownloadRepository;
import dev.qlcstream.downloads.infrastructure.qbittorrent.QbittorrentClient;

@Service
public class DownloadControlService {
    private final SpringDataDownloadRepository downloads;
    private final QbittorrentClient qbittorrent;

    public DownloadControlService(SpringDataDownloadRepository downloads, QbittorrentClient qbittorrent) {
        this.downloads = downloads;
        this.qbittorrent = qbittorrent;
    }

    @Transactional
    public void control(UUID id, Action action) {
        var download = downloads.findById(id).orElseThrow(() -> new IllegalArgumentException("Download não encontrado."));
        var hash = download.infoHash();
        if (hash == null || hash.isBlank()) throw new IllegalStateException("O torrent ainda não possui metadados.");
        switch (action) {
            case PAUSE -> { qbittorrent.pause(hash); download.markStatus("PAUSED"); }
            case RESUME -> { qbittorrent.resume(hash); download.markStatus("QUEUED"); }
            case CANCEL -> { qbittorrent.remove(hash); download.markRemoved(); }
        }
    }

    public enum Action { PAUSE, RESUME, CANCEL }
}
