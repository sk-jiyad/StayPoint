# StayPoint Phase 2 — Build Plan

**Goal:** Take the current working CRUD app and harden it into a portfolio piece you can defend in an Infosys SP interview. Every change here is small, targeted, and creates an interview talking point.

**Time estimate:** ~15–20 hours of focused work. Doable in 4–6 evenings or one long weekend.

**Stack staying the same:** Spring Boot 3.5.3, Java 21, MySQL, JPA. Don't change those — risk of breaking what works.

---

## Why these specific changes (and not others)

I deliberately scoped this small. Tempting additions like Redis caching, ML recommendations, and microservice splits would be cool but they:
1. Take weeks, not days
2. Are not necessary to pass an SP interview — depth on what you've built matters more than breadth
3. Would push the README into "aspirational fiction" territory if not actually built

What's in Phase 2 below is exactly the gap between "college CRUD project" and "this person knows production Spring Boot."

---

## Task 1 — Switch to constructor injection (30 min)

**Why:** Field injection with `@Autowired` is the #1 thing a Spring interviewer spots as junior code. Constructor injection is the modern recommendation — makes dependencies explicit, fields can be `final`, easier to unit test (no Spring needed), and fails fast at startup if a dependency is missing.

**Where:** `PGController.java`, `PGService.java`

**Before:**
```java
@RestController
public class PGController {
    @Autowired
    private PGService pgService;
}
```

**After:**
```java
@RestController
public class PGController {
    private final PGService pgService;

    public PGController(PGService pgService) {
        this.pgService = pgService;
    }
}
```

Spring 4.3+ auto-injects single-constructor beans, so you don't even need `@Autowired` on the constructor.

**Interview talking point:** *"I refactored from field injection to constructor injection. Constructor injection makes dependencies immutable, exposes them clearly, and lets me unit-test the service without bringing up the Spring context."*

---

## Task 2 — Wire up the DTO and add input validation (2–3 hours)

**Why:** Your `PGUpdateDTO` exists but isn't used. Worse, your controller accepts the entity directly, which couples your API to your database schema and exposes you to over-posting attacks. Validation is a basic professional expectation.

### Step 2a — Add validation dependency to pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### Step 2b — Create a `PGCreateDTO` (and reuse `PGUpdateDTO` for updates)

```java
package com.jiyad.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class PGCreateDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank
    @Pattern(regexp = "\\d{10}", message = "Contact number must be 10 digits")
    private String contactNumber;

    @Pattern(regexp = "\\d{10}", message = "Alternate contact must be 10 digits")
    private String alternateContact; // optional, but if present must be valid

    @NotBlank
    @Size(min = 10, max = 500)
    private String address;

    private String landmark;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Rent must be positive")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal rentSingle;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 8, fraction = 2)
    private BigDecimal rentDouble;

    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 8, fraction = 2)
    private BigDecimal rentTriple;

    @NotNull
    private Boolean foodProvided;

    @NotNull
    private Boolean wifiAvailable;

    @NotNull
    private Boolean acAvailable;

    // getters and setters — same pattern as PGUpdateDTO
}
```

### Step 2c — Update controller to use DTOs and `@Valid`

```java
@PostMapping
public ResponseEntity<PGResponseDTO> createPG(@Valid @RequestBody PGCreateDTO dto) {
    PG savedPG = pgService.createPG(dto);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(PGResponseDTO.from(savedPG));
}

@PutMapping("/{id}")
public ResponseEntity<PGResponseDTO> updatePG(
        @PathVariable Long id,
        @Valid @RequestBody PGUpdateDTO dto) {
    PG updated = pgService.updatePG(id, dto);
    if (updated != null) {
        return ResponseEntity.ok(PGResponseDTO.from(updated));
    }
    return ResponseEntity.notFound().build();
}
```

### Step 2d — Create a `PGResponseDTO` so you don't expose the entity

```java
public class PGResponseDTO {
    private Long id;
    private String name;
    private String ownerName;
    // ... only the fields you want to expose
    // (skip internal fields if you add audit columns later)

    public static PGResponseDTO from(PG pg) {
        PGResponseDTO dto = new PGResponseDTO();
        dto.setId(pg.getId());
        dto.setName(pg.getName());
        // ... map the rest
        return dto;
    }
}
```

### Step 2e — Update the service to take DTOs

