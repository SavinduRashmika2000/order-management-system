package savindu_rashmika.order.management.system.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import savindu_rashmika.order.management.system.entities.Product;
import savindu_rashmika.order.management.system.services.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @GetMapping
    public ResponseEntity<List<Product>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Product>> findActive() {
        return ResponseEntity.ok(service.findByStatus("ACTIVE"));
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<Product>> findInactive() {
        return ResponseEntity.ok(service.findByStatus("HIDDEN"));
    }

    @PostMapping
    public ResponseEntity<Product> save(@RequestBody Product product) {
        return ResponseEntity.ok(service.save(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Integer id, @RequestBody Product product) {
        return ResponseEntity.ok(service.update(id, product));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Integer id) {
        service.deactivateById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<Product> reactivate(@PathVariable Integer id) {
        return ResponseEntity.ok(service.reactivateById(id));
    }

    @PutMapping("/{id}/add-stock")
    public ResponseEntity<Product> addStock(@PathVariable Integer id, @RequestBody int amount) {
        return ResponseEntity.ok(service.addStock(id, amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
