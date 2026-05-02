# StayPoint

**A Spring Boot REST API for discovering and listing paying-guest (PG) accommodations.**

Built as a backend portfolio project to demonstrate production-grade Spring Boot patterns: DTO-driven API contracts, bean validation, JWT authentication, role-based authorization, resource-level ownership checks, global exception handling, and a clean layered architecture.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.5.3 |
| Persistence | Spring Data JPA, Hibernate |
| Database | MySQL 8 |
| Security | Spring Security + JWT (jjwt 0.12) |
| Validation | Jakarta Bean Validation |
| Build | Maven |
| Testing | JUnit 5, Mockito, Spring Boot Test |

---

## Architecture

Standard layered architecture, strictly separated:

```
┌─────────────────────────────────────────────┐
│  Controller Layer (@RestController)         │
│  - HTTP request/response handling           │
│  - DTO-based contracts (input + output)     │
│  - Bean validation via @Valid               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Service Layer (@Service)                   │
│  - Business logic                           │
│  - DTO ↔ Entity mapping                     │
│  - Authorization & ownership checks         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Repository Layer (@Repository)             │
│  - Spring Data JPA interfaces               │
│  - Derived query methods + custom @Query    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Database (MySQL)                           │
└─────────────────────────────────────────────┘
```

**Cross-cutting concerns:**
- `JwtAuthFilter` (extends `OncePerRequestFilter`) — authenticates requests via Bearer token
- `SecurityConfig` — declares the filter chain, route authorization rules, and `BCryptPasswordEncoder`
- `GlobalExceptionHandler` (`@RestControllerAdvice`) — translates exceptions into structured error responses
- `WebConfig` — centralized CORS configuration

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (USER or OWNER role) |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/pgs` | List all PGs |
| `GET` | `/api/pgs/{id}` | Get PG by ID |
| `GET` | `/api/pgs/search?location={q}` | Search PGs by address keyword |
| `GET` | `/api/pgs/filter?minRent={x}&maxRent={y}` | Filter by single-room rent range |

### Authenticated (requires `Authorization: Bearer <jwt>`)

| Method | Endpoint | Required Role | Description |
|---|---|---|---|
| `POST` | `/api/pgs` | `ROLE_OWNER` | Create a new PG listing |
| `PUT` | `/api/pgs/{id}` | `ROLE_OWNER` (resource owner) | Update an owned PG |
| `DELETE` | `/api/pgs/{id}` | `ROLE_OWNER` (resource owner) | Delete an owned PG |

Mutating endpoints enforce **resource-level ownership** in the service layer — an OWNER can only modify PGs they themselves created. Role-based authorization alone would let any OWNER edit any PG, so this second check is essential.

---

## Data Model

### `PG` Entity

| Field | Type | Notes |
|---|---|---|
| `id` | Long | Auto-generated PK |
| `name` | String | Required |
| `ownerName` | String | Required |
| `contactNumber` | String | Required, 10 digits |
| `alternateContact` | String | Optional, 10 digits if present |
| `address` | TEXT | Required |
| `landmark` | String | Optional |
| `rentSingle` | BigDecimal | Required, positive |
| `rentDouble` | BigDecimal | Required, positive |
| `rentTriple` | BigDecimal | Optional, positive if present |
| `foodProvided` | Boolean | Required |
| `wifiAvailable` | Boolean | Required |
| `acAvailable` | Boolean | Required |
| `ownerUserId` | Long | FK to the `User` who created this listing |

`BigDecimal` is used for all monetary values to avoid floating-point precision errors.

### `User` Entity

| Field | Type | Notes |
|---|---|---|
| `id` | Long | Auto-generated PK |
| `email` | String | Unique, required |
| `passwordHash` | String | BCrypt-hashed, never plaintext |
| `role` | Enum | `ROLE_USER` or `ROLE_OWNER`, stored as STRING |

---

## Request / Response Examples

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "SecurePass123!",
  "role": "ROLE_OWNER"
}
```

