# 🛒 Microservices E-Commerce Platform

A **production-grade microservices-based e-commerce platform** built using **Node.js, TypeScript, Docker, Kafka, and gRPC**.  
This project demonstrates modern distributed system design: API Gateway, event-driven communication, fast service-to-service RPC calls, and JWT-based authentication.

---

## 🌐 Architecture Overview

The platform follows microservices principles with clear boundaries and independent deployability.

Kafka Events:
OrderCreated, OrderConfirmed, OrderCancelled

---

## 🧩 Microservices

### **1. Gateway Service**
- Central API Gateway for all external communication  
- JWT authentication middleware  
- Role-based access control  
- Reverse-proxy to internal services  

---

### **2. User Service**
- User registration & login  
- Password hashing using **bcrypt**  
- JWT token generation  
- PostgreSQL + Prisma ORM  
- User roles (ADMIN / USER)  

---

### **3. Inventory Service**
- Product catalog management  
- Shopping cart CRUD operations  
- Inventory reservation for orders  
- Stock update on order events  
- gRPC server for internal requests  

---

### **4. Order Service**
- Order creation and lifecycle management  
- Communicates with inventory via gRPC  
- Publishes Kafka events:  
  - `order.created`  
  - `order.confirmed`  
  - `order.cancelled`  
- Admin order management  

---

## 📡 Communication Patterns

| Pattern | Purpose | Technology |
|--------|---------|------------|
| REST API | Client ↔ Gateway | Express |
| gRPC | High-speed internal RPC | Proto3 + gRPC |
| Event-driven | Async operations | Apache Kafka |
| Database ORM | Data management | Prisma |

---

## ⚙️ Tech Stack

- **Node.js 18**, **TypeScript**
- **Express.js**
- **PostgreSQL + Prisma**
- **Apache Kafka**
- **gRPC**
- **JWT Authentication**
- **Docker & Docker Compose**

---

## 📁 Project Structure
- **/gateway-service
- **/user-service
- **/inventory-service
- **/order-service
- **/proto/ # gRPC proto files
- **/docker # Kafka & DB configs
- **/shared # common DTOs & utils

---

## 🚀 Getting Started

### **1. Clone the Repository**
```sh
git clone https://github.com/yourusername/microservice-ecommerce.git
cd microservice-ecommerce


