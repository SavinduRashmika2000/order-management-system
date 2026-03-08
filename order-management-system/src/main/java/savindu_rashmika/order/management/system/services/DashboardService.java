package savindu_rashmika.order.management.system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import savindu_rashmika.order.management.system.dto.DashboardStatsResponse;
import savindu_rashmika.order.management.system.entities.Order;
import savindu_rashmika.order.management.system.repositories.CustomerRepository;
import savindu_rashmika.order.management.system.repositories.OrderRepository;
import savindu_rashmika.order.management.system.repositories.ProductRepository;
import savindu_rashmika.order.management.system.repositories.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

        private final UserRepository userRepository;
        private final ProductRepository productRepository;
        private final CustomerRepository customerRepository;
        private final OrderRepository orderRepository;

        public DashboardStatsResponse getStats(Integer userId) {
                long totalUsers = userRepository.countByActiveStatusTrue();
                long totalProducts = productRepository.countByStatus("ACTIVE");
                long totalCustomers = customerRepository.countByIsActiveTrue();

                List<Order> allOrders;
                if (userId != null) {
                        allOrders = orderRepository.findByUserId(userId);
                } else {
                        allOrders = orderRepository.findAll();
                }

                long activeOrders = allOrders.stream()
                                .filter(order -> !"CANCELED".equals(order.getStatus())
                                                && !"DISPATCHED".equals(order.getStatus()))
                                .count();

                BigDecimal revenue = allOrders.stream()
                                .filter(order -> "CONFIRM".equals(order.getStatus()))
                                .map(Order::getTotalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                return DashboardStatsResponse.builder()
                                .totalUsers(totalUsers)
                                .totalProducts(totalProducts)
                                .totalCustomers(totalCustomers)
                                .activeOrders(activeOrders)
                                .revenue(revenue)
                                .build();
        }
}
