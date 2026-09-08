package dev.qlcstream;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ApplicationModulesTest {

    @Test
    void preservesModuleBoundaries() {
        ApplicationModules.of(QlcStreamBackendApplication.class).verify();
    }
}
