package dev.qlcstream.catalog.infrastructure.persistence;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataMovieRepository extends JpaRepository<MovieJpaEntity, Long> {

    Optional<MovieJpaEntity> findByTmdbId(long tmdbId);
}
