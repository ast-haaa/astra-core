# Astra Backend - Starter Project

This is a minimal starter skeleton for the Astra backend (Java 17 + Spring Boot + MySQL).
It contains a basic project structure, a Fabric client stub, hashing util, and sample Postman requests.

## What is included
- Maven project (`pom.xml`)
- Spring Boot application main
- application.properties configured for local MySQL
- Docker Compose file (MySQL)
- Skeleton Java classes:
  - controller (BatchController)
  - service (EventService)
  - fabric (FabricClient stub)
  - util (HashUtil)
- Postman collection (sample requests) and sample payload

## Quick start (Day-1)
1. Install Java 17, Maven, Docker, Postman, and ngrok.
2. Start MySQL:
   ```
   docker-compose up -d
   ```
3. Build & run the app:
   ```
   mvn spring-boot:run
   ```
4. Expose to IoT devices (optional):
   ```
   ngrok http 8080
   ```
5. Import the included Postman collection and test the endpoints.

## Files of interest
- src/main/java/com/astra/controller/BatchController.java
- src/main/java/com/astra/service/EventService.java
- src/main/java/com/astra/fabric/FabricClient.java
- src/main/java/com/astra/util/HashUtil.java
- postman_collection.json
- sample_payload.json

## What to study side-by-side
1. Spring Boot basics: controllers, services, dependency injection.
2. JPA/Hibernate basics and entity mapping.
3. REST API design and HTTP status codes.
4. JSON canonicalization and SHA-256 hashing.
5. Basics of Hyperledger Fabric (overview) — chaincode, peers, transactions (for later).
6. Tools: Docker, ngrok, Postman.

## Notes
- The Fabric client included is a stub returning fake txIds to allow early integration.
- Do not commit secrets (DB passwords, API keys) to version control.

