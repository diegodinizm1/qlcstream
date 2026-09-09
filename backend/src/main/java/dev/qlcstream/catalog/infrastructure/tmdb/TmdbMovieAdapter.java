package dev.qlcstream.catalog.infrastructure.tmdb;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import dev.qlcstream.catalog.application.port.out.MovieMetadataProvider;
import dev.qlcstream.catalog.domain.Movie;

@Component
public class TmdbMovieAdapter implements MovieMetadataProvider {

    private final RestClient client;
    private final TmdbProperties properties;

    public TmdbMovieAdapter(TmdbProperties properties) {
        this.properties = properties;
        this.client = RestClient.builder().baseUrl(properties.baseUrl()).build();
    }

    @Override
    public List<Movie> trending(String language, int page) {
        requireConfiguration();
        var response = client.get()
                .uri(uri -> uri.path("/trending/movie/week")
                        .queryParam("language", language)
                        .queryParam("page", page)
                        .build())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiToken())
                .retrieve()
                .body(TmdbMoviePage.class);
        return map(response);
    }

    @Override
    public List<Movie> search(String query, String language, int page) {
        requireConfiguration();
        var response = client.get()
                .uri(uri -> uri.path("/search/movie")
                        .queryParam("query", query)
                        .queryParam("language", language)
                        .queryParam("page", page)
                        .queryParam("include_adult", false)
                        .build())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiToken())
                .retrieve()
                .body(TmdbMoviePage.class);
        return map(response);
    }

    private void requireConfiguration() {
        if (!properties.configured()) {
            throw new TmdbNotConfiguredException();
        }
    }

    private static List<Movie> map(TmdbMoviePage page) {
        if (page == null || page.results() == null) {
            return List.of();
        }
        return page.results().stream().map(TmdbMovie::toDomain).toList();
    }

    private record TmdbMoviePage(List<TmdbMovie> results) {
    }

    private record TmdbMovie(
            long id,
            String title,
            @JsonProperty("original_title") String originalTitle,
            @JsonProperty("release_date") String releaseDate,
            String overview,
            @JsonProperty("poster_path") String posterPath,
            @JsonProperty("vote_average") BigDecimal voteAverage) {

        Movie toDomain() {
            return new Movie(null, id, null, title, originalTitle, parseDate(releaseDate), overview, posterPath,
                    voteAverage);
        }

        private static LocalDate parseDate(String value) {
            if (value == null || value.isBlank()) {
                return null;
            }
            try {
                return LocalDate.parse(value);
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }
    }
}
