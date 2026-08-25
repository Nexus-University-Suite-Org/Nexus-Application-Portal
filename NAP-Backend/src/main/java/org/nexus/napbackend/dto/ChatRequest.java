package org.nexus.napbackend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ChatRequest(
        @NotEmpty(message = "Messages list must not be empty")
        @Size(max = 50, message = "Too many messages")
        @Valid
        List<ChatMessage> messages
) {
    public record ChatMessage(
            @jakarta.validation.constraints.NotBlank(message = "Role must not be blank")
            String role,

            @jakarta.validation.constraints.NotBlank(message = "Content must not be blank")
            @jakarta.validation.constraints.Size(max = 4000, message = "Message too long")
            String content
    ) {}
}
