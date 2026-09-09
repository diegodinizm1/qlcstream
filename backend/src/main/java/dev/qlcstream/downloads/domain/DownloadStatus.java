package dev.qlcstream.downloads.domain;

public enum DownloadStatus {
    REQUESTED, SUBMITTING, METADATA, QUEUED, DOWNLOADING, PAUSED, STALLED, CHECKING, COMPLETED, SEEDING, ERROR,
    CANCELED, REMOVED
}
