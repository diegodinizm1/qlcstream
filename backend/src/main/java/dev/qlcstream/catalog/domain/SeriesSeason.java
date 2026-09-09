package dev.qlcstream.catalog.domain;

import java.time.LocalDate;

public record SeriesSeason(long tmdbId, int seasonNumber, String name, String overview, LocalDate airDate,
        String posterPath, int episodeCount) {
}
