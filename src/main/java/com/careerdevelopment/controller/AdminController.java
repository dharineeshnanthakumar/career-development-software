package com.careerdevelopment.controller;

import com.careerdevelopment.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PutMapping("/companies/{companyId}/review")
    public ResponseEntity<String> reviewCompany(@PathVariable Long companyId, @RequestParam boolean approve) {
        // TODO: Map to service logic
        return ResponseEntity.ok("Company review complete");
    }

    @GetMapping("/applications/monitor")
    public ResponseEntity<String> monitorApplications() {
        // TODO: Map to service logic
        return ResponseEntity.ok("Monitoring applications");
    }
}
