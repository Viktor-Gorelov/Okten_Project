package com.projects.okten_project.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class SignUpResponseDTO {

    private Long id;
    @NotBlank(message = "Username cannot be empty")
    private String username;

    private OffsetDateTime registeredAt;
}
