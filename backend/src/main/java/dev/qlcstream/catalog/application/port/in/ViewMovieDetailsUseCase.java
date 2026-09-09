package dev.qlcstream.catalog.application.port.in;

import dev.qlcstream.catalog.domain.MovieDetails;

public interface ViewMovieDetailsUseCase {

    MovieDetails view(long tmdbId, String language);
}
