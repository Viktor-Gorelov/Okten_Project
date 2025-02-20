package com.projects.okten_project.dto.user;

import jakarta.persistence.Convert;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String userRole;
    private String email;
    private String name;
    private String surname;
    private Boolean isActive;
    private String lastLogin;
}
