package savindu_rashmika.order.management.system.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import savindu_rashmika.order.management.system.entities.*;
import savindu_rashmika.order.management.system.repositories.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Create Admin User
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .name("Admin User")
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .activeStatus(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user created: admin / admin123");
        }

        // 2. Create Rep User
        if (userRepository.findByUsername("rep").isEmpty()) {
            User rep = User.builder()
                    .name("Sales Rep")
                    .username("rep")
                    .password(passwordEncoder.encode("rep123"))
                    .role(Role.REP)
                    .activeStatus(true)
                    .build();
            userRepository.save(rep);
            System.out.println("Rep user created: rep / rep123");
        }

        // 3. Create Sample Category and Product
        Category electronics;
        if (categoryRepository.findAll().isEmpty()) {
            electronics = Category.builder().name("Electronics").build();
            categoryRepository.save(electronics);
        } else {
            electronics = categoryRepository.findAll().get(0);
        }

        Product laptop;
        if (productRepository.findAll().isEmpty()) {
            laptop = Product.builder()
                    .name("High-End Laptop")
                    .category("Electronics")
                    .status("ACTIVE")
                    .quantity(50)
                    .price(new BigDecimal("1200.00"))
                    .discount(new BigDecimal("0.0"))
                    .build();
            productRepository.save(laptop);
            System.out.println("Sample product created: High-End Laptop");
        } else {
            laptop = productRepository.findAll().get(0);
        }

        // 4. Create Sample Customer
        Customer customer;
        if (customerRepository.findAll().isEmpty()) {
            customer = Customer.builder()
                    .shopName("Tech Paradise")
                    .ownerName("John Tech")
                    .phoneNo("0712345678")
                    .email("john@techparadise.com")
                    .city("Colombo")
                    .address("123 Tech Avenue, Colombo 03")
                    .isActive(true)
                    .build();
            customerRepository.save(customer);
            System.out.println("Sample customer created: Tech Paradise");
        } else {
            customer = customerRepository.findAll().get(0);
        }

        // 5. Create Sample Order
        if (orderRepository.findAll().isEmpty()) {
            User admin = userRepository.findByUsername("admin").get();

            Order order = Order.builder()
                    .orderNo("ORD-001")
                    .customer(customer)
                    .user(admin)
                    .date(LocalDateTime.now())
                    .totalPrice(new BigDecimal("1200.00"))
                    .status("PENDING")
                    .build();

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(laptop)
                    .quantity(1)
                    .price(new BigDecimal("1200.00"))
                    .discount(new BigDecimal("0.0"))
                    .build();

            order.setOrderItems(List.of(item));
            orderRepository.save(order);
            System.out.println("Sample order created: ORD-001");
        }
    }
}
