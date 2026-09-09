package dev.qlcstream.catalog.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Movie(
        Long id,
        long tmdbId,
        String imdbId,
        String title,
        String originalTitle,
        LocalDate releaseDate,
        String overview,
        String posterPath,
        String backdropPath,
        BigDecimal voteAverage,
        BigDecimal popularity) {

    public Movie(Long id, long tmdbId, String imdbId, String title, String originalTitle, LocalDate releaseDate,
            String overview, String posterPath, String backdropPath, BigDecimal voteAverage) {
        this(id, tmdbId, imdbId, title, originalTitle, releaseDate, overview, posterPath, backdropPath, voteAverage, null);
    }
}
