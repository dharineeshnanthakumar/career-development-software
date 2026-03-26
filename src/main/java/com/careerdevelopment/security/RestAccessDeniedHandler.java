package com.careerdevelopment.security;

import com.careerdevelopment.exception.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        ApiErrorResponse payload = new ApiErrorResponse(
                403,
                "Forbidden",
                accessDeniedException.getMessage() == null ? "Forbidden" : accessDeniedException.getMessage(),
                request.getRequestURI()
        );
        response.setStatus(403);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(toJson(payload));
    }

    private String toJson(ApiErrorResponse payload) {
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

