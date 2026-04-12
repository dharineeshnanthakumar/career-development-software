package com.careerdevelopment.controller;

import com.careerdevelopment.dto.job.JobResponse;
import com.careerdevelopment.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/jobs")
public class AdminJobController {
    private final AdminService adminService;

    public AdminJobController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<JobResponse>>> listAllJobs() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Jobs retrieved successfully", adminService.listAllJobs())
        );
    }
}