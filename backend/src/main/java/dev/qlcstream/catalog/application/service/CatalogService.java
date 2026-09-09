package dev.qlcstream.catalog.application.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.qlcstream.catalog.application.port.in.BrowseCatalogUseCase;
import dev.qlcstream.catalog.application.port.in.ViewMovieDetailsUseCase;
import dev.qlcstream.catalog.application.port.out.MovieCatalogRepository;
import dev.qlcstream.catalog.application.port.out.MovieMetadataProvider;
import dev.qlcstream.catalog.domain.CatalogCollection;
import dev.qlcstream.catalog.domain.Movie;
import dev.qlcstream.catalog.domain.MovieDetails;

@Service
@Transactional
public class CatalogService implements BrowseCatalogUseCase, ViewMovieDetailsUseCase {

    private final MovieMetadataProvider metadataProvider;
    private final MovieCatalogRepository catalogRepository;

    public CatalogService(MovieMetadataProvider metadataProvider, MovieCatalogRepository catalogRepository) {
        this.metadataProvider = metadataProvider;
        this.catalogRepository = catalogRepository;
    }

    @Override
    public List<Movie> trending(String language, int page) {
        return catalogRepository.saveAll(metadataProvider.trending(language, page));
    }

    @Override
    public List<Movie> discover(CatalogCollection collection, String language, int page) {
        return catalogRepository.saveAll(metadataProvider.discover(collection, language, page));
    }

    @Override
    public List<Movie> search(String query, String language, int page) {
        return catalogRepository.saveAll(metadataProvider.search(query, language, page));
    }

    @Override
    public MovieDetails view(long tmdbId, String language) {
        var details = metadataProvider.details(tmdbId, language);
        var persistedMovie = catalogRepository.saveAll(List.of(details.movie())).getFirst();
        return new MovieDetails(persistedMovie, details.tagline(), details.runtimeMinutes(), details.genres());
    }
}
