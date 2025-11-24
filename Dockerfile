FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy Maven project files
COPY pom.xml .
COPY src ./src

# Build the project (skip tests)
RUN mvn -DskipTests package

# Stage 2: run the built jar
FROM eclipse-temurin:17-jre
WORKDIR /app

# Default MQTT broker (Docker network resolves "mosquitto")
ENV MQTT_BROKER=tcp://mosquitto:1883

# Create non-root user
RUN useradd -m -s /bin/bash astra || true
USER astra

# Copy the jar built in previous stage
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
