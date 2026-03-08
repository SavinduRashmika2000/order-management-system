package savindu_rashmika.order.management.system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import savindu_rashmika.order.management.system.entities.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    long countByActiveStatusTrue();
}
