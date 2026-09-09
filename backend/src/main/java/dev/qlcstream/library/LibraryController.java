package dev.qlcstream.library;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final JdbcTemplate jdbc;
    private final LocalStorageSettings storageSettings;

    public LibraryController(JdbcTemplate jdbc, LocalStorageSettings storageSettings) {
        this.jdbc = jdbc;
        this.storageSettings = storageSettings;
    }

    @DeleteMapping("/{id}")
    void delete(@PathVariable long id) {
        var relativePath = jdbc.query("SELECT relative_path FROM local_file WHERE id = ? AND availability = 'PRESENT'", result ->
                result.next() ? result.getString(1) : null, id);
        if (relativePath == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
        var root = Path.of("/data").toAbsolutePath().normalize();
        var file = root.resolve(relativePath).normalize();
        if (!file.startsWith(root)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Caminho inválido.");
        try {
            Files.deleteIfExists(file);
            jdbc.update("UPDATE local_file SET availability = 'DELETED', last_verified_at = now() WHERE id = ?", id);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não foi possível excluir o arquivo.");
        }
    }

    @GetMapping("/storage")
    StorageResponse storage() {
        return new StorageResponse(storageSettings.downloadDirectory());
    }

    @PutMapping("/storage")
    StorageResponse updateStorage(@Valid @RequestBody StorageRequest request) {
        return new StorageResponse(storageSettings.updateDownloadDirectory(request.downloadDirectory()));
    }

    record StorageRequest(@NotBlank String downloadDirectory) {
    }

    record StorageResponse(String downloadDirectory) {
    }

    @GetMapping
    List<LibraryItemResponse> browse() {
        return jdbc.query("""
                SELECT lf.id, m.tmdb_id, m.title, m.poster_path, lf.relative_path, lf.size_bytes, d.resolution_height,
                       d.source_type, d.dynamic_range, lf.discovered_at
                FROM local_file lf
                JOIN movie m ON m.id = lf.movie_id
                LEFT JOIN download d ON d.id = lf.download_id
                WHERE lf.file_kind = 'VIDEO' AND lf.availability = 'PRESENT'
                ORDER BY lf.discovered_at DESC
                """, (result, row) -> new LibraryItemResponse(result.getLong("id"), result.getLong("tmdb_id"),
                result.getString("title"), result.getString("poster_path"), result.getString("relative_path"),
                result.getLong("size_bytes"), result.getObject("resolution_height", Integer.class), result.getString("source_type"),
                result.getString("dynamic_range"), result.getTimestamp("discovered_at").toInstant()));
    }

    record LibraryItemResponse(long id, long movieTmdbId, String movieTitle, String posterPath, String relativePath,
            long sizeBytes, Integer resolutionHeight, String sourceType, String dynamicRange, java.time.Instant discoveredAt) {
    }
}