Response (`201 Created`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "email": "owner@example.com",
  "role": "ROLE_OWNER"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "SecurePass123!"
}
```

### Create PG

```http
POST /api/pgs
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "name": "Sunrise PG",
  "ownerName": "Ramesh Kumar",
  "contactNumber": "9876543210",
  "address": "12, MG Road, Bengaluru, 560001",
  "landmark": "Near Metro Station",
  "rentSingle": 8500.00,
  "rentDouble": 6000.00,
  "rentTriple": 4500.00,
  "foodProvided": true,
  "wifiAvailable": true,
  "acAvailable": false
}
```

### Validation Error Response (`400 Bad Request`)

```json
{
  "timestamp": "2026-05-02T10:30:00Z",
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "contactNumber": "Contact number must be 10 digits",
    "rentSingle": "Rent must be positive"
  }
}
```

### Ownership Violation (`403 Forbidden`)

```json
{
  "timestamp": "2026-05-02T10:30:00Z",
  "status": 403,
  "message": "You can only modify your own listings",
  "errors": null
}
```

---

## Project Structure

```
src/main/java/com/jiyad/
├── StayPointApplication.java       # Spring Boot entry point
├── config/
│   └── WebConfig.java              # Centralized CORS configuration
├── controller/
│   ├── AuthController.java         # /api/auth/* endpoints
│   └── PGController.java           # /api/pgs/* endpoints
├── dto/
│   ├── PGCreateDTO.java            # Strict input contract for POST
│   ├── PGUpdateDTO.java            # Partial-update contract for PUT
│   ├── PGResponseDTO.java          # Output contract (decouples API from entity)
│   ├── RegisterRequestDTO.java
│   ├── LoginRequestDTO.java
│   └── AuthResponseDTO.java
├── exception/
│   ├── GlobalExceptionHandler.java # @RestControllerAdvice
│   ├── ErrorResponse.java          # Standard error envelope (record)
│   └── ResourceNotFoundException.java
├── model/
│   ├── PG.java                     # JPA entity
│   ├── User.java                   # JPA entity
│   └── Role.java                   # Role enum (stored as STRING)
├── repository/
│   ├── PGRepository.java
│   └── UserRepository.java
├── security/
│   ├── SecurityConfig.java         # Filter chain, password encoder, auth manager
│   ├── JwtUtil.java                # Token generation + validation
│   ├── JwtAuthFilter.java          # OncePerRequestFilter
│   ├── CustomUserDetailsService.java
│   ├── AuthUserPrincipal.java      # UserDetails implementation
│   └── AuthUtils.java              # Helpers to read SecurityContextHolder
└── service/
    ├── PGService.java
    └── AuthService.java

src/test/java/com/jiyad/
├── controller/
│   ├── PGControllerTest.java       # @WebMvcTest slice tests
│   └── AuthControllerTest.java
└── service/
    ├── PGServiceTest.java          # Mockito unit tests
    └── AuthServiceTest.java
```

---

## Setup

### Prerequisites
- JDK 21
- MySQL 8 running locally (or accessible via env vars)
- Maven 3.9+ (or use the included Maven Wrapper)

### Database

Create the database before first run:
```sql
CREATE DATABASE staypoint_db;
```

Tables are auto-created by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).

### Environment Variables

Copy `.env.example` to `.env` and fill in your local values. The `.env` file is gitignored.

```bash
DB_URL=jdbc:mysql://localhost:3306/staypoint_db
DB_USERNAME=root
DB_PASSWORD=your_password_here

# Generate one with: openssl rand -base64 48
# Must be at least 32 characters (256 bits)
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
JWT_EXPIRATION_MS=86400000

CORS_ALLOWED_ORIGINS=http://localhost:3000
SERVER_PORT=1004
```

The application has sensible defaults for local development; secrets are never committed to source control. The application will fail fast at startup if `JWT_SECRET` is missing or shorter than 32 characters — this is intentional.

### Run

```bash
./mvnw spring-boot:run
```

The API starts on `http://localhost:1004` (or whatever `SERVER_PORT` is set to).

