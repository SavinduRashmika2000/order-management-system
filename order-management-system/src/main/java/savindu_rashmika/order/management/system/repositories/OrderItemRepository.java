package savindu_rashmika.order.management.system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import savindu_rashmika.order.management.system.entities.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
}
