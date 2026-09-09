package dev.qlcstream.downloads.application.service;

import java.util.List;

import org.springframework.stereotype.Service;

import dev.qlcstream.downloads.application.port.in.BrowseDownloadsUseCase;
import dev.qlcstream.downloads.application.port.out.DownloadRepository;
import dev.qlcstream.downloads.domain.DownloadSummary;

@Service
public class DownloadQueryService implements BrowseDownloadsUseCase {

    private final DownloadRepository downloadRepository;

    public DownloadQueryService(DownloadRepository downloadRepository) {
        this.downloadRepository = downloadRepository;
    }

    @Override
    public List<DownloadSummary> active() {
        return downloadRepository.findActive();
    }
}
