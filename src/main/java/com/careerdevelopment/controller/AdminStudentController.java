package com.careerdevelopment.controller;

import com.careerdevelopment.dto.admin.StudentAdminUpdateRequest;
import com.careerdevelopment.dto.student.StudentProfileResponse;
import com.careerdevelopment.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
public class AdminStudentController {
    private final AdminService adminService;

    public AdminStudentController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<StudentProfileResponse>>> listStudents(
            @RequestParam(value = "course", required = false) String course,
            @RequestParam(value = "graduationYear", required = false) Integer graduationYear,
            @RequestParam(value = "minCgpa", required = false) Double minCgpa,
            @RequestParam(value = "maxCgpa", required = false) Double maxCgpa
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Students retrieved successfully", adminService.listStudents(course, graduationYear, minCgpa, maxCgpa))
        );
    }

    @PostMapping("/enroll/{studentId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<Void>> enroll(
            @PathVariable Long studentId
    ) {
        adminService.enrollStudent(studentId);
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Student enrolled in placement successfully", null)
        );
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<StudentProfileResponse>> updateStudent(
            @PathVariable Long studentId,
            @Valid @RequestBody StudentAdminUpdateRequest request
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Student updated successfully", adminService.updateStudent(studentId, request))
        );
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<Void>> deleteStudent(
            @PathVariable Long studentId
    ) {
        adminService.deleteStudent(studentId);
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Student removed successfully", null)
        );
    }
}

