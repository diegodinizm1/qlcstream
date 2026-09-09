package dev.qlcstream.catalog.application.port.in;

import java.util.List;

import dev.qlcstream.catalog.domain.Movie;

public interface BrowseCatalogUseCase {

    List<Movie> trending(String language, int page);

    List<Movie> search(String query, String language, int page);
}
