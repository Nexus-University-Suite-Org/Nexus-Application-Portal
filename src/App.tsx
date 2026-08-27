import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageTransition from "@/components/PageTransition";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
const Index = lazy(() => import("./pages/Index.tsx"));
  const StudyAtPortal = lazy(() => import("./pages/StudyAtPortal.tsx"));
const StudyItemPage = lazy(() => import("./pages/StudyItemPage.tsx"));
const StudentsPage = lazy(() => import("./pages/StudentsPage.tsx"));
const ResearchPage = lazy(() => import("./pages/ResearchPage.tsx"));
const ResearchOpportunitiesPage = lazy(
  () => import("./pages/ResearchOpportunitiesPage.tsx"),
);
const AboutPage = lazy(() => import("./pages/AboutPage.tsx"));
const NewsPage = lazy(() => import("./pages/NewsPage.tsx"));
const NewsArticlePage = lazy(() => import("./pages/NewsArticlePage.tsx"));
const QuickLinksPage = lazy(() => import("./pages/QuickLinksPage.tsx"));
const QuickLinkDetailPage = lazy(
  () => import("./pages/QuickLinkDetailPage.tsx"),
);
const LegalPage = lazy(() => import("./pages/LegalPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AboutInstitutePage = lazy(() => import("./pages/AboutInstitutePage.tsx"));
const FactsFiguresPage = lazy(() => import("./pages/FactsFiguresPage.tsx"));
const VisitInstitutePage = lazy(() => import("./pages/VisitInstitutePage.tsx"));
const AlumniPage = lazy(() => import("./pages/AlumniPage.tsx"));
const HistoryTimelinePage = lazy(
  () => import("./pages/HistoryTimelinePage.tsx"),
);
const AdmissionsListsPage = lazy(
  () => import("./pages/AdmissionsListsPage.tsx"),
);
const HowToApplyPage = lazy(() => import("./pages/HowToApplyPage.tsx"));
const ApplicationStartPage = lazy(
  () => import("./pages/ApplicationStartPage.tsx"),
);
const CoursesListingsPage = lazy(
  () => import("./pages/CoursesListingsPage.tsx"),
);
const FeesPaymentPage = lazy(() => import("./pages/FeesPaymentPage.tsx"));
const InternationalStudentsPage = lazy(
  () => import("./pages/InternationalStudentsPage.tsx"),
);
const ScholarshipsPage = lazy(() => import("./pages/ScholarshipsPage.tsx"));
const LearningOnlinePage = lazy(() => import("./pages/LearningOnlinePage.tsx"));
const FAQPage = lazy(() => import("./pages/FAQPage.tsx"));
const ProgramsPage = lazy(() => import("./pages/ProgramsPage.tsx"));
const ImpactPage = lazy(() => import("./pages/ImpactPage.tsx"));
const DonatePage = lazy(() => import("./pages/DonatePage.tsx"));
const GalleryPage = lazy(() => import("./pages/GalleryPage.tsx"));
const PartnersPage = lazy(() => import("./pages/PartnersPage.tsx"));
const PartnershipDiscussionPage = lazy(
  () => import("./pages/PartnershipDiscussionPage.tsx"),
);
const StudentStoriesPage = lazy(() => import("./pages/StudentStoriesPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const MessagesPage = lazy(() => import("./pages/MessagesPage.tsx"));
const MessageDetailPage = lazy(() => import("./pages/MessageDetailPage.tsx"));
const ComposeMessagePage = lazy(() => import("./pages/ComposeMessagePage.tsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.tsx"));
const ChatBot = lazy(() => import("@/components/ChatBot"));

// Admin pages
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage.tsx"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.tsx"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage.tsx"));
const NewsArticlesPage = lazy(() => import("./pages/admin/NewsArticlesPage.tsx"));
const EventsPage = lazy(() => import("./pages/admin/EventsPage.tsx"));
const GalleryAdminPage = lazy(() => import("./pages/admin/GalleryPage.tsx"));
const FaqsPage = lazy(() => import("./pages/admin/FaqsPage.tsx"));
const AlumniAdminPage = lazy(() => import("./pages/admin/AlumniPage.tsx"));
const PartnersAdminPage = lazy(() => import("./pages/admin/PartnersPage.tsx"));
const ScholarshipsAdminPage = lazy(() => import("./pages/admin/ScholarshipsPage.tsx"));
const StudentStoriesAdminPage = lazy(() => import("./pages/admin/StudentStoriesPage.tsx"));
const CoursesPage = lazy(() => import("./pages/admin/CoursesPage.tsx"));
const FacultyPage = lazy(() => import("./pages/admin/FacultyPage.tsx"));
const ProgrammesPage = lazy(() => import("./pages/admin/ProgrammesPage.tsx"));
const ApplicationsPage = lazy(() => import("./pages/admin/ApplicationsPage.tsx"));
const FeeAssignmentsPage = lazy(() => import("./pages/admin/FeeAssignmentsPage.tsx"));
const ContactsAdminPage = lazy(() => import("./pages/admin/ContactsPage.tsx"));
const PartnershipsAdminPage = lazy(() => import("./pages/admin/PartnershipsPage.tsx"));
const NewsletterAdminPage = lazy(() => import("./pages/admin/NewsletterPage.tsx"));
const NotificationsAdminPage = lazy(() => import("./pages/admin/NotificationsPage.tsx"));
const AnnouncementsAdminPage = lazy(() => import("./pages/admin/AnnouncementsPage.tsx"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage.tsx"));
const AuditLogsPage = lazy(() => import("./pages/admin/AuditLogsPage.tsx"));
const QuickLinksAdminPage = lazy(() => import("./pages/admin/QuickLinksPage.tsx"));
const LegalPagesAdminPage = lazy(() => import("./pages/admin/LegalPagesPage.tsx"));
const PageSectionsAdminPage = lazy(() => import("./pages/admin/PageSectionsPage.tsx"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-8">
    <p className="font-body text-sm tracking-[0.2em] uppercase text-muted-foreground">
      Loading page
    </p>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
      <PageTransition key={location.pathname}>
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/study" element={<StudyAtPortal />} />
            <Route path="/study/:slug" element={<StudyItemPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route
              path="/research/opportunities"
              element={<ResearchOpportunitiesPage />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsArticlePage />} />
            <Route path="/quick-links" element={<QuickLinksPage />} />
            <Route
              path="/quick-links/:slug"
              element={<QuickLinkDetailPage />}
            />
            <Route path="/legal/:slug" element={<LegalPage />} />
            <Route path="/about/institute" element={<AboutInstitutePage />} />
            <Route path="/about/facts-figures" element={<FactsFiguresPage />} />
            <Route path="/about/visit" element={<VisitInstitutePage />} />
            <Route path="/about/alumni" element={<AlumniPage />} />
            <Route path="/about/history" element={<HistoryTimelinePage />} />
            <Route path="/admissions/lists" element={<AdmissionsListsPage />} />
            <Route
              path="/admissions/how-to-apply"
              element={<HowToApplyPage />}
            />
            <Route
              path="/admissions/application/start"
              element={<ApplicationStartPage />}
            />
            <Route
              path="/admissions/courses"
              element={<CoursesListingsPage />}
            />
            <Route path="/admissions/fees" element={<FeesPaymentPage />} />
            <Route
              path="/admissions/international"
              element={<InternationalStudentsPage />}
            />
            <Route
              path="/admissions/scholarships"
              element={<ScholarshipsPage />}
            />
            <Route path="/admissions/online" element={<LearningOnlinePage />} />
            <Route path="/admissions/faq" element={<FAQPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route
              path="/partnership-discussion"
              element={<PartnershipDiscussionPage />}
            />
            <Route path="/stories" element={<StudentStoriesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/compose" element={<ComposeMessagePage />} />
            <Route path="/messages/:id" element={<MessageDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="news" element={<NewsArticlesPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="gallery" element={<GalleryAdminPage />} />
              <Route path="faqs" element={<FaqsPage />} />
              <Route path="alumni" element={<AlumniAdminPage />} />
              <Route path="partners" element={<PartnersAdminPage />} />
              <Route path="scholarships" element={<ScholarshipsAdminPage />} />
              <Route path="student-stories" element={<StudentStoriesAdminPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="faculty" element={<FacultyPage />} />
              <Route path="programmes" element={<ProgrammesPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="fees" element={<FeeAssignmentsPage />} />
              <Route path="contacts" element={<ContactsAdminPage />} />
              <Route path="partnerships" element={<PartnershipsAdminPage />} />
              <Route path="newsletter" element={<NewsletterAdminPage />} />
              <Route path="notifications" element={<NotificationsAdminPage />} />
              <Route path="announcements" element={<AnnouncementsAdminPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="quick-links" element={<QuickLinksAdminPage />} />
              <Route path="legal-pages" element={<LegalPagesAdminPage />} />
              <Route path="page-sections" element={<PageSectionsAdminPage />} />
            </Route>
          </Routes>
        </Suspense>
      </PageTransition>
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </>
  );
};

const App = () => {
  useSmoothScroll();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminAuthProvider>
            <AnimatedRoutes />
          </AdminAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
