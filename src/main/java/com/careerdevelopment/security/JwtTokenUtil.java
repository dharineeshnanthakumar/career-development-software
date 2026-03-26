package com.careerdevelopment.security;

import com.careerdevelopment.config.JwtConfig;
import com.careerdevelopment.model.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenUtil {
    private final JwtConfig jwtConfig;
    private Key signingKey;

    public JwtTokenUtil(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    @PostConstruct
    void init() {
        if (jwtConfig.getSecret() == null || jwtConfig.getSecret().length() < 64) {
            throw new IllegalStateException("jwt.secret must be at least 64 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String email, Role role) {
        Instant now = Instant.now();
        Instant exp = now.plusMillis(jwtConfig.getExpirationMs());

        return Jwts.builder()
                .setSubject(email)
                .claim("uid", userId)
                .claim("role", role.name())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(signingKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object uid = parseClaims(token).get("uid");
        if (uid instanceof Number n) {
            return n.longValue();
        }
        return Long.valueOf(String.valueOf(uid));
    }

    public Role extractRole(String token) {
        String role = String.valueOf(parseClaims(token).get("role"));
        return Role.valueOf(role);
    }
}

