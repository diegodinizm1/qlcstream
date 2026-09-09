package dev.qlcstream.catalog.domain;

import java.util.List;

public record MovieDetails(Movie movie, String tagline, int runtimeMinutes, List<String> genres) {

    public MovieDetails {
        genres = List.copyOf(genres);
    }
}
