package org.nexus.napbackend.service;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.nexus.napbackend.dto.SettingDefinition;
import org.nexus.napbackend.model.SiteSetting;
import org.nexus.napbackend.model.Tenant;
import org.nexus.napbackend.repository.SiteSettingRepository;
import org.nexus.napbackend.repository.TenantRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/**
 * Resolves and manages tenants.
 *
 * <p>Resolution accepts either the numeric id or the {@code code}. Results are
 * cached because the tenant filter looks one up on every request.
 */
@Service
public class TenantService {

    private final TenantRepository repository;
    private final SiteSettingRepository siteSettingRepository;
    private final SettingsCatalog catalog;

    private final ConcurrentHashMap<String, Optional<Tenant>> byRef = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Optional<Tenant>> byDomain = new ConcurrentHashMap<>();

    public TenantService(TenantRepository repository,
                         SiteSettingRepository siteSettingRepository,
                         SettingsCatalog catalog) {
        this.repository = repository;
        this.siteSettingRepository = siteSettingRepository;
        this.catalog = catalog;
    }

    public List<Tenant> findAll() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Optional<Tenant> findById(Long id) {
        return id == null ? Optional.empty() : repository.findById(id);
    }

    /**
     * Resolve a tenant from an {@code X-Tenant} value: a numeric id or a code,
     * case-insensitively.
     */
    public Optional<Tenant> resolve(String ref) {
        if (ref == null || ref.isBlank()) {
            return Optional.empty();
        }
        String trimmed = ref.trim();
        return byRef.computeIfAbsent(trimmed.toLowerCase(), key -> {
            if (key.chars().allMatch(Character::isDigit)) {
                try {
                    return repository.findById(Long.valueOf(key));
                } catch (NumberFormatException e) {
                    return Optional.empty();
                }
            }
            return repository.findByCodeIgnoreCase(key);
        });
    }

    /** Resolve a tenant from the request host, matching a configured custom domain. */
    public Optional<Tenant> findByDomain(String host) {
        String normalized = normalizeHost(host);
        if (normalized.isEmpty()) {
            return Optional.empty();
        }
        return byDomain.computeIfAbsent(normalized, repository::findByDomainIgnoreCase);
    }

    public boolean existsByCode(String code) {
        return code != null && repository.existsByCodeIgnoreCase(code.trim());
    }

    @Transactional
    public Tenant create(String name, String code, String domain) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tenant name is required");
        }
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Tenant code is required");
        }
        String normalizedCode = code.trim().toLowerCase();
        if (!normalizedCode.matches("[a-z0-9-]{2,64}")) {
            throw new IllegalArgumentException(
                    "Tenant code must be 2-64 characters of a-z, 0-9 or hyphen");
        }
        if (existsByCode(normalizedCode)) {
            throw new IllegalArgumentException("Tenant code already in use: " + normalizedCode);
        }

        Tenant tenant = new Tenant();
        tenant.setName(name.trim());
        tenant.setCode(normalizedCode);
        tenant.setDomain(normalizeHost(domain).isEmpty() ? null : normalizeHost(domain));
        tenant.setActive(true);
        tenant.setCreatedAt(LocalDateTime.now());
        Tenant saved = repository.save(tenant);

        seedDefaultSettings(saved);
        byRef.clear();
        byDomain.clear();
        return saved;
    }

    /**
     * Enable or disable a university. A disabled tenant's admins cannot
     * authenticate (see {@code JwtAuthFilter} / admin login). Clears the
     * resolution caches so the change takes effect on the next request.
     */
    @Transactional
    public Tenant setActive(Long id, boolean active) {
        Tenant tenant = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));
        tenant.setActive(active);
        Tenant saved = repository.save(tenant);
        byRef.clear();
        byDomain.clear();
        return saved;
    }

    private void seedDefaultSettings(Tenant tenant) {
        insertDefault(tenant.getId(), "portal_name", tenant.getName());
        for (SettingDefinition definition : catalog.definitions()) {
            if ("portal_name".equals(definition.key())) {
                continue;
            }
            insertDefault(tenant.getId(), definition.key(), definition.defaultValue());
        }
    }

    private void insertDefault(Long tenantId, String key, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        SiteSetting setting = new SiteSetting();
        setting.setTenantId(tenantId);
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        setting.setCreatedAt(LocalDateTime.now());
        setting.setUpdatedAt(LocalDateTime.now());
        siteSettingRepository.save(setting);
    }

    private static String normalizeHost(String host) {
        if (host == null) {
            return "";
        }
        String normalized = host.trim().toLowerCase();
        int colon = normalized.indexOf(':');
        if (colon >= 0) {
            normalized = normalized.substring(0, colon);
        }
        return normalized;
    }
}
