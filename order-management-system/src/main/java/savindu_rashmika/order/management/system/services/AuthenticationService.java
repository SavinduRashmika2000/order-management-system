package savindu_rashmika.order.management.system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import savindu_rashmika.order.management.system.dto.AuthenticationRequest;
import savindu_rashmika.order.management.system.dto.AuthenticationResponse;
import savindu_rashmika.order.management.system.dto.RegisterRequest;
import savindu_rashmika.order.management.system.entities.User;
import savindu_rashmika.order.management.system.repositories.UserRepository;
import savindu_rashmika.order.management.system.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthenticationResponse register(RegisterRequest request) {
                var user = User.builder()
                                .name(request.getName())
                                .username(request.getUsername())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole())
                                .activeStatus(true)
                                .build();
                repository.save(user);
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole().name())
                                .userId(user.getId())
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.getUsername(),
                                                        request.getPassword()));
                } catch (org.springframework.security.authentication.BadCredentialsException e) {
                        throw new RuntimeException("Invalid username or password");
                } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
                        throw new RuntimeException("User not found");
                } catch (org.springframework.security.authentication.DisabledException e) {
                        throw new RuntimeException("Account is deactivated. Please contact an administrator.");
                } catch (org.springframework.security.core.AuthenticationException e) {
                        throw new RuntimeException(e.getMessage());
                }

                var user = repository.findByUsername(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                var jwtToken = jwtService.generateToken(user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole().name())
                                .userId(user.getId())
                                .build();
        }
}
