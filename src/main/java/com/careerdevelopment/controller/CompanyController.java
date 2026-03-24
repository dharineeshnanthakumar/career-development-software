package com.careerdevelopment.controller;

import com.careerdevelopment.model.Company;
import com.careerdevelopment.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping("/register")
    public ResponseEntity<Company> registerCompany(@RequestBody Company company) {
        // TODO: Map to service logic
        return ResponseEntity.ok(null);
    }
}
