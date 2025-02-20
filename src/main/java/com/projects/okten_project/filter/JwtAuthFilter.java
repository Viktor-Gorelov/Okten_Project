package com.projects.okten_project.filter;

import com.projects.okten_project.services.UserService;
import com.projects.okten_project.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;


@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final String AUTHORIZATION_HEADER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authorizationHeaderValue = request.getHeader(AUTHORIZATION);

        if (StringUtils.isBlank(authorizationHeaderValue) || !StringUtils.startsWith
                (authorizationHeaderValue, AUTHORIZATION_HEADER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwtValue = authorizationHeaderValue.substring(AUTHORIZATION_HEADER_PREFIX.length());

        try {
            if (jwtUtil.isTokenExpired(jwtValue)) {
                filterChain.doFilter(request, response);
                return;
            }

            String email = jwtUtil.extractUsername(jwtValue);

            if (!StringUtils.isBlank(email)) {
                UserDetails userDetails = userService.loadUserByEmail(email);
                UsernamePasswordAuthenticationToken authentication = UsernamePasswordAuthenticationToken.authenticated
                        (email, userDetails.getPassword(), userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token is invalid or expired");
            return;
        }
        filterChain.doFilter(request, response);
    }
}

