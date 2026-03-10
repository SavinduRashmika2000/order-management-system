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
    private final ImageUploadService imageUploadService;

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
        try {
            String imagePath = imageUploadService.uploadImage(product.getImage(), "products");
            if (imagePath != null) {
                product.setImage(imagePath);
            }
        } catch (Exception e) {
            System.err.println("Failed to save product image: " + e.getMessage());
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

        // Only update image if a new base64 string is provided
        if (updatedProduct.getImage() != null && updatedProduct.getImage().startsWith("data:image")) {
            try {
                String imagePath = imageUploadService.uploadImage(updatedProduct.getImage(), "products");
                if (imagePath != null) {
                    existingProduct.setImage(imagePath);
                }
            } catch (Exception e) {
                System.err.println("Failed to update product image: " + e.getMessage());
            }
        }

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

    public Product addStock(Integer id, int amount) {
        Product product = findById(id);
        product.setQuantity(product.getQuantity() + amount);
        return repository.save(product);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
