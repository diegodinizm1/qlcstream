package dev.qlcstream.catalog.infrastructure.persistence;

import java.util.List;

import org.springframework.stereotype.Repository;

import dev.qlcstream.catalog.application.port.out.MovieCatalogRepository;
import dev.qlcstream.catalog.domain.Movie;

@Repository
public class JpaMovieCatalogAdapter implements MovieCatalogRepository {

    private final SpringDataMovieRepository repository;

    public JpaMovieCatalogAdapter(SpringDataMovieRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Movie> saveAll(List<Movie> movies) {
        var entities = movies.stream().map(movie -> repository.findByTmdbId(movie.tmdbId())
                .map(existing -> {
                    existing.update(movie);
                    return existing;
                })
                .orElseGet(() -> MovieJpaEntity.from(movie))).toList();
        return repository.saveAll(entities).stream().map(MovieJpaEntity::toDomain).toList();
    }
}
