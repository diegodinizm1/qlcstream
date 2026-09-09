package dev.qlcstream.catalog.infrastructure.tmdb;

public final class TmdbNotConfiguredException extends RuntimeException {

    public TmdbNotConfiguredException() {
        super("Defina TMDB_API_TOKEN para consultar o catálogo.");
    }
}
