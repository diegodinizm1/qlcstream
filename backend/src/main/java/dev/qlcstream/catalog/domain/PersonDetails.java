package dev.qlcstream.catalog.domain;

import java.util.List;

public record PersonDetails(Person person, String biography, List<Movie> movies) {
    public PersonDetails { movies = List.copyOf(movies); }
}
