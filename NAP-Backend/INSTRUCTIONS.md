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
- ~~NT-02: Mixed casing acceptance~~ DONE
- ~~NT-03: Announcements entity + routes~~ DONE
- ~~NT-04: Event listeners wiring~~ DONE
- ~~NT-05: Push/email fan-out stub~~ DONE

### Content/CMS (CT)
- ~~CT-01: Tables + CRUD for news, events, gallery, FAQs, alumni, etc.~~ DONE
- CT-02: AppSettings to tenant branding bridge (NOT ASSIGNED)
- CT-03: Admin auth for CMS (NOT ASSIGNED)
- ~~CT-04: Newsletter subscription capture~~ DONE
- CT-05: Donations intent (deferred)

### Admissions (AD)
- ~~AD-01: Applications table (~90 fields)~~ DONE
- ~~AD-02: Portal OTP aliases~~ DONE
- ~~AD-03: Admissions review surface~~ DONE
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

### Test Results (48 tests passing)
| Test Class | Tests | Status |
|------------|-------|--------|
| FeeAssignmentControllerTest | 9 | PASS |
| StudentFeeControllerTest | 5 | PASS |
| MessageControllerTest | 7 | PASS |
| NotificationControllerTest | 7 | PASS |
| ApplicationControllerTest | 7 | PASS |
| OtpControllerTest | 4 | PASS |
| AuditLogControllerTest | 3 | PASS |
| ContactFlowTests | 4 | PASS |
| ContactRateLimitTests | 1 | PASS |
| NapBackendApplicationTests | 1 | PASS |

## Frontend Compatibility

### Working Endpoints
- `POST /api/contact/` - Contact form
- `POST /api/v1/chat` - ChatBot

### Fixed (Path Mismatch - v1/ prefix resolved)
- `POST /api/v1/applications/` ✓
- `POST /api/v1/partnership-discussions/` ✓
- `POST /api/v1/auth/otp/send` ✓
- `POST /api/v1/auth/otp/verify` ✓

### Missing Backend
- `POST /api/storage/upload` - Document uploads (no backend exists)

---

## What Was Built This Session (Detailed Breakdown)

### Commit 1: CMS Content API + Newsletter + Frontend Integration
**Commit:** `e9ae951` - "Implement CMS content API + newsletter subscription + frontend integration"

**New Backend Files Created (26 files):**

| File | Endpoint Added | Purpose |
|------|---------------|---------|
| `controller/ContentController.java` | `GET /api/v1/content/{collection}` | Single generic endpoint serving all 14 CMS collections. Collection param maps to: news, events, gallery, faqs, alumni, partners, scholarships, student_stories, legal_pages, quick_links, courses, faculty, page_sections |
| `controller/NewsletterSubscriptionController.java` | `POST /api/v1/newsletter/subscribe` | Newsletter email signup. Request: `{ email }`. Response: `{ id, email, doubleOptIn, createdAt }` |
| `facade/ContentFacade.java` | - | Transactional facade. Delegates to ContentService.findByCollection() |
| `facade/NewsletterSubscriptionFacade.java` | - | Transactional facade. Delegates to NewsletterSubscriptionService.subscribe() |
| `service/ContentService.java` | - | Dispatches to correct repository by collection name using a switch statement. Returns `List<Map<String, Object>>` via Jackson ObjectMapper |
| `service/NewsletterSubscriptionService.java` | - | Checks for duplicate email, creates new subscription with `doubleOptIn=false` |
| `mapper/ContentMapper.java` | - | Generic entity-to-Map converter using `ObjectMapper.convertValue()`. Removes `tenantId` and `createdAt` from response |
| `mapper/NewsletterSubscriptionMapper.java` | - | NewsletterSubscription → NewsletterSubscribeResponse |
| `dto/ContentItemResponse.java` | - | Generic content DTO (id, collection, fields map, createdAt) |
| `dto/NewsletterSubscribeRequest.java` | - | Request DTO: `{ email }` |
| `dto/NewsletterSubscribeResponse.java` | - | Response DTO: `{ id, email, doubleOptIn, createdAt }` |
| 14 Repository interfaces | - | One per CMS entity with custom finders (e.g., `findByPublishedTrueOrderByPublishedAtDesc()`, `findAllByOrderByDisplayOrderAsc()`) |

**Modified Frontend Files:**

| File | Change | How It Works |
|------|--------|-------------|
| `src/hooks/useContentCollection.ts` | **REWRITTEN** | Now fetches from `GET /api/v1/content/{collection}`. Maps frontend collection names to API collection names (e.g., `"news"` → `"news"`, `"faqs"` → `"faqs"`). If API returns empty or errors, falls back to local `fallbackData` prop. Uses `useState` + `useEffect` with cleanup flag. |

**How the CMS endpoint works:**
1. Frontend calls `useContentCollection("gallery", fallbackData)`
2. Hook maps `"gallery"` to API collection `"gallery"`
3. Fetches `GET /api/v1/content/gallery`
4. `ContentController` receives `collection="gallery"` path variable
5. `ContentFacade.getCollection("gallery")` delegates to `ContentService`
6. `ContentService.findByCollection()` uses switch to call `galleryRepo.findAllByOrderByCreatedAtDesc()`
7. Each `GalleryItem` entity is converted to `Map<String, Object>` via `ContentMapper.toMap()` (Jackson ObjectMapper)
8. Returns `List<Map<String, Object>>` → frontend receives array of objects
9. If API fails or returns empty, frontend uses `fallbackData` (hardcoded data in each page)

