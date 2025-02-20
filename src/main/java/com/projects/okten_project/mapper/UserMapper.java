package com.projects.okten_project.mapper;

import com.projects.okten_project.dto.user.UserDTO;
import com.projects.okten_project.entities.User;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class UserMapper {
    public UserDTO mapToDTO(User user){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        return UserDTO.builder()
                .id(user.getId())
                .userRole(user.getUserRole())
                .email(user.getEmail())
                .name(user.getName())
                .surname(user.getSurname())
                .isActive(user.getIsActive())
                .lastLogin(user.getLastLogin() != null ? user.getLastLogin().format(formatter) : null)
                .build();
    }

    public User mapToUser(UserDTO userDTO){
        User user = new User();
        user.setId(userDTO.getId());
        user.setUserRole(userDTO.getUserRole());
        user.setEmail(userDTO.getEmail());
        user.setName(userDTO.getName());
        user.setSurname(userDTO.getSurname());
        user.setIsActive(userDTO.getIsActive());
        user.setLastLogin(OffsetDateTime.parse(userDTO.getLastLogin()));
        return user;
    }
}
