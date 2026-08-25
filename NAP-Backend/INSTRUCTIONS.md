# Backend Development Instructions for Tagoole

## CRITICAL RULES

1. **NEVER INVENT NEW PACKAGES/DEPENDENCIES** - Only use the ones already in pom.xml
2. **FOLLOW THE EXISTING LAYERED ARCHITECTURE** - See below
3. **READ THIS FILE FIRST** - Before starting any new task
4. **DISCUSS BEFORE IMPLEMENTING** - Always confirm approach with user
5. **MARK TASKS AS DONE** - When a task is complete, explicitly state "DONE: [task name]" so user knows what to record

## Deployment Workflow (.env Preservation)

When deploying, preserve the `.env` file across git pulls:

```bash
# 1. Backup .env before pull
cp .env /tmp/.env.backup

# 2. Pull latest code
git pull origin main

# 3. Restore .env
cp /tmp/.env.backup .env

# 4. Build
./mvnw clean compile -q

# 5. If build succeeds, deploy
```

**Rule:** Always backup `.env` before any `git pull` operation.

## Layered Architecture Pattern

The project follows a strict layered approach with Facade pattern:

```
Controller → Facade → Service → Repository → Model
                    ↕
              DTO ↔ Mapper
```

### Layer Responsibilities

| Layer | Package | Responsibility | Transaction? | Example |
|-------|---------|---------------|--------------|---------|
| **Controller** | `controller/` | REST endpoints with `@RestController`. Receives request, delegates to Facade | No | `ContactController.java` |
| **Facade** | `facade/` | Orchestration layer with `@Facade`. Owns `@Transactional`, coordinates Service + Mapper | **YES** | `FeeAssignmentFacade.java` |
| **Service** | `service/` | Business logic with `@Service`. Stateless, no transaction management | No | `ContactService.java` |
| **Mapper** | `mapper/` | Stateless utility classes with static methods for DTO↔Model conversion | No | `FeeAssignmentMapper.java` |
| **Repository** | `repository/` | Spring Data JPA interfaces extending `JpaRepository<Entity, IdType>` | No | `ContactSubmissionRepository.java` |
| **Model** | `model/` | JPA Entity classes with `@Entity`, `@Table`, `@Column` annotations. Uses Lombok `@Getter`/`@Setter` | No | `ContactSubmission.java` |
| **DTO** | `dto/` | Java `record` classes for request/response payloads with Jakarta Validation | No | `ContactRequest.java`, `ContactResponse.java` |

### Additional Layers (When Needed)

- **Configuration** - `configuration/` for Spring beans, properties, filters
- **Exception** - `exception/` for global handlers, custom exceptions

## Code Conventions

**Important:** `@Transactional(readOnly = true)` is NOT supported in Jakarta Transaction API. Use plain `@Transactional` for all methods in Facade.

### Model Layer
```java
@Entity
@Table(name = "table_name")
@Getter
@Setter
public class EntityName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "column_name", nullable = false, length = 100)
    private String fieldName;
}
```

### DTO Layer
```java
public record RequestDto(
    @NotBlank @Size(max = 200) String fieldName,
    @Email String email
) {}

public record ResponseDto(Long id, String fieldName) {}
```

### Mapper Layer
```java
public final class EntityMapper {
    private EntityMapper() {} // Prevent instantiation
    
    public static Entity toEntity(RequestDto dto) {
        Entity entity = new Entity();
        entity.setFieldName(dto.fieldName());
        return entity;
    }
    
    public static ResponseDto toDto(Entity entity) {
        return new ResponseDto(entity.getId(), entity.getFieldName());
    }
}
```

### Service Layer
```java
@Service
public class EntityService {
    private final EntityRepository repository;
    
    public EntityService(EntityRepository repository) {
        this.repository = repository;
    }
    
    // No @Transactional here - Facade owns transactions
    public Entity create(Entity entity) {
        entity.setCreatedAt(LocalDateTime.now());
        return repository.save(entity);
    }
    
    public Optional<Entity> findById(Long id) {
        return repository.findById(id);
    }
    
    public List<Entity> findAll() {
        return repository.findAll();
    }
}
```

### Facade Layer
```java
@Facade
public class EntityFacade {
    private final EntityService service;
    
    public EntityFacade(EntityService service) {
        this.service = service;
    }
    
    @Transactional
    public ResponseDto create(RequestDto request) {
        Entity entity = EntityMapper.toEntity(request);  // Use Mapper
        Entity saved = service.create(entity);           // Call Service
        return EntityMapper.toDto(saved);                // Use Mapper
    }
    
    @Transactional
    public ResponseDto findById(Long id) {
        Entity entity = service.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Entity not found"));
        return EntityMapper.toDto(entity);
    }
}
```

### Controller Layer
```java
@RestController
public class EntityController {
    private final EntityFacade facade;  // Inject Facade, NOT Service
    
    public EntityController(EntityFacade facade) {
        this.facade = facade;
    }
    
    @PostMapping("/api/v1/entities")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody RequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facade.create(request));
    }
    
    @GetMapping("/api/v1/entities/{id}")
    public ResponseEntity<ResponseDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(facade.findById(id));
    }
}
```

## Allowed Packages (DO NOT ADD NEW ONES)

