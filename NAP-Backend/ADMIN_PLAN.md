# Nexus Application Portal — Admin Side Development Plan

## Overview
Build a complete admin dashboard with CRUD for all entities. Each feature is committed and pushed individually. Frontend must compile, backend must work before push.

---

## PHASE 1: Backend Fixes & Auth (Do First)

### 1.1 Fix Missing v1/ Prefix
- **Files to modify:** `ContactController.java`, `PartnershipDiscussionController.java`, `OtpController.java`, `StudentAuthController.java`
- **Change:** Add `/api/v1` prefix to match frontend expectations
- **Test:** Verify all endpoints match frontend `src/lib/*.ts` calls
- **Commit:** `fix: add missing v1/ prefix to contact, partnership, otp, and student auth endpoints`

### 1.2 Role-Based Auth Setup
- **Files to modify:** `SecurityConfig.java`, `JwtAuthFilter.java`, `JwtUtil.java`
- **Changes:**
  - Add `ROLE_STUDENT` and `ROLE_REGISTRAR` roles
  - Update `JwtUtil` to include role in token claims
  - Update `SecurityConfig` to protect admin routes with `ROLE_ADMIN`
  - Protect student routes with `ROLE_STUDENT`
- **Commit:** `feat: add role-based auth with ADMIN, STUDENT, and REGISTRAR roles`

### 1.3 Student Registration Endpoint
- **New files:** `StudentAuthController.java` (update), `StudentAuthFacade.java`, `StudentAuthService.java`
- **Endpoint:** `POST /api/v1/auth/student/register`
- **Flow:** Create student account with email verification
- **Commit:** `feat: add student registration endpoint with email verification`

---

## PHASE 2: Backend Admin CRUD Endpoints

For each entity, create: Controller (admin) → Facade → Service → Repository (if missing)

### 2.1 News Articles CRUD
- **New files:** `NewsArticleController.java` (admin), `NewsArticleFacade.java`, `NewsArticleService.java`
- **Endpoints:**
  - `GET /api/v1/admin/news` - List all (paginated, searchable)
  - `GET /api/v1/admin/news/{id}` - Get one
  - `POST /api/v1/admin/news` - Create
  - `PUT /api/v1/admin/news/{id}` - Update
  - `DELETE /api/v1/admin/news/{id}` - Delete
  - `GET /api/v1/admin/news/search?q=&category=&dateFrom=&dateTo=` - Search/filter
- **Commit:** `feat: add news articles admin CRUD endpoints`

### 2.2 Events CRUD
- **New files:** `CmsEventController.java` (admin), `CmsEventFacade.java`, `CmsEventService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add events admin CRUD endpoints`

### 2.3 Gallery Items CRUD
- **New files:** `GalleryItemController.java` (admin), `GalleryItemFacade.java`, `GalleryItemService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add gallery items admin CRUD endpoints`

### 2.4 FAQs CRUD
- **New files:** `FaqController.java` (admin), `FaqFacade.java`, `FaqService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add FAQs admin CRUD endpoints`

### 2.5 Alumni CRUD
- **New files:** `AlumniController.java` (admin), `AlumniFacade.java`, `AlumniService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add alumni admin CRUD endpoints`

### 2.6 Partners CRUD
- **New files:** `PartnerController.java` (admin), `PartnerFacade.java`, `PartnerService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add partners admin CRUD endpoints`

### 2.7 Scholarships CRUD
- **New files:** `ScholarshipController.java` (admin), `ScholarshipFacade.java`, `ScholarshipService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add scholarships admin CRUD endpoints`

### 2.8 Student Stories CRUD
- **New files:** `StudentStoryController.java` (admin), `StudentStoryFacade.java`, `StudentStoryService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add student stories admin CRUD endpoints`

### 2.9 Course Catalog CRUD
- **New files:** `CourseCatalogController.java` (admin), `CourseCatalogFacade.java`, `CourseCatalogService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add course catalog admin CRUD endpoints`

### 2.10 Faculty Members CRUD
- **New files:** `FacultyMemberController.java` (admin), `FacultyMemberFacade.java`, `FacultyMemberService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add faculty members admin CRUD endpoints`

