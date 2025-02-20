package com.projects.okten_project.controller;

import com.projects.okten_project.dto.user.UserDTO;
import com.projects.okten_project.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/managers")
public class ManagerController {
    private final UserService userService;
    @GetMapping("/{id}/name")
    public ResponseEntity<String> getUserNameById(@PathVariable Long id){
        return ResponseEntity.ok(userService.getUserNameById(id));
    }
}
