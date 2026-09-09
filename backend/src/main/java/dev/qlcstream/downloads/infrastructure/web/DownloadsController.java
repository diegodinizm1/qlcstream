package dev.qlcstream.downloads.infrastructure.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import dev.qlcstream.downloads.application.DownloadSubmissionService;
import dev.qlcstream.downloads.application.port.in.BrowseDownloadsUseCase;
import dev.qlcstream.downloads.domain.DownloadSummary;

@RestController
@RequestMapping("/api/downloads")
public class DownloadsController {

    private final BrowseDownloadsUseCase browseDownloads;
    private final DownloadSubmissionService submissions;

    public DownloadsController(BrowseDownloadsUseCase browseDownloads, DownloadSubmissionService submissions) {
        this.browseDownloads = browseDownloads;
        this.submissions = submissions;
    }

    @GetMapping
    List<DownloadResponse> active() {
        return browseDownloads.active().stream().map(DownloadResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    SubmittedResponse submit(@Valid @RequestBody CreateDownloadRequest request) {
        var submitted = submissions.submit(new DownloadSubmissionService.DownloadRequest(request.movieTmdbId(), request.releaseTitle(),
                request.acquisitionRef(), request.indexerName(), request.resolutionHeight(), request.sourceType(), request.dynamicRange()));
        return new SubmittedResponse(submitted.id(), submitted.status());
    }

    record CreateDownloadRequest(@Positive long movieTmdbId, @NotBlank String releaseTitle, @NotBlank String acquisitionRef,
            String indexerName, @Positive Integer resolutionHeight, String sourceType, String dynamicRange) {
    }

    record SubmittedResponse(UUID id, String status) {
    }

    record DownloadResponse(UUID id, long movieTmdbId, String movieTitle, String posterPath, String releaseTitle,
            Integer resolutionHeight, String sourceType, String dynamicRange, String status, double progress,
            Long totalBytes, long downloadedBytes, long downloadSpeedBps, Long etaSeconds, Instant createdAt) {
        static DownloadResponse from(DownloadSummary download) {
            return new DownloadResponse(download.id(), download.movieTmdbId(), download.movieTitle(), download.posterPath(),
                    download.releaseTitle(), download.resolutionHeight(), download.sourceType(), download.dynamicRange(),
                    download.status().name(), download.progress(), download.totalBytes(), download.downloadedBytes(),
                    download.downloadSpeedBps(), download.etaSeconds(), download.createdAt());
        }
    }
}
