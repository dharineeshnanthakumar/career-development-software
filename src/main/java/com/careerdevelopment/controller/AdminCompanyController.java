package com.careerdevelopment.controller;

import com.careerdevelopment.dto.company.CompanyProfileResponse;
import com.careerdevelopment.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
public class AdminCompanyController {
    private final AdminService adminService;

    public AdminCompanyController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<CompanyProfileResponse>>> listCompanies() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Companies retrieved successfully", adminService.listCompanies())
        );
    }

    @PostMapping("/verify/{companyId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<Void>> verify(
            @PathVariable Long companyId,
            @RequestParam boolean approve
    ) {
        adminService.verifyCompany(companyId, approve);
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Company verification updated successfully", null)
        );
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<Void>> deleteCompany(
            @PathVariable Long companyId
    ) {
        adminService.deleteCompany(companyId);
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Company removed successfully", null)
        );
    }
}

