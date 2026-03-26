package com.careerdevelopment.security;

import com.careerdevelopment.exception.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        ApiErrorResponse payload = new ApiErrorResponse(
                401,
                "Unauthorized",
                authException.getMessage() == null ? "Unauthorized" : authException.getMessage(),
                request.getRequestURI()
        );
        response.setStatus(401);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(toJson(payload));
    }

    private String toJson(ApiErrorResponse payload) {
        // Lightweight JSON rendering to keep security errors consistent without extra dependencies.
        return "{"
                + "\"timestamp\":\"" + escape(payload.getTimestamp()) + "\","
                + "\"status\":" + payload.getStatus() + ","
                + "\"error\":\"" + escape(payload.getError()) + "\","
                + "\"message\":\"" + escape(payload.getMessage()) + "\","
                + "\"path\":\"" + escape(payload.getPath()) + "\""
                + "}";
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}

