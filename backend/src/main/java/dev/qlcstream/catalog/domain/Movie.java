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
        BigDecimal voteAverage) {
}
