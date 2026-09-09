package dev.qlcstream.library;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final JdbcTemplate jdbc;

    public LibraryController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
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
