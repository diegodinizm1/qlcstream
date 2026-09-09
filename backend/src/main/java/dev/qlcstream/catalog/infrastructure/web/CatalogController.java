package dev.qlcstream.catalog.infrastructure.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.qlcstream.catalog.application.port.in.BrowseCatalogUseCase;
import dev.qlcstream.catalog.domain.Movie;

@Validated
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final BrowseCatalogUseCase browseCatalog;

    public CatalogController(BrowseCatalogUseCase browseCatalog) {
        this.browseCatalog = browseCatalog;
    }

    @GetMapping("/trending")
    List<CatalogMovieResponse> trending(
            @RequestParam(defaultValue = "pt-BR") String language,
            @RequestParam(defaultValue = "1") @Min(1) @Max(500) int page) {
        return browseCatalog.trending(language, page).stream().map(CatalogMovieResponse::from).toList();
    }

    @GetMapping("/search")
    List<CatalogMovieResponse> search(
            @RequestParam @NotBlank String query,
            @RequestParam(defaultValue = "pt-BR") String language,
            @RequestParam(defaultValue = "1") @Min(1) @Max(500) int page) {
        return browseCatalog.search(query, language, page).stream().map(CatalogMovieResponse::from).toList();
    }

    record CatalogMovieResponse(
            Long id,
            long tmdbId,
            String title,
            String originalTitle,
            LocalDate releaseDate,
            String overview,
            String posterPath,
            String backdropPath,
            BigDecimal voteAverage) {

        static CatalogMovieResponse from(Movie movie) {
            return new CatalogMovieResponse(movie.id(), movie.tmdbId(), movie.title(), movie.originalTitle(),
                    movie.releaseDate(), movie.overview(), movie.posterPath(), movie.backdropPath(), movie.voteAverage());
        }
    }
}
