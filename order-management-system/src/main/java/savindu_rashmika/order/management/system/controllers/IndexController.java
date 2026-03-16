package savindu_rashmika.order.management.system.controllers;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Controller
public class IndexController {

    @GetMapping(value = {
            "/",
            "/login",
            "/dashboard/**",
            "/users/**",
            "/products/**",
            "/customers/**",
            "/orders/**",
            "/admin/**",
            "/rep/**",
            "/{path:[^\\.]*}"
    }, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> serveIndex() throws IOException {
        ClassPathResource resource = new ClassPathResource("static/index.html");
        String html = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        return ResponseEntity.ok(html);
    }
}
