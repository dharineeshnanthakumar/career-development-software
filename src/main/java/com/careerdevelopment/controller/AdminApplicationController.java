package com.careerdevelopment.controller;

import com.careerdevelopment.dto.application.ApplicationResponse;
import com.careerdevelopment.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/applications")
public class AdminApplicationController {
    private final AdminService adminService;

    public AdminApplicationController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<ApplicationResponse>>> listAllApplications() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Applications retrieved successfully", adminService.listAllApplications())
        );
    }
}