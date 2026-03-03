package savindu_rashmika.order.management.system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import savindu_rashmika.order.management.system.entities.Customer;
import savindu_rashmika.order.management.system.repositories.CustomerRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository repository;

    public List<Customer> findAll() {
        return repository.findAll();
    }

    public Customer save(Customer customer) {
        return repository.save(customer);
    }

    public Customer findById(Integer id) {
        return repository.findById(id).orElseThrow();
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
