package com.careerdevelopment.controller;

import com.careerdevelopment.dto.auth.CompanyRegisterRequest;
import com.careerdevelopment.dto.auth.MeResponse;
import com.careerdevelopment.dto.auth.LoginRequest;
import com.careerdevelopment.dto.auth.LoginResponse;
import com.careerdevelopment.dto.auth.StudentRegisterRequest;
import com.careerdevelopment.dto.company.CompanyProfileResponse;
import com.careerdevelopment.dto.student.StudentProfileResponse;
import com.careerdevelopment.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/student")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<StudentProfileResponse>> registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Student registered successfully", authService.registerStudent(request))
        );
    }

    @PostMapping("/register/company")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<CompanyProfileResponse>> registerCompany(@Valid @RequestBody CompanyRegisterRequest request) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Company registered successfully", authService.registerCompany(request))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Login successful", authService.login(request))
        );
    }

    @GetMapping("/me")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<MeResponse>> me() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Current user retrieved successfully", authService.me())
        );
    }
}

