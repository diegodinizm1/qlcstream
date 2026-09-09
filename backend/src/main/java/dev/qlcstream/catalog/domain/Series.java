package dev.qlcstream.catalog.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Series(long tmdbId, String name, String originalName, LocalDate firstAirDate, String overview,
        String posterPath, String backdropPath, BigDecimal voteAverage, BigDecimal popularity) {
}
