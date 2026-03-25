package com.careerdevelopment.controller;
import com.careerdevelopment.model.Application;
import com.careerdevelopment.model.enums.ApplicationStatus;
import com.careerdevelopment.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    @Autowired
    private ApplicationService applicationService;
    @PostMapping("/apply")
    public ResponseEntity<Application> applyToJob(@RequestParam Long studentId, @RequestParam Long jobId) {
        return new ResponseEntity<>(org.springframework.http.HttpStatus.OK);
    }
    @GetMapping("/{applicationId}/status")
    public ResponseEntity<ApplicationStatus> trackStatus(@PathVariable Long applicationId) {
        return new ResponseEntity<>(org.springframework.http.HttpStatus.OK);
    }
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<String> updateStatus(@PathVariable Long applicationId, @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok("Status updated");
    }
}
