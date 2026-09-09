package dev.qlcstream.catalog.infrastructure.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import dev.qlcstream.catalog.infrastructure.tmdb.TmdbNotConfiguredException;

@RestControllerAdvice(assignableTypes = CatalogController.class)
public class CatalogExceptionHandler {

    @ExceptionHandler(TmdbNotConfiguredException.class)
    ProblemDetail tmdbNotConfigured(TmdbNotConfiguredException exception) {
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
        problem.setTitle("Integração TMDB não configurada");
        return problem;
    }
}
