package dev.qlcstream.catalog.infrastructure.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import dev.qlcstream.catalog.application.port.in.BrowseCatalogUseCase;
import dev.qlcstream.catalog.application.port.in.ViewMovieDetailsUseCase;
import dev.qlcstream.catalog.domain.Movie;
import dev.qlcstream.catalog.domain.MovieDetails;

@Validated
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final BrowseCatalogUseCase browseCatalog;
    private final ViewMovieDetailsUseCase viewMovieDetails;

    public CatalogController(BrowseCatalogUseCase browseCatalog, ViewMovieDetailsUseCase viewMovieDetails) {
        this.browseCatalog = browseCatalog;
        this.viewMovieDetails = viewMovieDetails;
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

    @GetMapping("/{tmdbId}")
    MovieDetailsResponse details(
            @PathVariable @Positive long tmdbId,
            @RequestParam(defaultValue = "pt-BR") String language) {
        return MovieDetailsResponse.from(viewMovieDetails.view(tmdbId, language));
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

    record MovieDetailsResponse(
            Long id,
            long tmdbId,
            String title,
            String originalTitle,
            LocalDate releaseDate,
            String overview,
            String posterPath,
            String backdropPath,
            BigDecimal voteAverage,
            String tagline,
            int runtimeMinutes,
            List<String> genres) {

        static MovieDetailsResponse from(MovieDetails details) {
            var movie = details.movie();
            return new MovieDetailsResponse(movie.id(), movie.tmdbId(), movie.title(), movie.originalTitle(),
                    movie.releaseDate(), movie.overview(), movie.posterPath(), movie.backdropPath(),
                    movie.voteAverage(), details.tagline(), details.runtimeMinutes(), details.genres());
        }
    }
}
