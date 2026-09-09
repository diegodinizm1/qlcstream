package dev.qlcstream.library;

import java.nio.file.InvalidPathException;
import java.nio.file.Path;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class LocalStorageSettings {

    private final JdbcTemplate jdbc;

    public LocalStorageSettings(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public String downloadDirectory() {
        return jdbc.queryForObject("SELECT download_relative_path FROM storage_root WHERE id = 1", String.class);
    }

    public String updateDownloadDirectory(String value) {
        var directory = normalize(value);
        jdbc.update("UPDATE storage_root SET download_relative_path = ? WHERE id = 1", directory);
        return directory;
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException("Informe uma pasta de destino.");
        try {
            var path = Path.of(value.trim().replace('\\', '/')).normalize();
            if (path.isAbsolute() || path.startsWith("..") || path.toString().equals(".")) {
                throw new IllegalArgumentException("A pasta deve estar dentro da biblioteca local.");
            }
            return path.toString().replace('\\', '/');
        } catch (InvalidPathException exception) {
            throw new IllegalArgumentException("A pasta de destino é inválida.");
        }
    }
}
