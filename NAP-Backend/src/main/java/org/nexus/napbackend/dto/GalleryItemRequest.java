package org.nexus.napbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GalleryItemRequest(
        @NotBlank @Size(max = 500) String src,
        @Size(max = 255) String alt,
        @Size(max = 500) String caption,
        @Size(max = 100) String category,
        @Min(1) Integer span
) {}
