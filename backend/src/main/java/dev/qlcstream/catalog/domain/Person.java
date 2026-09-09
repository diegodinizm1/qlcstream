package dev.qlcstream.catalog.domain;

import java.util.List;

public record Person(long tmdbId, String name, String profilePath, List<Movie> knownFor) {
    public Person { knownFor = List.copyOf(knownFor); }
}
