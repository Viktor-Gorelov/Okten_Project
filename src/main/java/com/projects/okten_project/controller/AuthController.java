package com.projects.okten_project.controller;

import com.projects.okten_project.dto.auth.AuthRequestDTO;
import com.projects.okten_project.dto.auth.AuthResponseDTO;
import com.projects.okten_project.dto.auth.SignUpRequestDTO;
import com.projects.okten_project.dto.auth.SignUpResponseDTO;
import com.projects.okten_project.dto.user.UserDTO;
import com.projects.okten_project.entities.User;
import com.projects.okten_project.entities.UserRole;
import com.projects.okten_project.services.RefreshTokenService;
import com.projects.okten_project.services.UserService;
import com.projects.okten_project.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final UserService userService;

    private final RefreshTokenService refreshTokenService;

    private final JwtUtil jwtUtil;

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refreshAccessToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        String email = refreshTokenService.verifyRefreshToken(refreshToken);
        User userDetails = userService.loadUserByEmail(email);

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = refreshTokenService.createRefreshToken(email);

        return ResponseEntity.ok(
                AuthResponseDTO.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .build()
        );
    }
    @PostMapping("/signup")
    public ResponseEntity<SignUpResponseDTO> signUp(@RequestBody @Valid SignUpRequestDTO signUpRequestDto) {
        SignUpResponseDTO signUpResponseDto = userService.createAuthorizeUser(signUpRequestDto, UserRole.ADMIN);
        return ResponseEntity.ok(signUpResponseDto);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponseDTO> signIn(@RequestBody @Valid AuthRequestDTO authRequestDto) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(authRequestDto.getEmail(), authRequestDto.getPassword());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        UserDTO userDTO = userService.loadUserDTOByEmail(authRequestDto.getEmail());


        if (authentication.isAuthenticated()) {
            User user = userService.loadUserByEmail(authRequestDto.getEmail());

            if (Boolean.TRUE.equals(user.getIsBanned())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            userDTO.setLastLogin(String.valueOf(OffsetDateTime.now()));
            String accessToken = jwtUtil.generateAccessToken(user);
            String refreshToken = refreshTokenService.createRefreshToken(user.getUsername());
            return ResponseEntity.ok(
                    AuthResponseDTO.builder()
                            .accessToken(accessToken)
                            .refreshToken(refreshToken)
                            .build()
            );
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/activate/{id}")
    public ResponseEntity<?> generateActivationLink(@PathVariable Long id) {
        User user = userService.findUser(id);

        if (user.getIsActive()) {
            return ResponseEntity.badRequest().body("User is already active");
        }

        String activationToken = jwtUtil.generateActivationToken(user);
        String activationLink = "http://localhost/activate/" + activationToken;

        return ResponseEntity.ok(Map.of("activationLink", activationLink));
    }

    @PostMapping("/activate")
    public ResponseEntity<?> activateManager(@RequestBody Map<String, String> requestBody) {
        String token = requestBody.get("token");
        String confirmPassword = requestBody.get("confirmPassword");

        if (token == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body("Token and password must be provided");
        }

        Claims claims = jwtUtil.extractAllClaims(token);

        if (!"activate".equals(claims.get("token_type"))) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        Long userId = claims.get("user_id", Long.class);
        User user = userService.findUser(userId);

        user.setIsActive(true);
        user.setPassword(userService.encodePassword(confirmPassword));
        userService.saveUser(user);

        return ResponseEntity.ok("User activated successfully");
    }
}
