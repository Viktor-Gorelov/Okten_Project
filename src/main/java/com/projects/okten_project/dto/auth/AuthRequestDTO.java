package com.projects.okten_project.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthRequestDTO {

    @NotBlank(message = "Email cannot be blank")
    @Size(min = 2, max = 50, message = "Email must be between 2 and 50 characters")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 2, max = 50, message = "Password must be between 2 and 50 characters")
    private String password;
}
