package dev.qlcstream.library;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class LocalLibraryRegistrar {

    private static final Set<String> VIDEO_EXTENSIONS = Set.of("mkv", "mp4", "avi", "mov", "m4v", "webm");

    private final JdbcTemplate jdbc;

    public LocalLibraryRegistrar(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void registerCompletedDownload(long movieId, UUID downloadId, String relativeDirectory) {
        var directory = Path.of("/data").resolve(relativeDirectory);
        try (var files = Files.walk(directory)) {
            files.filter(Files::isRegularFile).filter(this::isVideo).forEach(file -> register(movieId, downloadId, file));
        } catch (IOException ignored) {
            // The qBittorrent state is authoritative; the next synchronization retries file discovery.
        }
    }

    private boolean isVideo(Path file) {
        var name = file.getFileName().toString();
        var dot = name.lastIndexOf('.');
        return dot >= 0 && VIDEO_EXTENSIONS.contains(name.substring(dot + 1).toLowerCase());
    }

    private void register(long movieId, UUID downloadId, Path file) {
        try {
            var relativePath = Path.of("/data").relativize(file).toString();
            jdbc.update("""
                    INSERT INTO local_file (movie_id, download_id, storage_root_id, relative_path, file_kind, size_bytes)
                    VALUES (?, ?, 1, ?, 'VIDEO', ?)
                    ON CONFLICT (storage_root_id, relative_path) DO UPDATE
                    SET availability = 'PRESENT', last_verified_at = now()
                    """, movieId, downloadId, relativePath, Files.size(file));
        } catch (IOException ignored) {
            // A file can disappear between directory discovery and registration.
        }
    }
}
