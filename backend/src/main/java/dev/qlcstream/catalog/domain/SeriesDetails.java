package dev.qlcstream.catalog.domain;

import java.util.List;

public record SeriesDetails(Series series, String tagline, List<String> genres, String status, int numberOfSeasons,
        List<MovieDetails.CastMember> cast, String trailerUrl, List<SeriesSeason> seasons) {
    public SeriesDetails {
        genres = List.copyOf(genres);
        cast = List.copyOf(cast);
        seasons = List.copyOf(seasons);
    }
}
