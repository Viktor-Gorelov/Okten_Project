package com.projects.okten_project.util;
import com.projects.okten_project.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token.ttl-millis}")
    private long accessTokenTtlMillis;

    @Value("${jwt.refresh-token.ttl-millis}")
    private long refreshTokenTtlMillis;

    private Key key;

    private JwtParser jwtParser;

    @PostConstruct
    public void setUpKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        key = Keys.hmacShaKeyFor(keyBytes);
        jwtParser = Jwts.parserBuilder().setSigningKey(key).build();
    }
    private String generateToken(String email, String id, long ttlMillis, Map<String, Object> claims) {
        return Jwts.builder()
                .addClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .claim("user_id", id)
                .setExpiration(new Date(System.currentTimeMillis() + ttlMillis))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateAccessToken(User user) {
        List<String> roles = user
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return generateToken(user.getUsername(), user.getId().toString(),
                accessTokenTtlMillis, Map.of("roles", roles));
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generateActivationToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("token_type", "activate")
                .claim("user_id", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 30 * 60 * 1000))
                .signWith(key,SignatureAlgorithm.HS256)
                .compact();
    }

    @Transactional
    public String generateRefreshToken(User user) {
        return generateToken(user.getUsername(), user.getId().toString(),
                refreshTokenTtlMillis, Collections.emptyMap());
    }

    public boolean isTokenExpired(String token) {
        Date expireAt = extractFromToken(token, Claims::getExpiration);
        return !expireAt.after(new Date());
    }

    public String extractUsername(String token) {
        return extractFromToken(token, Claims::getSubject);
    }

    public <T> T extractFromToken(String token, Function<Claims, T> extractor) {
        Claims claims = jwtParser.parseClaimsJws(token).getBody();
        return extractor.apply(claims);
    }
}

