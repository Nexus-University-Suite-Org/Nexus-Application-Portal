package org.nexus.napbackend.configuration;

import org.nexus.napbackend.repository.SiteSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SiteSettingDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SiteSettingDataSeeder.class);

    private final SiteSettingRepository repository;

    public SiteSettingDataSeeder(SiteSettingRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        log.info("SiteSettingDataSeeder — no seed data configured");
    }
}
