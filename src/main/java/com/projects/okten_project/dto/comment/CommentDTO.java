package com.projects.okten_project.dto.comment;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentDTO {
    private String text;
    private String manager;
    private Long owner_id;
    private String created_at;
}
