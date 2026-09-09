package dev.qlcstream.catalog.application.port.out;

import java.util.List;

import dev.qlcstream.catalog.domain.Movie;

public interface MovieMetadataProvider {

    List<Movie> trending(String language, int page);

    List<Movie> search(String query, String language, int page);
}
