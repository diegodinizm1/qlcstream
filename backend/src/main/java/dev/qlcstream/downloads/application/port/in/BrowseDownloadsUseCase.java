package dev.qlcstream.downloads.application.port.in;

import java.util.List;

import dev.qlcstream.downloads.domain.DownloadSummary;

public interface BrowseDownloadsUseCase {
    List<DownloadSummary> active();
}
