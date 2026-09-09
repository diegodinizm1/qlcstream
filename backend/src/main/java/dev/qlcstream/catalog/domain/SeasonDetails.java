package dev.qlcstream.catalog.domain;

import java.util.List;

public record SeasonDetails(SeriesSeason season, List<SeriesEpisode> episodes) {
    public SeasonDetails { episodes = List.copyOf(episodes); }
}
