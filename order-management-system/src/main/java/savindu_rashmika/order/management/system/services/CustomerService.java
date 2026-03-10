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
    private final ImageUploadService imageUploadService;

    public List<Customer> findActive() {
        return repository.findByIsActiveTrue();
    }

    public List<Customer> findInactive() {
        return repository.findByIsActiveFalse();
    }

    public Customer save(Customer customer) {
        try {
            String imagePath = imageUploadService.uploadImage(customer.getImage(), "customers");
            if (imagePath != null) {
                customer.setImage(imagePath);
            }
        } catch (Exception e) {
            System.err.println("Failed to save customer image: " + e.getMessage());
        }
        return repository.save(customer);
    }

    public Customer findById(Integer id) {
        return repository.findById(id).orElseThrow();
    }

    public void deactivateById(Integer id) {
        Customer customer = findById(id);
        customer.setActive(false);
        repository.save(customer);
    }

    public Customer update(Integer id, Customer updatedCustomer) {
        Customer existingCustomer = findById(id);
        existingCustomer.setShopName(updatedCustomer.getShopName());
        existingCustomer.setOwnerName(updatedCustomer.getOwnerName());
        existingCustomer.setPhoneNo(updatedCustomer.getPhoneNo());
        existingCustomer.setEmail(updatedCustomer.getEmail());
        existingCustomer.setCity(updatedCustomer.getCity());
        existingCustomer.setAddress(updatedCustomer.getAddress());

        // Only update image if a new base64 string is provided
        if (updatedCustomer.getImage() != null && updatedCustomer.getImage().startsWith("data:image")) {
            try {
                String imagePath = imageUploadService.uploadImage(updatedCustomer.getImage(), "customers");
                if (imagePath != null) {
                    existingCustomer.setImage(imagePath);
                }
            } catch (Exception e) {
                System.err.println("Failed to update customer image: " + e.getMessage());
            }
        }

        existingCustomer.setLatitude(updatedCustomer.getLatitude());
        existingCustomer.setLongitude(updatedCustomer.getLongitude());
        existingCustomer.setGoogleMapLink(updatedCustomer.getGoogleMapLink());
        return repository.save(existingCustomer);
    }

    public Customer reactivateById(Integer id) {
        Customer customer = findById(id);
        customer.setActive(true);
        return repository.save(customer);
    }
}
