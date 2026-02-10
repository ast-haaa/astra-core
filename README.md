# 🌿 Astra Backend – IoT Telemetry & Alert System

This project started as a minimal starter skeleton for the Astra backend  
(Java 17 + Spring Boot + MySQL) and has evolved into a **real-time IoT telemetry ingestion
and alerting system**.

It now supports **MQTT-based sensor data ingestion**, **rule-based alert generation**,
and **live telemetry APIs** for cold-chain / IoT devices (Tulsi Box use case).

---

## 🚀 What the System Does Now

- 📡 Receives real-time telemetry via MQTT  
- 🌡️ Stores temperature, humidity, and GPS sensor readings  
- 🚨 Generates alerts when thresholds are breached  
- ⏱️ Rate-limits alerts (flood control)  
- 🕒 Fetches latest telemetry per box/device  
- 👨‍🌾 Farmer alert APIs  
- 🧑‍💼 Admin escalated alert APIs  
- 🗄️ MySQL + JPA (Hibernate)  

---

## 🧩 What is Included

- Maven project (`pom.xml`)
- Spring Boot application (Java 17)
- application.properties configured for local MySQL
- Docker Compose file (MySQL)
- MQTT integration (Eclipse Paho)
- Spring Data JPA + Hibernate
- Spring Security (development mode)
- REST APIs
- Fabric client stub (for future use)
- Postman collection (sample requests) and sample payload

---

## 📂 Project Structure

src/main/java/com/astra
├── api/dto # DTOs
├── config # Security, MQTT, CORS configs
├── controller # REST Controllers
├── model # JPA Entities
├── repository # JPA Repositories
├── service # Business logic
├── fabric # Fabric client stub
├── util # Utility classes
└── Application.java # Spring Boot entry point


---

## ⚙️ Quick Start

### 1️⃣ Prerequisites
- Java 17
- Maven
- Docker
- MySQL
- Postman

---

### 2️⃣ Start MySQL
```bash
docker-compose up -d
3️⃣ Environment variables
Create a .env file (DO NOT COMMIT THIS FILE):

SERVER_PORT=8080

SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/astra
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password

MQTT_BROKER=tcp://localhost:1883
Refer to env.example for required keys.

4️⃣ Build & Run
mvn clean install
mvn spring-boot:run
Backend starts at:

http://localhost:8080
🔗 Key APIs
▶️ Live Telemetry (Tulsi Box)
GET /api/tulsi/live
Example response:

{
  "temperature": 22.5,
  "humidity": 55,
  "peltier": "OFF"
}
▶️ Farmer Alerts
GET /api/alerts/farmer/{farmerId}
▶️ Admin – Escalated Alerts
GET /api/admin/alerts/escalated
🧠 Alert Rules
🌡️ Temperature: 5°C – 25°C

💧 Humidity: 40% – 70%

⏱️ Alert flood control: 1 alert per 5 minutes per box

📁 Files of Interest
src/main/java/com/astra/service/TelemetryService.java

src/main/java/com/astra/repository/TelemetryRepository.java

src/main/java/com/astra/service/AlertService.java

src/main/java/com/astra/controller/TulsiLiveController.java

src/main/java/com/astra/service/EventService.java

src/main/java/com/astra/fabric/FabricClient.java

src/main/java/com/astra/util/HashUtil.java

postman_collection.json

sample_payload.json

🔐 Security Notes
.env is gitignored

No secrets (DB passwords, API keys) are committed

Spring Security enabled (development mode)

JWT support available for extension

⚠️ Notes
Hibernate schema warnings may appear if DB column types differ
(does not affect runtime functionality)

Fabric client is currently a stub returning mock txIds

Flyway is recommended for future schema migrations

The backend currently supports live telemetry and alerting for the Tulsi Box use case

👩‍💻 Author
Astha
WebDevloper