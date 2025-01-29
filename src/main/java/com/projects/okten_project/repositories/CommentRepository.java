package com.projects.okten_project.repositories;

import com.projects.okten_project.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
