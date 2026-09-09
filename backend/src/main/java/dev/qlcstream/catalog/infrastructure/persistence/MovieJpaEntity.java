package dev.qlcstream.catalog.infrastructure.persistence;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import dev.qlcstream.catalog.domain.Movie;

@Entity
@Table(name = "movie")
class MovieJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tmdb_id", nullable = false, unique = true)
    private long tmdbId;

    @Column(name = "imdb_id")
    private String imdbId;

    @Column(nullable = false)
    private String title;

    @Column(name = "original_title")
    private String originalTitle;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    private String overview;

    @Column(name = "poster_path")
    private String posterPath;

    @Column(name = "vote_average")
    private BigDecimal voteAverage;

    @Column(name = "metadata_updated_at", nullable = false)
    private Instant metadataUpdatedAt;

    protected MovieJpaEntity() {
    }

    static MovieJpaEntity from(Movie movie) {
        var entity = new MovieJpaEntity();
        entity.update(movie);
        return entity;
    }

    void update(Movie movie) {
        imdbId = movie.imdbId();
        title = movie.title();
        originalTitle = movie.originalTitle();
        releaseDate = movie.releaseDate();
        overview = movie.overview();
        posterPath = movie.posterPath();
        voteAverage = movie.voteAverage();
        metadataUpdatedAt = Instant.now();
        tmdbId = movie.tmdbId();
    }

    Movie toDomain() {
        return new Movie(id, tmdbId, imdbId, title, originalTitle, releaseDate, overview, posterPath, voteAverage);
    }
}
