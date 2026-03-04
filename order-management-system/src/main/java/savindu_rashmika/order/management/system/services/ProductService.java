package savindu_rashmika.order.management.system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import savindu_rashmika.order.management.system.entities.Product;
import savindu_rashmika.order.management.system.repositories.ProductRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;

    public List<Product> findAll() {
        return repository.findAll();
    }

    public List<Product> findByStatus(String status) {
        return repository.findByStatus(status);
    }

    public Product save(Product product) {
        if (product.getStatus() == null) {
            product.setStatus("ACTIVE");
        }
        return repository.save(product);
    }

    public Product findById(Integer id) {
        return repository.findById(id).orElseThrow();
    }

    public Product update(Integer id, Product updatedProduct) {
        Product existingProduct = findById(id);
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setStatus(updatedProduct.getStatus());
        existingProduct.setImage(updatedProduct.getImage());
        existingProduct.setQuantity(updatedProduct.getQuantity());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setDiscount(updatedProduct.getDiscount());
        return repository.save(existingProduct);
    }

    public void deactivateById(Integer id) {
        Product product = findById(id);
        product.setStatus("HIDDEN");
        repository.save(product);
    }

    public Product reactivateById(Integer id) {
        Product product = findById(id);
        product.setStatus("ACTIVE");
        return repository.save(product);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
