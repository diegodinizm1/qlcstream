package dev.qlcstream.downloads.application.port.out;

import java.util.List;

import dev.qlcstream.downloads.domain.DownloadSummary;

public interface DownloadRepository {
    List<DownloadSummary> findActive();
}
