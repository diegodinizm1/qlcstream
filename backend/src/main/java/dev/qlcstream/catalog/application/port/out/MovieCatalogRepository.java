package dev.qlcstream.catalog.application.port.out;

import java.util.List;

import dev.qlcstream.catalog.domain.Movie;

public interface MovieCatalogRepository {

    List<Movie> saveAll(List<Movie> movies);
}