- `spring-boot-starter-data-jpa` - Database access
- `spring-boot-starter-webmvc` - REST controllers
- `spring-boot-starter-validation` - Request validation
- `spring-boot-starter-actuator` - Health checks
- `spring-boot-starter-flyway` - Database migrations
- `springdoc-openapi-starter-webmvc-ui` - Swagger docs
- `lombok` - Boilerplate reduction
- `dotenv-java` - Environment variables
- `postgresql` - Database driver
- `h2` - Test database

## Completed Tasks Summary

### FN-01 FeeAssignment (DONE)
Created a fee structure module. Admin can create fee items like "Tuition Fee", "Lab Fee" etc. for each college, year level, semester and academic year. Each fee has an amount in UGX. Built the full stack: Entity, DTOs, Mapper, Repository, Service, Facade, Controller, and database migration.

### FN-02 StudentFee (DONE)
Created a student fee assignment module. Links a student to a fee assignment with amount, paid amount, due date, and status. Balance is computed server-side (amount minus paid amount). When a fee is assigned, it fires a FeeAssignedEvent. When a payment is recorded, it fires a PaymentRecordedEvent and auto-updates status to PAID or PARTIAL.

### FN-03 Fee Report (DONE)
Added a read-only report endpoint `GET /api/v1/fees/report` that returns fee structure entries grouped by college, category, year level, and semester. Can filter by `?academicYear=2024`. Used by the reporting module for CSV exports and transcripts.

### MS-01 to MS-04 Messaging (DONE)
Created a full messaging system. Users can send messages with attachments, view inbox/sent/starred, soft delete (per-side), star, archive, and manage drafts. Soft delete is per-side so sender deleting doesn't affect recipient's view. Drafts auto-default subject to "(no subject)" if blank. Sending a message is separate from drafts - drafts are saved independently.

### NT-01 to NT-03 Notifications (DONE)
Created notification system with: notifications table (user, type, title, message, related_id, link, read flag), announcements table (author, title, body, course_id, system_wide flag). Supports dual casing via @JsonProperty for the "read" field. List endpoint accepts both user_id and recipient_id params. Mark-read works via PUT /{id} and POST /{id}/read/. Mark-all-read accepts user_id or recipient_id in body. Announcements can be course-scoped or system-wide.

### NT-04 Event Listeners (DONE)
Created FeeAssignedListener and PaymentRecordedListener that listen to events from the Finance module and automatically create notifications for students. FeeAssignedListener notifies when a fee is assigned. PaymentRecordedListener notifies when a payment is received with remaining balance info.

### NT-05 Push/Email Fan-Out (DONE)
Created NotificationFanOut interface with sendInApp, sendEmail, sendPush methods. NoOpNotificationFanOut is a no-op implementation that just logs. This is an interface seam for future email digest and push notification implementation.

## Tagoole's Assigned Modules (From RTM)

### Finance (FN)
- ~~FN-01: FeeAssignment CRUD~~ DONE
- ~~FN-02: StudentFee CRUD-lite with computed balance~~ DONE
- ~~FN-03: Fee report feed~~ DONE

### Messaging (MS)
- ~~MS-01: Message model with soft delete, star/archive~~ DONE
- ~~MS-02: Inbox routes~~ DONE
- ~~MS-03: Send message + draft deletion~~ DONE
- ~~MS-04: Drafts CRUD~~ DONE

### Notification (NT)
- ~~NT-01: Notification core with dual casing~~ DONE
- ~~NT-02: Mixed casing acceptance~~ DONE (handled via @JsonProperty on "read" field)
- ~~NT-03: Announcements entity + routes~~ DONE
- ~~NT-04: Event listeners wiring~~ DONE (FeeAssignedListener, PaymentRecordedListener)
- ~~NT-05: Push/email fan-out stub~~ DONE (NotificationFanOut interface + NoOpNotificationFanOut)

### Notification (NT)
- NT-01: Notification core with dual casing
- NT-02: Mixed casing acceptance
- NT-03: Announcements entity + routes
- NT-04: Event listeners for cross-module notifications
- NT-05: Push/email fan-out stub

### Content/CMS (CT)
- ~~CT-01: Tables + CRUD for news, events, gallery, FAQs, alumni, etc.~~ DONE (entities + migration)
- CT-02: AppSettings to tenant branding bridge
- CT-03: Admin auth for CMS
- ~~CT-04: Newsletter subscription capture~~ DONE (entity in migration)
- CT-05: Donations intent (deferred)

### Admissions (AD)
- ~~AD-01: Applications table (~90 fields)~~ DONE
- ~~AD-02: Portal OTP aliases~~ DONE
- ~~AD-03: Admissions review surface~~ DONE (in AD-01 ApplicationController)
- ~~AD-04: Contact + partnership forms~~ DONE

### Audit (AU)
- ~~AU-01: Append-only audit_logs~~ DONE

## Package Structure

```
org.nexus.napbackend/
├── configuration/     # Spring beans, properties, filters
├── controller/        # REST endpoints (NO @Transactional)
├── dto/              # Request/Response records
├── exception/        # Global handlers, custom exceptions
├── facade/           # Orchestration layer (@Facade, @Transactional)
├── mapper/           # DTO↔Model conversion (static methods)
├── model/            # JPA entities
├── repository/       # Spring Data JPA interfaces
└── service/          # Business logic (NO @Transactional)
```

## Database Migrations

- Use Flyway for all schema changes
- Migration files go in: `src/main/resources/db/migration/`
- Naming convention: `V{version}__{description}.sql`

## Testing

- Unit tests for services
- Integration tests for repositories
- Controller tests with MockMvc
- Test files in: `src/test/java/`
