package com.careerdevelopment.exception;

import com.careerdevelopment.dto.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ApiResponse<Object> payload = ApiResponse.error(ex.getMessage());
        payload.setTimestamp(Instant.now().toString());
        payload.setPath(request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(payload);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
        ApiResponse<Object> payload = ApiResponse.error(ex.getMessage());
        payload.setTimestamp(Instant.now().toString());
        payload.setPath(request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(payload);
    }

    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidFile(InvalidFileException ex, HttpServletRequest request) {
        ApiResponse<Object> payload = ApiResponse.error(ex.getMessage());
        payload.setTimestamp(Instant.now().toString());
        payload.setPath(request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(payload);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(ValidationException ex, HttpServletRequest request) {
        ApiResponse<Object> payload = ApiResponse.error(ex.getMessage());
        payload.setTimestamp(Instant.now().toString());
        payload.setPath(request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(payload);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining(", "));
        ApiResponse<Object> payload = ApiResponse.error(message.isBlank() ? "Validation failed" : message);
        payload.setTimestamp(Instant.now().toString());
        payload.setPath(request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(payload);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        ApiResponse<Object> payload = ApiResponse.error("Invalid value: " + ex.getName());
        payload.setTimestamp(Instant.now().toString());
        payload.setPath(request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(payload);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        String message = "A database constraint was violated";
        String cause = ex.getMostSpecificCause().getMessage();
        
        if (cause != null) {
            if (cause.contains("UKkmd86jf46110c60b412tjt2bg")) {
                message = "Roll number already exists";
            } else if (cause.contains("email") || cause.contains("students.UK")) {
                message = "Email already in use";
            } else if (cause.contains("roll_number")) {
                message = "Roll number already exists";
            } else if (cause.contains("user_id")) {
                message = "User profile already exists";
            } else if (cause.contains("Duplicate entry")) {
                // Try to extract which field caused the duplicate
                if (cause.contains("'students'")) {
                    message = "This student record already exists in the system";
                } else if (cause.contains("'companies'")) {
                    message = "This company record already exists in the system";
                } else if (cause.contains("'users'")) {
                    message = "This user already exists in the system";
                }
            }
        }
        
        ApiResponse<Object> payload = ApiResponse.error(message);
        payload.setTimestamp(Instant.now().toString());
        payload.setPath(request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(payload);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex, HttpServletRequest request) {
        // Log the actual exception for debugging
        ex.printStackTrace();
        
        ApiResponse<Object> payload = ApiResponse.error("An error occurred. Please try again later.");
        payload.setTimestamp(Instant.now().toString());
        payload.setPath(request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(payload);
    }
}

