# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.8.1-openjdk-17-slim AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Copy the built frontend static files to the backend resources
COPY --from=frontend-build /app/src/main/resources/static ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Create the final lean runtime image
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=backend-build /app/target/order-management-system-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]