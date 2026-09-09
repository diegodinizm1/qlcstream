package dev.qlcstream.catalog.domain;

import java.util.List;

public record MovieDetails(Movie movie, String tagline, int runtimeMinutes, List<String> genres, String director,
        List<String> writers, List<CastMember> cast, String trailerUrl, List<Movie> recommendations) {

    public MovieDetails {
        genres = List.copyOf(genres);
        writers = List.copyOf(writers);
        cast = List.copyOf(cast);
        recommendations = List.copyOf(recommendations);
    }

    public MovieDetails(Movie movie, String tagline, int runtimeMinutes, List<String> genres) {
        this(movie, tagline, runtimeMinutes, genres, null, List.of(), List.of(), null, List.of());
    }

    public record CastMember(long tmdbId, String name, String character, String profilePath) {
    }
}
