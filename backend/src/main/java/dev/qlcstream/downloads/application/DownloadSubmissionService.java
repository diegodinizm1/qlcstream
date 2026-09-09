package dev.qlcstream.downloads.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.qlcstream.downloads.infrastructure.persistence.DownloadRow;
import dev.qlcstream.downloads.infrastructure.persistence.SpringDataDownloadRepository;
import dev.qlcstream.downloads.infrastructure.qbittorrent.QbittorrentClient;

@Service
public class DownloadSubmissionService {

    private final SpringDataDownloadRepository downloads;
    private final QbittorrentClient qbittorrent;

    public DownloadSubmissionService(SpringDataDownloadRepository downloads, QbittorrentClient qbittorrent) {
        this.downloads = downloads;
        this.qbittorrent = qbittorrent;
    }

    @Transactional
    public SubmittedDownload submit(DownloadRequest request) {
        var movieId = downloads.findMovieIdByTmdbId(request.movieTmdbId());
        if (movieId == null) {
            throw new MovieNotAvailableException();
        }

        var id = UUID.randomUUID();
        var relativeDirectory = "incoming/" + id;
        qbittorrent.add(request.acquisitionRef(), "/downloads/" + relativeDirectory);
        downloads.save(DownloadRow.queued(movieId, id, request.releaseTitle(), request.acquisitionRef(), request.indexerName(),
                request.resolutionHeight(), request.sourceType(), request.dynamicRange()));
        return new SubmittedDownload(id, "QUEUED");
    }

    public record DownloadRequest(long movieTmdbId, String releaseTitle, String acquisitionRef, String indexerName,
            Integer resolutionHeight, String sourceType, String dynamicRange) {
    }

    public record SubmittedDownload(UUID id, String status) {
    }

    public static class MovieNotAvailableException extends RuntimeException {
    }
}
