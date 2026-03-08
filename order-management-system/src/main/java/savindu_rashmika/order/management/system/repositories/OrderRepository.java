package savindu_rashmika.order.management.system.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import savindu_rashmika.order.management.system.entities.Order;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    @Query("SELECT o FROM Order o ORDER BY o.date ASC")
    List<Order> findAllSorted();

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.date ASC")
    List<Order> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT COUNT(o) FROM Order o WHERE FUNCTION('DATE', o.date) = CURRENT_DATE")
    long countOrdersToday();

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId ORDER BY o.date DESC")
    List<Order> findByCustomerId(@Param("customerId") Integer customerId);
}
