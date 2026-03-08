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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public List<Order> findAll(Integer userId, String date, Integer customerId) {
        List<Order> orders = orderRepository.findAllSorted();

        if (userId != null) {
            orders = orders.stream()
                    .filter(o -> o.getUser() != null && o.getUser().getId().equals(userId))
                    .collect(Collectors.toList());
        }

        if (customerId != null) {
            orders = orders.stream()
                    .filter(o -> o.getCustomer() != null && o.getCustomer().getId().equals(customerId))
                    .collect(Collectors.toList());
        }

        if (date != null && !date.isEmpty()) {
            orders = orders.stream()
                    .filter(o -> o.getDate().toLocalDate().toString().equals(date))
                    .collect(Collectors.toList());
        }

        return orders;
    }

    public Order findById(Integer id) {
        return orderRepository.findById(id).orElseThrow();
    }

    public List<Order> findOrdersByUser(Integer userId) {
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public Order updateOrderStatus(Integer orderId, String status) {
        Order order = findById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public List<Order> findOrdersByCustomer(Integer customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Order createOrder(Order order) {
        order.setDate(LocalDateTime.now());
        if (order.getStatus() == null || order.getStatus().trim().isEmpty()) {
            order.setStatus("PENDING");
        }

        BigDecimal totalOrderPrice = BigDecimal.ZERO;

        // Consolidate duplicate items
        Map<Integer, OrderItem> consolidatedItems = new HashMap<>();
        for (OrderItem item : order.getOrderItems()) {
            Integer productId = item.getProduct().getId();
            if (consolidatedItems.containsKey(productId)) {
                OrderItem existingItem = consolidatedItems.get(productId);
                existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
            } else {
                consolidatedItems.put(productId, item);
            }
        }

        List<OrderItem> finalItems = new ArrayList<>();

        for (OrderItem item : consolidatedItems.values()) {
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
            finalItems.add(item);
        }

        order.setOrderItems(finalItems);
        order.setTotalPrice(totalOrderPrice);

        order = orderRepository.save(order);

        // Order Numbering format: ORD_NO_YYYYMMDD + orderId
        if (order.getOrderNo() == null || order.getOrderNo().trim().isEmpty()) {
            String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            order.setOrderNo("ORD_NO_" + datePart + order.getId());
            order = orderRepository.save(order);
        }

        return order;
    }
}
