package dev.qlcstream.downloads.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.qlcstream.downloads.infrastructure.persistence.DownloadRow;
import dev.qlcstream.downloads.infrastructure.persistence.SpringDataDownloadRepository;
import dev.qlcstream.downloads.infrastructure.qbittorrent.QbittorrentClient;
import dev.qlcstream.library.LocalStorageSettings;

@Service
public class DownloadSubmissionService {

    private final SpringDataDownloadRepository downloads;
    private final QbittorrentClient qbittorrent;
    private final LocalStorageSettings storageSettings;

    public DownloadSubmissionService(SpringDataDownloadRepository downloads, QbittorrentClient qbittorrent,
            LocalStorageSettings storageSettings) {
        this.downloads = downloads;
        this.qbittorrent = qbittorrent;
        this.storageSettings = storageSettings;
    }

    @Transactional
    public SubmittedDownload submit(DownloadRequest request) {
        var movieId = downloads.findMovieIdByTmdbId(request.movieTmdbId());
        if (movieId == null) {
            throw new MovieNotAvailableException();
        }

        var id = UUID.randomUUID();
        var relativeDirectory = storageSettings.downloadDirectory() + "/" + id;
        qbittorrent.add(request.acquisitionRef(), "/downloads/" + relativeDirectory);
        downloads.save(DownloadRow.queued(movieId, id, request.releaseTitle(), request.acquisitionRef(), request.indexerName(),
                request.resolutionHeight(), request.sourceType(), request.dynamicRange(), relativeDirectory));
        return new SubmittedDownload(id, "QUEUED");
    }

    @Transactional
    public SubmittedDownload submitSeries(SeriesDownloadRequest request) {
        var id = UUID.randomUUID();
        var relativeDirectory = storageSettings.downloadDirectory() + "/" + id;
        qbittorrent.add(request.acquisitionRef(), "/downloads/" + relativeDirectory);
        downloads.save(DownloadRow.queuedSeries(request.seriesTmdbId(), request.seriesTitle(), request.posterPath(), request.seasonNumber(), request.episodeNumber(), id, request.releaseTitle(), request.acquisitionRef(), request.indexerName(), request.resolutionHeight(), request.sourceType(), request.dynamicRange(), relativeDirectory));
        return new SubmittedDownload(id, "QUEUED");
    }

    public record SeriesDownloadRequest(long seriesTmdbId, String seriesTitle, String posterPath, Integer seasonNumber, Integer episodeNumber, String releaseTitle, String acquisitionRef, String indexerName, Integer resolutionHeight, String sourceType, String dynamicRange) {
    }

    public record DownloadRequest(long movieTmdbId, String releaseTitle, String acquisitionRef, String indexerName,
            Integer resolutionHeight, String sourceType, String dynamicRange) {
    }

    public record SubmittedDownload(UUID id, String status) {
    }

    public static class MovieNotAvailableException extends RuntimeException {
    }
}
