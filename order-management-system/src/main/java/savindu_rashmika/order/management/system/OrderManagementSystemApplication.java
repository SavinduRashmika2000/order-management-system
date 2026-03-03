package savindu_rashmika.order.management.system;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import savindu_rashmika.order.management.system.entities.*;
import savindu_rashmika.order.management.system.repositories.*;

import java.math.BigDecimal;

@SpringBootApplication
public class OrderManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderManagementSystemApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(
			UserRepository repository,
			ProductRepository productRepository,
			CustomerRepository customerRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			// Users
			repository.findByUsername("admin").ifPresent(repository::delete);
			var admin = User.builder()
					.name("Admin User")
					.username("admin")
					.password(passwordEncoder.encode("password"))
					.role(Role.ADMIN)
					.activeStatus(true)
					.build();
			repository.save(admin);

			repository.findByUsername("rep").ifPresent(repository::delete);
			var rep = User.builder()
					.name("Rep User")
					.username("rep")
					.password(passwordEncoder.encode("password"))
					.role(Role.REP)
					.activeStatus(true)
					.build();
			repository.save(rep);

			// Products
			if (productRepository.count() == 0) {
				productRepository.save(Product.builder()
						.name("Laptop")
						.category("Electronics")
						.status("Available")
						.quantity(50)
						.price(new BigDecimal("1200.00"))
						.discount(new BigDecimal("100.00"))
						.build());
				productRepository.save(Product.builder()
						.name("Mouse")
						.category("Electronics")
						.status("Available")
						.quantity(200)
						.price(new BigDecimal("25.00"))
						.discount(new BigDecimal("5.00"))
						.build());
			}

			// Customers
			if (customerRepository.count() == 0) {
				customerRepository.save(Customer.builder()
						.shopName("Tech Haven")
						.ownerName("John Doe")
						.phoneNo("0712345678")
						.email("john@techhaven.com")
						.city("Colombo")
						.latitude("6.9271")
						.longitude("79.8612")
						.build());
			}
		};
	}
}
