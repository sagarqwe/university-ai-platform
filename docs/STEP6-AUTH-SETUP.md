# STEP 6 — Authentication Setup Guide

## Complete Auth Flow

```
BROWSER                    SPRING BOOT                      PostgreSQL
  │                             │                                │
  │  POST /api/auth/login        │                                │
  │  { email, password }─────►  │                                │
  │                             │  SELECT * FROM users           │
  │                             │  WHERE email=? ───────────────►│
  │                             │◄─── User row ─────────────────│
  │                             │                                │
  │                             │  BCrypt.matches(password, hash)│
  │                             │  ✓ valid                       │
  │                             │                                │
  │                             │  JwtUtils.generateToken()      │
  │                             │  { sub: email,                 │
  │                             │    role: STUDENT,              │
  │                             │    name: "...",                │
  │                             │    exp: now+24h }              │
  │                             │  Signed: HMAC-SHA256           │
  │                             │                                │
  │◄── { token, name, email, ───│                                │
  │      role, userId }         │                                │
  │                             │                                │
  │  localStorage.set(token)    │                                │
  │  Navigate to /              │                                │
  │                             │                                │
  │  GET /api/chat/query        │                                │
  │  Authorization: Bearer eyJ─►│                                │
  │                             │  JwtAuthFilter.doFilter()      │
  │                             │  1. Extract token from header  │
  │                             │  2. JwtUtils.extractUsername() │
  │                             │  3. Load user from DB          │
  │                             │  4. JwtUtils.isTokenValid()    │
  │                             │  5. Set SecurityContext        │
  │                             │  6. Chain continues            │
  │◄── Chat response ───────────│                                │
```

## Security Configuration Rules

```java
// SecurityConfig.java — route access table:
.requestMatchers("/api/auth/**").permitAll()        // Login, register — no auth
.requestMatchers("/api/admin/**").hasRole("ADMIN")  // Admin only
.requestMatchers("/api/chat/**").authenticated()    // Any logged-in user
.requestMatchers("/api/feedback/**").authenticated()
.anyRequest().authenticated()
```

## JWT Token Structure

```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "student@university.edu",
  "role": "STUDENT",
  "name": "Student Demo",
  "iat": 1718000000,
  "exp": 1718086400   ← 24 hours later
}
Signature: HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

## Demo Users (seeded automatically by DataInitializer.java)

| Role    | Email                    | Password    | Access |
|---------|--------------------------|-------------|--------|
| Admin   | admin@university.edu     | admin123    | All routes, including /api/admin/** |
| Student | student@university.edu   | student123  | Chat, feedback only |

## Register a New User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aditya Kumar",
    "email": "aditya@university.edu",
    "password": "mypassword123",
    "role": "STUDENT"
  }'
```

## Frontend Token Lifecycle

```
Login  → localStorage.set('authToken', 'eyJ...')
       → localStorage.set('userInfo', '{"name":"...","role":"STUDENT"}')

Requests → api.js interceptor reads authToken → adds Authorization header

401 response → interceptor clears localStorage → redirects to /login

Logout → authAPI.logout() (server no-op) → localStorage cleared → state reset
```

## Password Hashing

Spring uses BCrypt with strength 10 (2^10 = 1024 iterations):
```java
// SecurityConfig.java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(10);
}
// Hash never stored in plain text. Example:
// "admin123" → "$2a$10$xKc7MZ7j7v8Dc2X5Yz3LkuJ9..."
```
