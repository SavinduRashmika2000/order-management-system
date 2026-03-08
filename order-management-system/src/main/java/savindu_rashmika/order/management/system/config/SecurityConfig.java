package savindu_rashmika.order.management.system.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import savindu_rashmika.order.management.system.security.JwtAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/v1/auth/**").permitAll()
                                                .requestMatchers("/uploads/**").permitAll()
                                                .requestMatchers("/error").permitAll()
                                                .requestMatchers("/api/v1/users/**").hasAuthority("ADMIN")
                                                .requestMatchers("/api/v1/dashboard/**").hasAnyAuthority("ADMIN", "REP")
                                                .requestMatchers(HttpMethod.GET, "/api/v1/products/**")
                                                .hasAnyAuthority("ADMIN", "REP")
                                                .requestMatchers("/api/v1/products/**").hasAuthority("ADMIN")
                                                .requestMatchers("/api/v1/customers/**").hasAnyAuthority("ADMIN", "REP")
                                                .requestMatchers(HttpMethod.GET, "/api/v1/orders/**")
                                                .hasAnyAuthority("ADMIN", "REP")
                                                .requestMatchers(HttpMethod.POST, "/api/v1/orders/**")
                                                .hasAnyAuthority("ADMIN", "REP")
                                                .requestMatchers(HttpMethod.PUT, "/api/v1/orders/**")
                                                .hasAuthority("ADMIN")
                                                .requestMatchers("/api/v1/orders/**").hasAuthority("ADMIN")
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(
                                List.of("http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
                                                "http://localhost:5176", "http://localhost:5177"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