### 2.11 Programmes CRUD
- **New files:** `ProgrammeController.java` (admin - update existing), `ProgrammeFacade.java`, `ProgrammeService.java` (update existing)
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add programmes admin CRUD endpoints`

### 2.12 Quick Links CRUD
- **New files:** `QuickLinkController.java` (admin), `QuickLinkFacade.java`, `QuickLinkService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add quick links admin CRUD endpoints`

### 2.13 Legal Pages CRUD
- **New files:** `LegalPageController.java` (admin), `LegalPageFacade.java`, `LegalPageService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add legal pages admin CRUD endpoints`

### 2.14 Page Sections CRUD
- **New files:** `PageSectionController.java` (admin), `PageSectionFacade.java`, `PageSectionService.java`
- **Endpoints:** Same pattern as 2.1
- **Commit:** `feat: add page sections admin CRUD endpoints`

### 2.15 Contact Submissions (Read-only)
- **Update:** `ContactController.java` or new `AdminContactController.java`
- **Endpoints:**
  - `GET /api/v1/admin/contacts` - List all (paginated, searchable)
  - `GET /api/v1/admin/contacts/{id}` - Get one
  - `PUT /api/v1/admin/contacts/{id}/status` - Update status (new/read/replied)
  - `DELETE /api/v1/admin/contacts/{id}` - Delete
- **Commit:** `feat: add contact submissions admin endpoints`

### 2.16 Partnership Discussions (Read-only)
- **Update:** `PartnershipDiscussionController.java` or new admin controller
- **Endpoints:** Same pattern as 2.15
- **Commit:** `feat: add partnership discussions admin endpoints`

### 2.17 Newsletter Subscriptions (Read-only)
- **Update:** `NewsletterSubscriptionController.java` or new admin controller
- **Endpoints:**
  - `GET /api/v1/admin/newsletter` - List all subscribers
  - `DELETE /api/v1/admin/newsletter/{id}` - Remove subscriber
- **Commit:** `feat: add newsletter subscriptions admin endpoints`

### 2.18 Applications Management
- **Update:** `AdminController.java` (already exists, enhance)
- **Endpoints:**
  - `GET /api/v1/admin/applications` - List (already exists, add more filters)
  - `GET /api/v1/admin/applications/{id}` - Detail (already exists)
  - `PUT /api/v1/admin/applications/{id}/review` - Review (already exists)
  - `GET /api/v1/admin/applications/stats` - Dashboard stats (already exists)
- **Commit:** `feat: enhance applications admin endpoints with additional filters`

### 2.19 Fee Assignments Management
- **Update:** `FeeAssignmentController.java` (already exists, add admin endpoints)
- **Endpoints:**
  - `GET /api/v1/admin/fees` - List all fee assignments
  - `POST /api/v1/admin/fees` - Create fee assignment
  - `PUT /api/v1/admin/fees/{id}` - Update fee assignment
  - `DELETE /api/v1/admin/fees/{id}` - Delete fee assignment
  - `GET /api/v1/admin/student-fees` - List all student fees
  - `POST /api/v1/admin/student-fees` - Assign fee to student
  - `PUT /api/v1/admin/student-fees/{id}` - Update student fee
- **Commit:** `feat: add fee assignments admin endpoints`

### 2.20 Notifications Management
- **Update:** `NotificationController.java` (already exists, add admin endpoints)
- **Endpoints:**
  - `GET /api/v1/admin/notifications` - List all notifications
  - `POST /api/v1/admin/notifications` - Create notification
  - `DELETE /api/v1/admin/notifications/{id}` - Delete notification
  - `POST /api/v1/admin/announcements` - Create announcement
  - `GET /api/v1/admin/announcements` - List all announcements
  - `PUT /api/v1/admin/announcements/{id}` - Update announcement
  - `DELETE /api/v1/admin/announcements/{id}` - Delete announcement
- **Commit:** `feat: add notifications and announcements admin endpoints`

### 2.21 Audit Logs
- **Update:** `AuditLogController.java` (already exists, enhance)
- **Endpoints:**
  - `GET /api/v1/admin/audit-logs` - List all (already exists, add more filters)
  - `GET /api/v1/admin/audit-logs/export` - Export as CSV
- **Commit:** `feat: enhance audit logs admin endpoints with export`

### 2.22 Admin User Management
- **New files:** `AdminUserController.java`, `AdminUserFacade.java`, `AdminUserService.java`
- **Endpoints:**
  - `GET /api/v1/admin/users` - List all admins
  - `POST /api/v1/admin/users` - Create admin
  - `PUT /api/v1/admin/users/{id}` - Update admin
  - `DELETE /api/v1/admin/users/{id}` - Delete admin
  - `PUT /api/v1/admin/users/{id}/password` - Reset password
- **Commit:** `feat: add admin user management endpoints`

---

## PHASE 3: Frontend - Admin Layout & Auth

### 3.1 Admin Login Page
- **New file:** `src/pages/admin/AdminLoginPage.tsx`
- **Features:** Email/password form, JWT token storage, redirect to dashboard
- **Route:** `/admin/login`
- **Commit:** `feat: add admin login page`

### 3.2 Admin Layout with Sidebar
- **New file:** `src/components/admin/AdminLayout.tsx`
- **Features:**
  - Sidebar with collapsible sections
  - Top navbar with admin info, logout
  - Main content area
  - Responsive (mobile hamburger menu)
- **Sidebar sections:**
  - Dashboard
  - Content Management (News, Events, Gallery, FAQs, Alumni, Partners, Scholarships, Student Stories)
  - Academics (Courses, Faculty, Programmes)
  - Admissions (Applications, Reviews)
  - Finance (Fee Assignments, Student Fees)
  - Communications (Messages, Notifications, Announcements, Newsletter)
  - System (Admin Users, Audit Logs, Quick Links, Legal Pages, Page Sections)
- **Commit:** `feat: add admin layout with sidebar navigation`

### 3.3 Admin Dashboard Page
- **New file:** `src/pages/admin/AdminDashboardPage.tsx`
- **Features:**
  - Stats cards (total applications, pending review, admitted, rejected)
  - Monthly trend chart
  - Recent activity feed
  - Quick actions
- **Commit:** `feat: add admin dashboard page`

### 3.4 Auth Context & Route Guards
- **New file:** `src/contexts/AdminAuthContext.tsx`
- **New file:** `src/components/admin/ProtectedRoute.tsx`
- **Features:**
  - JWT token management
  - Admin authentication state
  - Route protection (redirect to login if not authenticated)
  - Role-based access control
- **Commit:** `feat: add admin auth context and route guards`

### 3.5 Update App.tsx Routes
- **Modify:** `src/App.tsx`
- **Changes:** Add `/admin/*` routes with protected layout
- **Commit:** `feat: add admin routes to App.tsx`

---

## PHASE 4: Frontend - Admin CRUD Pages

For each entity, create a page with: Table, Search, Filter, Create/Edit Modal, Delete Confirmation

### 4.1 News Articles Page
- **New file:** `src/pages/admin/NewsArticlesPage.tsx`
- **Features:**
  - Table with columns: Title, Category, Featured, Published, Date
  - Search by title/content
  - Filter by category, published status, date range
  - Create/Edit modal with form
  - Delete confirmation dialog
  - Pagination
- **API service:** `src/lib/admin/news.ts`
- **Commit:** `feat: add news articles admin page with CRUD`

### 4.2 Events Page
- **New file:** `src/pages/admin/EventsPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add events admin page with CRUD`

### 4.3 Gallery Page
- **New file:** `src/pages/admin/GalleryPage.tsx`
- **Features:** Same pattern as 4.1, with image preview
- **Commit:** `feat: add gallery admin page with CRUD`

### 4.4 FAQs Page
- **New file:** `src/pages/admin/FaqsPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add FAQs admin page with CRUD`

### 4.5 Alumni Page
- **New file:** `src/pages/admin/AlumniPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add alumni admin page with CRUD`

### 4.6 Partners Page
- **New file:** `src/pages/admin/PartnersPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add partners admin page with CRUD`

### 4.7 Scholarships Page
- **New file:** `src/pages/admin/ScholarshipsPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add scholarships admin page with CRUD`

### 4.8 Student Stories Page
- **New file:** `src/pages/admin/StudentStoriesPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add student stories admin page with CRUD`

### 4.9 Courses Page
- **New file:** `src/pages/admin/CoursesPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add courses admin page with CRUD`

### 4.10 Faculty Page
- **New file:** `src/pages/admin/FacultyPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add faculty admin page with CRUD`

### 4.11 Programmes Page
- **New file:** `src/pages/admin/ProgrammesPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add programmes admin page with CRUD`

### 4.12 Applications Page
- **New file:** `src/pages/admin/ApplicationsPage.tsx`
- **Features:**
  - Table with columns: Name, Email, Program, Status, Review Status, Date
  - Search by name/email/PRN
  - Filter by status, review status, date range
  - Detail view modal with full application
  - Review actions (admit/reject/waitlist)
  - Pagination
- **Commit:** `feat: add applications admin page with review`

### 4.13 Fee Assignments Page
- **New file:** `src/pages/admin/FeeAssignmentsPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add fee assignments admin page with CRUD`

### 4.14 Student Fees Page
- **New file:** `src/pages/admin/StudentFeesPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add student fees admin page with CRUD`

### 4.15 Contact Submissions Page
- **New file:** `src/pages/admin/ContactsPage.tsx`
- **Features:** Same pattern as 4.1 (read-only, status update)
- **Commit:** `feat: add contact submissions admin page`

### 4.16 Partnership Discussions Page
- **New file:** `src/pages/admin/PartnershipsPage.tsx`
- **Features:** Same pattern as 4.1 (read-only, status update)
- **Commit:** `feat: add partnership discussions admin page`

### 4.17 Newsletter Subscribers Page
- **New file:** `src/pages/admin/NewsletterPage.tsx`
- **Features:** Same pattern as 4.1 (read-only)
- **Commit:** `feat: add newsletter subscribers admin page`

### 4.18 Notifications Page
- **New file:** `src/pages/admin/NotificationsPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add notifications admin page with CRUD`

### 4.19 Announcements Page
- **New file:** `src/pages/admin/AnnouncementsPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add announcements admin page with CRUD`

### 4.20 Admin Users Page
- **New file:** `src/pages/admin/AdminUsersPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add admin users admin page with CRUD`

### 4.21 Audit Logs Page
- **New file:** `src/pages/admin/AuditLogsPage.tsx`
- **Features:**
  - Table with columns: Action, Entity, Entity ID, User, Date
  - Filter by entity, user, date range
  - Export to CSV button
  - Read-only (no create/edit/delete)
- **Commit:** `feat: add audit logs admin page with export`

### 4.22 Quick Links Page
- **New file:** `src/pages/admin/QuickLinksPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add quick links admin page with CRUD`

### 4.23 Legal Pages Page
- **New file:** `src/pages/admin/LegalPagesPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add legal pages admin page with CRUD`

### 4.24 Page Sections Page
- **New file:** `src/pages/admin/PageSectionsPage.tsx`
- **Features:** Same pattern as 4.1
- **Commit:** `feat: add page sections admin page with CRUD`

---

## PHASE 5: Testing & Polish

### 5.1 Backend Testing
- **Test files:** `src/test/java/org/nexus/napbackend/`
- **Tests for:** Each admin controller (CRUD operations)
- **Commit:** `test: add admin controller tests`

### 5.2 Frontend Compilation Check
- **Command:** `npm run build` or `pnpm build`
- **Fix any TypeScript errors**
- **Commit:** `fix: resolve TypeScript compilation errors`

### 5.3 INSTRUCTIONS.md Update
- **Update:** Mark all completed tasks as DONE
- **Commit:** `docs: update INSTRUCTIONS.md with completed tasks`

---

## TOTAL ESTIMATED COMMITS: ~45

## REFERENCE CHECKLIST

When resuming work, check:
1. Which phase was completed?
2. Which task in the current phase was last committed?
3. Run `git log --oneline -5` to see last commits
4. Check `ADMIN_PLAN.md` for current progress
5. Verify backend compiles: `./mvnw clean compile`
6. Verify frontend compiles: `npm run build`

---

## PROGRESS

### Phase 1: Backend Fixes & Auth ✅
- [x] 1.1 Fix missing v1/ prefix (already done)
- [x] 1.2 Role-based auth with ADMIN, STUDENT, REGISTRAR roles
- [x] 1.3 Student registration endpoint (implicit through application)

### Phase 2: Backend Admin CRUDs ✅
- [x] 2.1 News Articles CRUD
- [x] 2.2 Events CRUD
- [x] 2.3 Gallery Items CRUD
- [x] 2.4 FAQs CRUD
- [x] 2.5 Alumni CRUD
- [x] 2.6 Partners CRUD
- [x] 2.7 Scholarships CRUD
- [x] 2.8 Student Stories CRUD
- [x] 2.9 Course Catalog CRUD
- [x] 2.10 Faculty Members CRUD
- [x] 2.11 Quick Links CRUD
- [x] 2.12 Legal Pages CRUD
- [x] 2.13 Page Sections CRUD
- [x] 2.14 Contact Submissions (read-only)
- [x] 2.15 Partnership Discussions (read-only)
- [x] 2.16 Newsletter Subscriptions (read-only)

### Phase 3: Frontend Admin Layout & Auth ✅
- [x] 3.1 Admin Login Page
- [x] 3.2 Admin Layout with Sidebar
- [x] 3.3 Admin Dashboard Page
- [x] 3.4 Auth Context & Route Guards
- [x] 3.5 Update App.tsx Routes

### Phase 4: Frontend Admin CRUD Pages ✅
- [x] 4.1-4.24 All admin pages created

### Phase 5: Testing & Polish (TODO)
- [ ] Backend tests
- [ ] Frontend testing
- [ ] Update INSTRUCTIONS.md

---

## LAST UPDATED: 2026-08-27