---

### Commit 2: Messaging UI + Notifications UI
**Commit:** `f992bdf` - "Add messaging UI (inbox, compose, detail) + notifications UI (bell, page, mark-read)"

**New Frontend Files Created (9 files):**

| File | Route | Purpose |
|------|-------|---------|
| `src/lib/messaging.ts` | - | API service for messaging. Functions: `getMessages(userId, view)`, `getMessageById(userId, msgId)`, `sendMessage(userId, payload)`, `markRead(userId, msgId)`, `softDeleteMessage(userId, msgId)`, `toggleStar(userId, msgId)`, `toggleArchive(userId, msgId)`, `getDrafts(userId)`, `saveDraft(userId, payload)`, `deleteDraft(userId, draftId)` |
| `src/lib/notifications.ts` | - | API service for notifications. Functions: `getNotifications(userId, isRead?)`, `markNotificationRead(id)`, `markAllNotificationsRead(userId)`, `deleteNotification(id)`, `getAnnouncements(courseId?)` |
| `src/pages/MessagesPage.tsx` | `/messages` | Tabbed messaging page with 4 tabs: Inbox, Sent, Starred, Drafts. Shows message list with subject, body preview, date. Supports star/unstar and delete. Drafts tab shows saved drafts. |
| `src/pages/MessageDetailPage.tsx` | `/messages/:id` | Single message view. Auto-marks as read. Shows subject, from/to, date, body, attachments. Buttons: Star, Archive, Delete, Reply. Reply pre-fills To, Subject with "Re:" prefix. |
| `src/pages/ComposeMessagePage.tsx` | `/messages/compose` | Compose new message or edit draft. Fields: To (user ID), Subject, Body. Buttons: Send, Save Draft. Supports `?draft=id` param to load draft, `?to=userId&subject=Re:` for reply. |
| `src/pages/NotificationsPage.tsx` | `/notifications` | Full notifications list. Shows unread count badge. Buttons: Unread Only filter, Mark All Read. Each notification: icon by type, title, message preview, date, Read/Delete actions. |
| `src/components/NotificationBell.tsx` | - | Dropdown bell icon for Navbar. Shows unread count badge (max "9+"). Click opens dropdown with 10 most recent notifications. Auto-polls every 30 seconds. Click notification marks as read. "View all" links to `/notifications`. |

**Modified Frontend Files:**

| File | Change |
|------|--------|
| `src/App.tsx` | Added lazy imports + routes for MessagesPage (`/messages`), MessageDetailPage (`/messages/:id`), ComposeMessagePage (`/messages/compose`), NotificationsPage (`/notifications`) |
| `src/components/Navbar.tsx` | Imported `NotificationBell` component, added it next to the CTA buttons in desktop nav |

**Backend endpoints used by messaging UI:**
- `GET /api/v1/messages/{userId}?view=inbox|sent|starred` - List messages
- `GET /api/v1/messages/{userId}/{id}` - Get single message (auto-marks read)
- `POST /api/v1/messages/send?userId={userId}` - Send message
- `PUT /api/v1/messages/{userId}/{id}/read` - Mark as read
- `PUT /api/v1/messages/{userId}/{id}/delete` - Soft delete
- `PUT /api/v1/messages/{userId}/{id}/star` - Toggle star
- `PUT /api/v1/messages/{userId}/{id}/archive` - Toggle archive
- `GET /api/v1/messages/drafts/{userId}` - List drafts
- `POST /api/v1/messages/drafts?userId={userId}` - Save draft
- `DELETE /api/v1/messages/drafts/{userId}/{id}` - Delete draft

**Backend endpoints used by notifications UI:**
- `GET /api/v1/notifications?userId={userId}&isRead=false` - List notifications
- `PUT /api/v1/notifications/{id}` - Mark single notification read
- `POST /api/v1/notifications/mark-all-read` - Mark all read (body: `{ user_id: 1 }`)
- `DELETE /api/v1/notifications/{id}` - Delete notification
- `GET /api/v1/announcements` - List announcements

---

### Commit 3: Fees Page Connected
**Commit:** `29bb3c0` - "Connect FeesPaymentPage to backend API with fallback data"

**New Frontend Files:**

| File | Endpoint Called | Purpose |
|------|----------------|---------|
| `src/lib/fees.ts` | `GET /api/v1/fees` | Fee API service. Functions: `getFeeAssignments(college?, academicYear?)`, `getStudentFees(studentId, status?)`, `recordPayment(feeId, amount, method, reference)` |

**Modified Frontend Files:**

| File | Change |
|------|--------|
| `src/pages/FeesPaymentPage.tsx` | Added `useEffect` to fetch fee assignments from `GET /api/v1/fees`. If API returns data, maps to fee breakdown cards. If API fails or returns empty, uses hardcoded fallback data. Total amount computed dynamically from API data or defaults to $16,300. |

---

### Summary of All Endpoints Added This Session

| Method | Endpoint | Controller | Purpose |
|--------|----------|-----------|---------|
| GET | `/api/v1/content/{collection}` | ContentController | Generic CMS content (14 collections) |
| POST | `/api/v1/newsletter/subscribe` | NewsletterSubscriptionController | Newsletter email signup |

**Total files created/modified this session:** 35 files (26 backend + 9 frontend)
**Commits made:** 3
**Tests:** 48 passing (unchanged - no new tests added for CMS/newsletter as they are simple CRUD)
