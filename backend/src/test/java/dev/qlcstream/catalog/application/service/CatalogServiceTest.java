package dev.qlcstream.catalog.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import dev.qlcstream.catalog.application.port.out.MovieCatalogRepository;
import dev.qlcstream.catalog.application.port.out.MovieMetadataProvider;
import dev.qlcstream.catalog.domain.Movie;

class CatalogServiceTest {

    @Test
    void importsTrendingMoviesThroughPorts() {
        var remoteMovie = new Movie(null, 42, null, "Filme de teste", "Test Movie",
                LocalDate.of(2026, 4, 3), "Sinopse de teste.", "/poster.jpg", "/backdrop.jpg",
                new BigDecimal("8.10"));
        var savedMovie = new Movie(7L, remoteMovie.tmdbId(), remoteMovie.imdbId(), remoteMovie.title(),
                remoteMovie.originalTitle(), remoteMovie.releaseDate(), remoteMovie.overview(),
                remoteMovie.posterPath(), remoteMovie.backdropPath(), remoteMovie.voteAverage());

        MovieMetadataProvider provider = new StubMetadataProvider(List.of(remoteMovie));
        MovieCatalogRepository repository = movies -> List.of(savedMovie);
        var service = new CatalogService(provider, repository);

        var result = service.trending("pt-BR", 1);

        assertThat(result).containsExactly(savedMovie);
    }

    private record StubMetadataProvider(List<Movie> movies) implements MovieMetadataProvider {

        @Override
        public List<Movie> trending(String language, int page) {
            return movies;
        }

        @Override
        public List<Movie> search(String query, String language, int page) {
            return movies;
        }
    }
}
