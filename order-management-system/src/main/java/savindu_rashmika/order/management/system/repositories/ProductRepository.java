package savindu_rashmika.order.management.system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import savindu_rashmika.order.management.system.entities.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByStatus(String status);
}
