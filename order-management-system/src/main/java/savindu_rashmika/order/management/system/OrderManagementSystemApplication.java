package savindu_rashmika.order.management.system;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import savindu_rashmika.order.management.system.entities.*;
import savindu_rashmika.order.management.system.repositories.*;

import org.springframework.jdbc.core.JdbcTemplate;

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
			CategoryRepository categoryRepository,
			JdbcTemplate jdbcTemplate,
			PasswordEncoder passwordEncoder) {
		return args -> {
			// Categories
			if (categoryRepository.count() == 0) {
				categoryRepository.save(Category.builder().name("Electronics").build());
				categoryRepository.save(Category.builder().name("Clothing").build());
				categoryRepository.save(Category.builder().name("Home & Garden").build());
				categoryRepository.save(Category.builder().name("Beauty").build());
				categoryRepository.save(Category.builder().name("Sports").build());
			}

			// Force LONGTEXT for image column just in case ddl-auto didn't do it
			try {
				jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN image LONGTEXT");
				System.out.println("Product table altered successfully: image column is now LONGTEXT");

				jdbcTemplate.execute("ALTER TABLE _user MODIFY COLUMN role VARCHAR(20)");
				System.out.println("User table altered successfully: role column is now VARCHAR(20)");
			} catch (Exception e) {
				System.err
						.println("Note: Could not alter table (might already be correct or not using MySQL): "
								+ e.getMessage());
			}

			// Users
			if (repository.findByUsername("admin").isEmpty()) {
				var admin = User.builder()
						.name("Admin User")
						.username("admin")
						.password(passwordEncoder.encode("password"))
						.role(Role.ADMIN)
						.activeStatus(true)
						.build();
				repository.save(admin);
			}

			if (repository.findByUsername("rep").isEmpty()) {
				var rep = User.builder()
						.name("Rep User")
						.username("rep")
						.password(passwordEncoder.encode("password"))
						.role(Role.REP)
						.activeStatus(true)
						.build();
				repository.save(rep);
			}

			// Products
			productRepository.findAll().forEach(product -> {
				if ("Available".equals(product.getStatus())) {
					product.setStatus("ACTIVE");
					productRepository.save(product);
				}
			});

			if (productRepository.count() == 0) {
				productRepository.save(Product.builder()
						.name("Laptop")
						.category("Electronics")
						.status("ACTIVE")
						.quantity(50)
						.price(new BigDecimal("1200.00"))
						.discount(new BigDecimal("100.00"))
						.build());
				productRepository.save(Product.builder()
						.name("Mouse")
						.category("Electronics")
						.status("ACTIVE")
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
