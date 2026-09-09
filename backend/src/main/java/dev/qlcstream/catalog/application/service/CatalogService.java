package dev.qlcstream.catalog.application.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.qlcstream.catalog.application.port.in.BrowseCatalogUseCase;
import dev.qlcstream.catalog.application.port.out.MovieCatalogRepository;
import dev.qlcstream.catalog.application.port.out.MovieMetadataProvider;
import dev.qlcstream.catalog.domain.Movie;

@Service
@Transactional
public class CatalogService implements BrowseCatalogUseCase {

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
    public List<Movie> search(String query, String language, int page) {
        return catalogRepository.saveAll(metadataProvider.search(query, language, page));
    }
}
