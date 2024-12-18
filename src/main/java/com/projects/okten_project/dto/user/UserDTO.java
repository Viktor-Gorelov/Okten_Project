package com.projects.okten_project.dto.user;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String userRole;
    private String email;
    private String username;
}
