# STEP 3 — Spring Boot Initialization Guide

## What was built/fixed in this step

### New files added:
- `exception/GlobalExceptionHandler.java` — converts all exceptions to JSON `{ status, error, message }`
- `dto/AdminDTOs.java`                   — DocumentDTO, OverviewDTO, ReindexResultDTO, QueryLogDTO
- `repository/FeedbackRepository.java`   — JPA repo for feedback table
- `src/test/.../PlatformApplicationTests.java` — Spring context smoke test
- `application-test.properties`          — H2 in-memory config for tests (no Postgres needed)
- `.gitignore`                           — ignores target/, uploads/, IDE files

### Files updated:
- `pom.xml`                  — added H2 (test), jackson-datatype-jsr310, removed broken commons-fileupload
- `AdminService.java`        — returns DTOs instead of raw JPA entities (fixes lazy-load crash)
- `AdminController.java`     — typed to AdminDTOs (clean API contracts)

---

## Exact Commands to Run

### Prerequisites
```bash
java --version    # must be Java 17
mvn --version     # must be Maven 3.8+
```

### PostgreSQL setup (run once)
```sql
-- In psql or pgAdmin:
CREATE DATABASE university_ai_db;
-- Default credentials in application.properties: postgres / postgres
-- Change if your Postgres has a different password:
```

### Update application.properties if needed
```properties
# File: backend-spring/src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/university_ai_db
spring.datasource.username=postgres
spring.datasource.password=postgres   ← change to your password
```

### Install dependencies + run
```bash
cd university-ai-platform/backend-spring
mvn spring-boot:run
```

Maven auto-downloads all dependencies on first run (~2 min).
Server starts at: **http://localhost:8080**

### Test without PostgreSQL (uses H2 in-memory)
```bash
mvn test
# OR: mvn spring-boot:run -Dspring-boot.run.profiles=test
```

---

## What happens on first startup

1. Hibernate reads all `@Entity` classes → creates tables automatically (`ddl-auto=update`)
2. `DataInitializer` runs → seeds two users:
   - `admin@university.edu` / `admin123`  (ROLE_ADMIN)
   - `student@university.edu` / `student123` (ROLE_STUDENT)
3. REST API ready at `http://localhost:8080/api`

---

## Database Tables Created (auto by Hibernate)

| Table          | Entity         | Purpose                          |
|----------------|----------------|----------------------------------|
| users          | User           | Accounts + roles                 |
| chat_sessions  | ChatSession    | Groups messages by session UUID  |
| chat_messages  | ChatMessage    | USER and ASSISTANT messages      |
| documents      | Document       | Uploaded PDFs + index status     |
| feedback       | Feedback       | Thumbs up/down on AI answers     |

---

## API Test (after startup)

```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"admin123"}'

# Response:
# { "token": "eyJ...", "email": "admin@university.edu", "role": "ADMIN", ... }

# Use token to call protected endpoint
TOKEN="eyJ..."
curl http://localhost:8080/api/admin/analytics/overview \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Connection refused` on port 5432 | PostgreSQL not running — `sudo service postgresql start` |
| `password authentication failed` | Wrong DB password in `application.properties` |
| `Port 8080 already in use` | Kill existing process: `lsof -ti:8080 \| xargs kill` |
| Compile error in AdminService | Ensure `dto/AdminDTOs.java` exists and was saved correctly |
| `Could not autowire AiClientService` | Ensure `AppConfig.java` has the `@Bean RestTemplate` method |
