package org.nexus.napbackend.controller;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/storage")
public class StorageController {

    private static final Logger log = LoggerFactory.getLogger(StorageController.class);

    private static final String FILES_PREFIX = "/api/v1/storage/files/";

    @Value("${nap.storage.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "path", defaultValue = "general") String path) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "File is empty"));
        }

        try {
            Path targetDir = Paths.get(uploadDir, path).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            String safeName = file.getOriginalFilename() != null
                    ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                    : "upload";
            String filename = System.currentTimeMillis() + "-" + safeName;
            Path target = targetDir.resolve(filename);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            String downloadUrl = FILES_PREFIX + path + "/" + filename;
            log.info("File uploaded: {} ({} bytes)", target, file.getSize());
            return ResponseEntity.ok(Map.of("ok", true, "url", downloadUrl));

        } catch (IOException e) {
            log.error("File upload failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("ok", false, "message", "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/files/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String relativePath = uri.substring(FILES_PREFIX.length());

        if (relativePath.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize()
                .resolve(relativePath).normalize();

        log.info("Serving file: {}", filePath);

        if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
            log.warn("File not found: {}", filePath);
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(filePath);
        String contentType = determineContentType(relativePath);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                .body(resource);
    }

    private String determineContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG_VALUE;
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG_VALUE;
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF_VALUE;
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".bmp")) return "image/bmp";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".avif")) return "image/avif";
        if (lower.endsWith(".pdf")) return "application/pdf";
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
}
