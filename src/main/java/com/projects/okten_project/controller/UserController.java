package com.projects.okten_project.controller;
import com.projects.okten_project.dto.user.UserDTO;
import com.projects.okten_project.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/managers")
    public ResponseEntity<Page<UserDTO>> getManagers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getAllManagersWithPagination(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id){
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO){
        return ResponseEntity.ok(userService.createManager(userDTO));
    }

    @PutMapping("/ban/{id}")
    public ResponseEntity<Void> banUserById(@PathVariable Long id){
        userService.banUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/unban/{id}")
    public ResponseEntity<Void> unBanUserById(@PathVariable Long id){
        userService.unBanUser(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id){
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }
}