```java
@Service
public class PGService {
    private final PGRepository pgRepository;

    public PGService(PGRepository pgRepository) {
        this.pgRepository = pgRepository;
    }

    public PG createPG(PGCreateDTO dto) {
        PG pg = new PG();
        pg.setName(dto.getName());
        pg.setOwnerName(dto.getOwnerName());
        // ... map all fields
        return pgRepository.save(pg);
    }

    public PG updatePG(Long id, PGUpdateDTO dto) {
        // your existing null-check pattern, but on dto fields
    }
}
```

**Interview talking point:** *"I separated my API contract from my database entity using DTOs — `PGCreateDTO` for inputs with bean validation, `PGResponseDTO` for outputs. This protects against over-posting attacks where a client could try to set internal fields, and lets the API and DB schema evolve independently."*

---

## Task 3 — Global exception handler (1 hour)

**Why:** Right now your `createPG` catches all exceptions and returns a generic 400. That hides real bugs and gives the API consumer no useful error info. Global exception handling is a standard Spring pattern.

### Create `GlobalExceptionHandler.java`

```java
package com.jiyad.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(err.getField(), err.getDefaultMessage());
        }
        ErrorResponse body = new ErrorResponse(
            Instant.now(), 400, "Validation failed", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse body = new ErrorResponse(
            Instant.now(), 404, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        // log the actual error server-side
        ErrorResponse body = new ErrorResponse(
            Instant.now(), 500, "Internal server error", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
```

### Create `ErrorResponse.java` and `ResourceNotFoundException.java`

```java
public record ErrorResponse(
    Instant timestamp, int status, String message, Map<String, String> errors) {}

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}
```

Then in your service, throw `ResourceNotFoundException` instead of returning null.

**Interview talking point:** *"I centralized exception handling with `@ControllerAdvice`. Validation failures return structured 400s with per-field error messages, missing resources return proper 404s, and unexpected errors are logged server-side but return a generic 500 to clients — so internal stack traces never leak through the API."*

---

## Task 4 — JWT authentication (4–6 hours, the biggest task)

**Why:** Currently anyone can hit any endpoint. PG owners shouldn't be able to edit each other's listings. Auth is also one of the most-asked Spring topics in interviews. Doing this right is a major resume signal.

### Step 4a — Add dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

### Step 4b — User entity, repository, roles

Add a `User` entity with `id`, `email`, `passwordHash`, `role` (enum: `ROLE_USER`, `ROLE_OWNER`, `ROLE_ADMIN`), and a `UserRepository`. Owners create PG listings; users browse them.

### Step 4c — Add `ownerUserId` to PG entity

So you can enforce "only the owner can edit/delete their PG."

### Step 4d — Auth controller and JWT util

`/api/auth/register` → creates a User with hashed password (BCrypt)
`/api/auth/login` → validates credentials, returns a JWT

`JwtUtil` class generates tokens with a 24-hour expiry, signed with HS256, embedding the user ID and role as claims.

### Step 4e — JWT filter

Custom `OncePerRequestFilter` that extracts the token from the `Authorization: Bearer <token>` header, validates it, and sets the `SecurityContextHolder` for the request.

