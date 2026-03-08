package savindu_rashmika.order.management.system.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import savindu_rashmika.order.management.system.entities.Order;
import savindu_rashmika.order.management.system.services.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @GetMapping
    public ResponseEntity<List<Order>> findAll(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Integer customerId) {
        return ResponseEntity.ok(service.findAll(userId, date, customerId));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(service.createOrder(order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> findOrdersByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(service.findOrdersByUser(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Integer id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateOrderStatus(id, status));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> findOrdersByCustomer(@PathVariable Integer customerId) {
        return ResponseEntity.ok(service.findOrdersByCustomer(customerId));
    }
}
