package savindu_rashmika.order.management.system.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import savindu_rashmika.order.management.system.entities.Order;
import savindu_rashmika.order.management.system.entities.OrderItem;
import savindu_rashmika.order.management.system.entities.Product;
import savindu_rashmika.order.management.system.repositories.OrderRepository;
import savindu_rashmika.order.management.system.repositories.ProductRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findById(Integer id) {
        return orderRepository.findById(id).orElseThrow();
    }

    @Transactional
    public Order createOrder(Order order) {
        order.setDate(LocalDateTime.now());
        BigDecimal totalOrderPrice = BigDecimal.ZERO;

        for (OrderItem item : order.getOrderItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProduct().getId()));

            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Update product stock
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            // Calculate item price: quantity * (price - discount)
            BigDecimal itemPrice = product.getPrice().subtract(product.getDiscount());
            BigDecimal lineTotal = itemPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            item.setPrice(product.getPrice());
            item.setDiscount(product.getDiscount());
            item.setOrder(order);

            totalOrderPrice = totalOrderPrice.add(lineTotal);
        }

        order.setTotalPrice(totalOrderPrice);
        return orderRepository.save(order);
    }
}
