package com.careerdevelopment.controller;

import com.careerdevelopment.dto.application.ApplicationResponse;
import com.careerdevelopment.dto.application.ApplicationStatusUpdateRequest;
import com.careerdevelopment.dto.application.ApplicationWithCvResponse;
import com.careerdevelopment.dto.company.CompanyProfileResponse;
import com.careerdevelopment.dto.company.CompanyProfileUpdateRequest;
import com.careerdevelopment.dto.feedback.CompanyFeedbackRequest;
import com.careerdevelopment.dto.feedback.CompanyFeedbackResponse;
import com.careerdevelopment.dto.job.JobCreateRequest;
import com.careerdevelopment.dto.job.JobResponse;
import com.careerdevelopment.dto.job.JobUpdateRequest;
import com.careerdevelopment.dto.notification.NotificationResponse;
import com.careerdevelopment.service.CompanyService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/company")
public class CompanyController {
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/profile")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<CompanyProfileResponse>> profile() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Company profile retrieved successfully", companyService.getProfile())
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<CompanyProfileResponse>> updateProfile(@Valid @RequestBody CompanyProfileUpdateRequest request) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Company profile updated successfully", companyService.updateProfile(request))
        );
    }

    @PostMapping("/jobs")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<JobResponse>> postJob(@Valid @RequestBody JobCreateRequest request) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Job posted successfully", companyService.postJob(request))
        );
    }

    @GetMapping("/jobs")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<JobResponse>>> jobs() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Company jobs retrieved successfully", companyService.getMyJobs())
        );
    }

    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<JobResponse>> updateJob(
            @PathVariable Long jobId,
            @Valid @RequestBody JobUpdateRequest request
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Job updated successfully", companyService.updateJob(jobId, request))
        );
    }

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<ApplicationWithCvResponse>>> applications(
            @PathVariable Long jobId
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Job applications retrieved successfully", companyService.getJobApplications(jobId))
        );
    }

    @GetMapping("/cvs/{applicationId}/download")
    public ResponseEntity<Resource> downloadCv(
            @PathVariable Long applicationId
    ) {
        var download = companyService.downloadCv(applicationId);

        String fileName = download.fileName();
        MediaType contentType = guessContentType(fileName);

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(download.resource());
    }

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<ApplicationResponse>> updateApplicationStatus(
            @PathVariable Long applicationId,
            @Valid @RequestBody ApplicationStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Application status updated successfully", companyService.updateApplicationStatus(applicationId, request))
        );
    }

    @PostMapping("/feedback/student/{studentId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<CompanyFeedbackResponse>> submitStudentFeedback(
            @PathVariable Long studentId,
            @Valid @RequestBody CompanyFeedbackRequest request
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Feedback submitted successfully", companyService.submitFeedbackForStudent(studentId, request))
        );
    }

    @GetMapping("/notifications")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<NotificationResponse>>> notifications() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Notifications retrieved successfully", companyService.getMyNotifications())
        );
    }

    private MediaType guessContentType(String fileName) {
        String lower = fileName == null ? "" : fileName.toLowerCase();
        if (lower.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        }
        if (lower.endsWith(".docx")) {
            return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}

