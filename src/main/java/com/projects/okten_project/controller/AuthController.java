package com.projects.okten_project.controller;

import com.projects.okten_project.dto.auth.AuthRequestDTO;
import com.projects.okten_project.dto.auth.AuthResponseDTO;
import com.projects.okten_project.dto.auth.SignUpRequestDTO;
import com.projects.okten_project.dto.auth.SignUpResponseDTO;
import com.projects.okten_project.entities.UserRole;
import com.projects.okten_project.services.RefreshTokenService;
import com.projects.okten_project.services.UserService;
import com.projects.okten_project.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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

        String username = refreshTokenService.verifyRefreshToken(refreshToken);
        UserDetails userDetails = userService.loadUserByUsername(username);

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = refreshTokenService.createRefreshToken(username);

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
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(authRequestDto.getUsername(), authRequestDto.getPassword());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        if (authentication.isAuthenticated()) {
            UserDetails user = userService.loadUserByUsername(authRequestDto.getUsername());
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
}