### Test

```bash
./mvnw test
```

---

## Design Decisions

A few choices worth calling out:

**Constructor injection over field injection.** All dependencies are injected via constructors and stored in `final` fields. This makes dependencies explicit, classes immutable, and unit-testable without the Spring context.

**DTOs separate from entities.** API requests and responses use DTOs; entities never cross the controller boundary. `PGCreateDTO` enforces required fields; `PGUpdateDTO` makes them optional for partial updates while keeping format validation; `PGResponseDTO` controls what's exposed back to clients. This protects against over-posting attacks and decouples API contract evolution from database schema changes.

**Stateless JWT auth, no sessions.** No `HttpSession`, no server-side session storage. Tokens are signed with HS256 and validated on every request via `JwtAuthFilter`. CSRF protection is disabled because there's no session cookie to exploit.

**JWT carries identity claims.** The token includes the user's ID (as `sub`), email, and role. `JwtAuthFilter` constructs the `Authentication` principal directly from these claims, so authenticated requests do not hit the database. Tradeoff: a role or email change does not take effect until the existing token expires — standard JWT design, acceptable here given the 24-hour expiry.

**BCrypt for passwords.** Built-in salt, tunable work factor, well-vetted. Never plaintext, never reversible.

**Two-layer authorization.** Role-based checks (`hasAuthority('ROLE_OWNER')`) at the security filter chain handle coarse-grained access. Service-layer ownership checks (`assertOwnership`) ensure an OWNER can only modify resources they themselves created — role alone wouldn't catch one OWNER editing another's PG.

**Role enum stored as `STRING`.** `@Enumerated(EnumType.STRING)` rather than ordinal — reordering the enum can't corrupt existing data.

**Fail-fast configuration.** `JwtUtil` validates the secret length at construction time. If misconfigured, the application refuses to start rather than failing mysteriously on the first authenticated request.

**Global exception handler.** All errors flow through `@RestControllerAdvice`. Validation errors return per-field messages. `ResourceNotFoundException` maps to 404. `AccessDeniedException` maps to 403. `BadCredentialsException` maps to 401. Unhandled exceptions are logged server-side but return a generic 500 — no stack trace leakage.

**Note on registration role:** the `/api/auth/register` endpoint allows clients to self-select between `ROLE_USER` and `ROLE_OWNER`. This is a deliberate simplification for a portfolio project. In a production system, OWNER assignment would require email verification or admin approval. The comment in `AuthService.register()` documents this inline.


---

## Roadmap

### ✅ Phase 1 — Core CRUD
- PG entity with full CRUD endpoints
- Search by location (address keyword)
- Filter by rent range
- Layered architecture (Controller / Service / Repository)
- Custom JPA queries with `@Query`

### ✅ Phase 2 — Production hardening
- Constructor injection across all components
- DTO layer (Create / Update / Response) with bean validation
- Global exception handler via `@RestControllerAdvice` returning structured errors
- JWT authentication (register / login / token validation)
- BCrypt password hashing
- Role-based authorization (USER / OWNER) at filter chain
- Resource-level ownership enforcement at the service layer
- Centralized CORS configuration
- Externalized secrets via environment variables (`.env` support)
- Fail-fast JWT secret validation
- Unit tests (Mockito) for service layer
- Slice tests (`@WebMvcTest`) for controllers

### 🔮 Phase 3+ — Future ideas
- API documentation via SpringDoc OpenAPI / Swagger UI
- Pagination and sorting on list endpoints
- Image upload for PG listings (S3 or local storage)
- Audit columns (`createdAt`, `updatedAt`, `createdBy`)
- Refresh tokens and a token revocation deny-list
- Caching layer for frequently-read endpoints
- React frontend (CORS already prepared for `localhost:3000`)
- Docker Compose for local development (app + MySQL)
- Integration tests with Testcontainers

---

## License

MIT — see [LICENSE](./LICENSE).

## Author

**SK Jiyad** — built as part of campus placement portfolio preparation.