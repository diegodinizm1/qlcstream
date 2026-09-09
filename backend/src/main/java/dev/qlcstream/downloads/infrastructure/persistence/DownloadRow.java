package dev.qlcstream.downloads.infrastructure.persistence;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "download")
class DownloadRow {
    @Id
    private UUID id;
}
