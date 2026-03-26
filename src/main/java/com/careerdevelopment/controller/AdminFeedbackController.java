package com.careerdevelopment.controller;

import com.careerdevelopment.dto.feedback.CompanyFeedbackResponse;
import com.careerdevelopment.dto.feedback.StudentFeedbackResponse;
import com.careerdevelopment.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/feedback")
public class AdminFeedbackController {
    private final AdminService adminService;

    public AdminFeedbackController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/company")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<CompanyFeedbackResponse>>> listCompanyFeedback() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Company feedback retrieved successfully", adminService.listCompanyFeedback())
        );
    }

    @GetMapping("/student")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<StudentFeedbackResponse>>> listStudentFeedback() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Student feedback retrieved successfully", adminService.listStudentFeedback())
        );
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<CompanyFeedbackResponse>>> listCompanyFeedbackForCompany(
            @PathVariable Long companyId
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Company feedback retrieved successfully", adminService.listCompanyFeedbackForCompany(companyId))
        );
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<StudentFeedbackResponse>>> listStudentFeedbackForStudent(
            @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Student feedback retrieved successfully", adminService.listStudentFeedbackForStudent(studentId))
        );
    }
}

