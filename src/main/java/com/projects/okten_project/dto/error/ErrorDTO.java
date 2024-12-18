package com.projects.okten_project.dto.error;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ErrorDTO {
    private String details;
    private LocalDateTime timestamp;
}
