package dev.qlcstream.catalog.domain;

import java.time.LocalDate;

public record SeriesEpisode(long tmdbId, int episodeNumber, String name, String overview, LocalDate airDate,
        String stillPath, int runtimeMinutes) {
}
