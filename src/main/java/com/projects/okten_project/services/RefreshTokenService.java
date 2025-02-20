package com.projects.okten_project.services;

import com.projects.okten_project.entities.RefreshToken;
import com.projects.okten_project.repositories.RefreshTokenRepository;
import com.projects.okten_project.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    @Transactional
    public String createRefreshToken(String email) {
        refreshTokenRepository.deleteByUsername(email);
        String token = jwtUtil.generateRefreshToken(userService.loadUserByEmail(email));

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .username(email)
                .expiryDate(Instant.now().plusSeconds(60 * 60 * 24 * 7))
                .build();
        refreshTokenRepository.save(refreshToken);

        return token;
    }

    @Transactional
    public String verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalStateException("Invalid refresh token"));

        if(refreshToken.getExpiryDate().isBefore(Instant.now())){
            throw new IllegalStateException("Refresh token expired");
        }

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getUsername();
    }
}
