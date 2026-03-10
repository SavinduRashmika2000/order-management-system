# Use official Java 17 runtime
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy the Spring Boot jar
COPY target/order-management-system-0.0.1-SNAPSHOT.jar app.jar

# Expose port 9090
EXPOSE 9090

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]