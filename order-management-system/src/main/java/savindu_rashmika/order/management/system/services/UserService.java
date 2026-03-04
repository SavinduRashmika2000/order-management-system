package savindu_rashmika.order.management.system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import savindu_rashmika.order.management.system.entities.User;
import savindu_rashmika.order.management.system.repositories.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return repository.findAll();
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActiveStatus(true);
        return repository.save(user);
    }

    public User updateUser(Integer id, User userDetails) {
        User user = repository.findById(id).orElseThrow();
        user.setName(userDetails.getName());
        user.setUsername(userDetails.getUsername());
        user.setRole(userDetails.getRole());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        return repository.save(user);
    }

    public User updateStatus(Integer id, boolean status) {
        User user = repository.findById(id).orElseThrow();
        user.setActiveStatus(status);
        return repository.save(user);
    }
}
