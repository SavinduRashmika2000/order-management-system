package savindu_rashmika.order.management.system.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import savindu_rashmika.order.management.system.entities.Customer;
import savindu_rashmika.order.management.system.services.CustomerService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService service;

    @GetMapping
    public ResponseEntity<List<Customer>> findAll() {
        return ResponseEntity.ok(service.findActive());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Customer>> findActive() {
        return ResponseEntity.ok(service.findActive());
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<Customer>> findInactive() {
        return ResponseEntity.ok(service.findInactive());
    }

    @PostMapping
    public ResponseEntity<Customer> save(@RequestBody Customer customer) {
        return ResponseEntity.ok(service.save(customer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Integer id, @RequestBody Customer customer) {
        return ResponseEntity.ok(service.update(id, customer));
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<Customer> reactivateById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.reactivateById(id));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateById(@PathVariable Integer id) {
        service.deactivateById(id);
        return ResponseEntity.noContent().build();
    }
}