### Step 4f — Security config

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // stateless API
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/pgs/**").permitAll() // browsing is public
                .requestMatchers(HttpMethod.POST, "/api/pgs").hasRole("OWNER")
                .requestMatchers(HttpMethod.PUT, "/api/pgs/**").hasRole("OWNER")
                .requestMatchers(HttpMethod.DELETE, "/api/pgs/**").hasRole("OWNER")
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### Step 4g — Ownership check

In the service, when updating/deleting a PG, verify the JWT's user ID matches the PG's `ownerUserId`. Throw an `AccessDeniedException` if not — Spring will translate it to 403.

**Interview talking points (multiple):**
- *"I implemented stateless JWT auth — no server-side sessions, just a signed token. CSRF is disabled because there's no session cookie to exploit."*
- *"Passwords are hashed with BCrypt — never plaintext, never reversible. BCrypt has a built-in salt and a tunable work factor."*
- *"I used method-level authorization with role-based access. Browsing is public, but only users with `ROLE_OWNER` can create listings."*
- *"For ownership checks, I verify the JWT subject matches the resource owner — this prevents one owner from modifying another owner's PG, which role-based auth alone wouldn't catch."*

---

## Task 5 — Move CORS to a config class (15 min)

**Why:** Hardcoding `@CrossOrigin` in the controller is fine for one endpoint but won't scale. A central config makes the policy explicit and easy to change.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(allowedOrigins)
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

In `application.properties`:
```properties
app.cors.allowed-origins=http://localhost:3000
```

Then remove `@CrossOrigin` from the controller.

---

## Task 6 — Externalize secrets (15 min)

**Why:** Your DB password `alpha` is committed to git. Any interviewer who looks at your repo will see it. This is a security smell.

### Update `application.properties`

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/staypoint_db}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}

app.jwt.secret=${JWT_SECRET:}
app.jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}
```

Set the env vars locally (or use a `.env` file with Spring Boot's `spring-dotenv` if you prefer). Add `.env` to `.gitignore`.

**Interview talking point:** *"Secrets are externalized via environment variables — the application has sensible defaults for local dev but never ships credentials in source control."*

---

## Task 7 — Write a few real tests (2 hours)

**Why:** A `contextLoads()` test means nothing. Real tests show you understand testing — and Infosys interviewers do ask "how do you test Spring Boot?"

### Service-layer test (uses Mockito, no Spring context)

```java
@ExtendWith(MockitoExtension.class)
class PGServiceTest {

    @Mock private PGRepository pgRepository;
    @InjectMocks private PGService pgService;

    @Test
    void getPGById_whenExists_returnsPG() {
        PG pg = new PG();
        pg.setId(1L);
        pg.setName("Test PG");
        when(pgRepository.findById(1L)).thenReturn(Optional.of(pg));

        Optional<PG> result = pgService.getPGById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test PG", result.get().getName());
        verify(pgRepository).findById(1L);
    }

    @Test
    void getPGById_whenNotExists_returnsEmpty() {
        when(pgRepository.findById(99L)).thenReturn(Optional.empty());
        assertTrue(pgService.getPGById(99L).isEmpty());
    }
}
```

### Controller test (uses `@WebMvcTest` and MockMvc)

```java
@WebMvcTest(PGController.class)
class PGControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private PGService pgService;

    @Test
    void getAllPGs_returnsJsonList() throws Exception {
        when(pgService.getAllPGs()).thenReturn(List.of());
        mockMvc.perform(get("/api/pgs"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void createPG_withInvalidData_returns400() throws Exception {
        String invalidJson = "{}"; // missing required fields
        mockMvc.perform(post("/api/pgs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
            .andExpect(status().isBadRequest());
    }
}
```

Aim for 5–8 tests total. You don't need 80% coverage — you need the interviewer to see that you *know how* to test.

**Interview talking point:** *"I use Mockito for unit tests of the service layer — fast, no Spring context. For controllers I use `@WebMvcTest` with MockMvc, which only loads the web slice. For full integration I'd use `@SpringBootTest` with Testcontainers if I needed a real database, but I haven't added that yet."*

---

## Suggested order

| Day | Task | Hours |
|---|---|---|
| 1 | Tasks 1, 5, 6 (constructor injection, CORS, secrets) | ~1 |
| 2 | Task 2 (DTOs + validation) | 2–3 |
| 3 | Task 3 (exception handler) | 1 |
| 4–5 | Task 4 (JWT auth) | 4–6 |
| 6 | Task 7 (tests) | 2 |
| 7 | Polish: README, manual API testing with Postman, fix bugs | 2 |

Total: roughly 14–18 hours over a week.

---

## After Phase 2 — what to put on your resume

Once Phase 2 is done, here's a tight resume bullet:

> **StayPoint** — Spring Boot REST API for paying-guest accommodation discovery
> Tech: Java 21, Spring Boot 3.5, Spring Security, JPA/Hibernate, MySQL, JWT
> - Designed layered REST API with DTO-based contracts, bean validation, and `@ControllerAdvice` global exception handling returning structured error responses
> - Implemented stateless JWT authentication with BCrypt password hashing and role-based authorization (USER/OWNER); enforced resource-level ownership checks on mutations
> - Wrote unit tests with Mockito and slice tests with `@WebMvcTest` covering service and controller layers

That's an SP-interview-credible bullet. Three lines, every claim backed by code in your repo.

---

## What I'd skip (for now)

- **Redis caching** — adds infra complexity, hard to explain a real cache-eviction strategy without backing it up. Add later if you want.
- **ML recommendations** — would need a separate Python service; out of scope for SP interview prep. The current README claim is misleading; we'll fix that.
- **Real-time availability** — would need WebSockets or polling; not necessary.
- **Docker / Kubernetes** — nice but not what an SP fresher interview probes.
- **Frontend** — your repo has CORS for `localhost:3000` suggesting React, but the backend stands alone. Build it later if you want; not required.

Stay focused. Ship Phase 2 cleanly, then talk about it confidently.
