# ─────────────────────────────────────────────────────────────────────────────
# File: backend-spring/Dockerfile
# Stage 1: Build the JAR with Maven
# Stage 2: Run with minimal JRE image
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml first — Maven downloads dependencies (cached if pom unchanged)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Run ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create upload directory for PDFs (shared with ai-service via Docker volume)
RUN mkdir -p /app/uploads/pdfs

# Copy the built JAR from stage 1
COPY --from=builder /app/target/*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# JVM tuning for containers: respect cgroup memory limits
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
