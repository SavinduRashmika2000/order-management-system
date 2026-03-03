package savindu_rashmika.order.management.system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import savindu_rashmika.order.management.system.entities.User;
import savindu_rashmika.order.management.system.repositories.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public List<User> findAll() {
        return repository.findAll();
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    public User updateStatus(Integer id, boolean status) {
        User user = repository.findById(id).orElseThrow();
        user.setActiveStatus(status);
        return repository.save(user);
    }
}
