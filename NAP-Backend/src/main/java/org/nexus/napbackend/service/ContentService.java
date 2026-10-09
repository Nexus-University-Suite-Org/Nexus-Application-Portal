package org.nexus.napbackend.service;

import java.util.List;
import java.util.Map;
import org.nexus.napbackend.mapper.ContentMapper;
import org.nexus.napbackend.model.Alumni;
import org.nexus.napbackend.model.CmsEvent;
import org.nexus.napbackend.model.CourseCatalog;
import org.nexus.napbackend.model.FacultyMember;
import org.nexus.napbackend.model.Faq;
import org.nexus.napbackend.model.GalleryItem;
import org.nexus.napbackend.model.LegalPage;
import org.nexus.napbackend.model.NewsArticle;
import org.nexus.napbackend.model.PageSection;
import org.nexus.napbackend.model.Partner;
import org.nexus.napbackend.model.Program;
import org.nexus.napbackend.model.QuickLink;
import org.nexus.napbackend.model.Scholarship;
import org.nexus.napbackend.model.StudentStory;
import org.nexus.napbackend.repository.AlumniRepository;
import org.nexus.napbackend.repository.CmsEventRepository;
import org.nexus.napbackend.repository.CourseCatalogRepository;
import org.nexus.napbackend.repository.FacultyMemberRepository;
import org.nexus.napbackend.repository.FaqRepository;
import org.nexus.napbackend.repository.GalleryItemRepository;
import org.nexus.napbackend.repository.LegalPageRepository;
import org.nexus.napbackend.repository.NewsArticleRepository;
import org.nexus.napbackend.repository.PageSectionRepository;
import org.nexus.napbackend.repository.ProgramRepository;
import org.nexus.napbackend.repository.SiteSettingRepository;
import org.nexus.napbackend.repository.PartnerRepository;
import org.nexus.napbackend.repository.QuickLinkRepository;
import org.nexus.napbackend.repository.ScholarshipRepository;
import org.nexus.napbackend.repository.StudentStoryRepository;
import org.nexus.napbackend.tenancy.TenantContext;
import org.springframework.stereotype.Service;

@Service
public class ContentService {

    private final NewsArticleRepository newsRepo;
    private final GalleryItemRepository galleryRepo;
    private final FaqRepository faqRepo;
    private final AlumniRepository alumniRepo;
    private final PartnerRepository partnerRepo;
    private final ScholarshipRepository scholarshipRepo;
    private final StudentStoryRepository studentStoryRepo;
    private final LegalPageRepository legalPageRepo;
    private final QuickLinkRepository quickLinkRepo;
    private final CourseCatalogRepository courseCatalogRepo;
    private final FacultyMemberRepository facultyMemberRepo;
    private final PageSectionRepository pageSectionRepo;
    private final CmsEventRepository cmsEventRepo;
    private final SiteSettingRepository siteSettingRepo;
    private final ProgramRepository programRepo;

    public ContentService(
            NewsArticleRepository newsRepo,
            GalleryItemRepository galleryRepo,
            FaqRepository faqRepo,
            AlumniRepository alumniRepo,
            PartnerRepository partnerRepo,
            ScholarshipRepository scholarshipRepo,
            StudentStoryRepository studentStoryRepo,
            LegalPageRepository legalPageRepo,
            QuickLinkRepository quickLinkRepo,
            CourseCatalogRepository courseCatalogRepo,
            FacultyMemberRepository facultyMemberRepo,
            PageSectionRepository pageSectionRepo,
            CmsEventRepository cmsEventRepo,
            SiteSettingRepository siteSettingRepo,
            ProgramRepository programRepo) {
        this.newsRepo = newsRepo;
        this.galleryRepo = galleryRepo;
        this.faqRepo = faqRepo;
        this.alumniRepo = alumniRepo;
        this.partnerRepo = partnerRepo;
        this.scholarshipRepo = scholarshipRepo;
        this.studentStoryRepo = studentStoryRepo;
        this.legalPageRepo = legalPageRepo;
        this.quickLinkRepo = quickLinkRepo;
        this.courseCatalogRepo = courseCatalogRepo;
        this.facultyMemberRepo = facultyMemberRepo;
        this.pageSectionRepo = pageSectionRepo;
        this.cmsEventRepo = cmsEventRepo;
        this.siteSettingRepo = siteSettingRepo;
        this.programRepo = programRepo;
    }

    public List<Map<String, Object>> findByCollection(String collection) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return switch (collection) {
            case "news" -> newsRepo.findByTenantIdAndPublishedTrueOrderByPublishedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "events" -> cmsEventRepo.findByTenantIdAndPublishedTrueOrderByEventDateDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "gallery" -> galleryRepo.findAllByTenantIdOrderByCreatedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "faqs" -> faqRepo.findAllByTenantIdOrderByDisplayOrderAsc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "alumni" -> alumniRepo.findAllByTenantIdOrderByCreatedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "partners" -> partnerRepo.findAllByTenantIdOrderByCreatedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "scholarships" -> scholarshipRepo.findAllByTenantIdOrderByCreatedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "student_stories" -> studentStoryRepo.findAllByTenantIdOrderByCreatedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "legal_pages" -> legalPageRepo.findAllByTenantIdOrderByCreatedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "quick_links" -> quickLinkRepo.findAllByTenantIdOrderByDisplayOrderAsc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "courses" -> courseCatalogRepo.findByTenantIdAndPublishedTrueOrderByCreatedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "faculty" -> facultyMemberRepo.findAllByTenantIdOrderByDisplayOrderAsc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "page_sections" -> pageSectionRepo.findAllByTenantIdOrderByCreatedAtDesc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "programs" -> programRepo
                    .findByTenantIdAndDeletedAtIsNullOrderByDisplayOrderAscProgramNameAsc(tenantId)
                    .stream().map(ContentMapper::toMap).toList();
            case "site_settings" -> siteSettingRepo
                    .findByTenantIdOrderBySettingKey(tenantId).stream()
                    .map(s -> {
                        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                        m.put("settingKey", s.getSettingKey());
                        m.put("settingValue", s.getSettingValue());
                        return m;
                    }).toList();
            default -> throw new IllegalArgumentException(
                    "Unknown collection: " + collection + ". Valid collections: "
                            + "news, events, gallery, faqs, alumni, partners, scholarships, "
                            + "student_stories, legal_pages, quick_links, courses, faculty, page_sections, programs, site_settings");
        };
    }
}
