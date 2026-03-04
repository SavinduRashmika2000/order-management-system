package savindu_rashmika.order.management.system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import savindu_rashmika.order.management.system.entities.Category;
import savindu_rashmika.order.management.system.repositories.CategoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    public List<Category> findAll() {
        return repository.findAll();
    }

    public Category save(Category category) {
        if (repository.existsByName(category.getName())) {
            throw new RuntimeException("Category already exists");
        }
        return repository.save(category);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
