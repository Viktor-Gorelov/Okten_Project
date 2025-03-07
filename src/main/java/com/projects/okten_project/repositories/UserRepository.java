package com.projects.okten_project.repositories;

import com.projects.okten_project.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.userRole = 'MANAGER' ORDER BY u.registeredAt DESC")
    Page<User> findAllManagers(Pageable pageable);
}