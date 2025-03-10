package com.projects.okten_project.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {

    private String accessToken;

    private String refreshToken;
}
