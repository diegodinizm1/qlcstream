package dev.qlcstream.system;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
class SystemStatusController {

    @GetMapping("/status")
    Map<String, Object> status() {
        return Map.of(
                "application", "QLC Stream",
                "status", "ready",
                "timestamp", Instant.now());
    }
}
