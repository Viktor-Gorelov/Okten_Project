package com.projects.okten_project.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SignUpRequestDTO {

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 2, max = 50, message = "Username must be between 2 and 50 characters")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 2, max = 50, message = "Password must be between 2 and 50 characters")
    private String password;
}
