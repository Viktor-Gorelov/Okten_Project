package com.projects.okten_project.mapper;

import com.projects.okten_project.dto.user.UserDTO;
import com.projects.okten_project.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserDTO mapToDTO(User user){
        return UserDTO.builder()
                .id(user.getId())
                .userRole(user.getUserRole())
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    public User mapToUser(UserDTO userDTO){
        User user = new User();
        user.setId(userDTO.getId());
        user.setUserRole(userDTO.getUserRole());
        user.setEmail(userDTO.getEmail());
        user.setUsername(userDTO.getUsername());
        return user;
    }
}
