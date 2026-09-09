package dev.qlcstream.catalog.application.port.out;

import java.util.List;

import dev.qlcstream.catalog.domain.CatalogCollection;
import dev.qlcstream.catalog.domain.Movie;
import dev.qlcstream.catalog.domain.MovieDetails;
import dev.qlcstream.catalog.domain.Person;
import dev.qlcstream.catalog.domain.PersonDetails;
import dev.qlcstream.catalog.domain.SeasonDetails;
import dev.qlcstream.catalog.domain.Series;
import dev.qlcstream.catalog.domain.SeriesDetails;

public interface MovieMetadataProvider {

    List<Movie> trending(String language, int page);

    List<Movie> discover(CatalogCollection collection, String language, int page);

    List<Movie> search(String query, String language, int page);

    MovieDetails details(long tmdbId, String language);

    default List<Person> searchPeople(String query, String language) { return List.of(); }

    default PersonDetails personDetails(long tmdbId, String language) {
        throw new UnsupportedOperationException("Busca de pessoas não disponível.");
    }

    default List<Series> trendingSeries(String language, int page) { return List.of(); }

    default List<Series> searchSeries(String query, String language, int page) { return List.of(); }

    default SeriesDetails seriesDetails(long tmdbId, String language) {
        throw new UnsupportedOperationException("Busca de séries não disponível.");
    }

    default SeasonDetails seasonDetails(long seriesTmdbId, int seasonNumber, String language) {
        throw new UnsupportedOperationException("Busca de temporadas não disponível.");
    }
}
