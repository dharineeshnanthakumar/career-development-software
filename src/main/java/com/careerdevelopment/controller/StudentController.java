package com.careerdevelopment.controller;

import com.careerdevelopment.dto.application.ApplicationResponse;
import com.careerdevelopment.dto.cv.CvUploadResponse;
import com.careerdevelopment.dto.feedback.StudentFeedbackRequest;
import com.careerdevelopment.dto.feedback.StudentFeedbackResponse;
import com.careerdevelopment.dto.job.JobResponse;
import com.careerdevelopment.dto.notification.NotificationResponse;
import com.careerdevelopment.dto.student.StudentProfileResponse;
import com.careerdevelopment.dto.student.StudentProfileUpdateRequest;
import com.careerdevelopment.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/profile")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<StudentProfileResponse>> profile() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Student profile retrieved successfully", studentService.getProfile())
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<StudentProfileResponse>> updateProfile(@Valid @RequestBody StudentProfileUpdateRequest request) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Student profile updated successfully", studentService.updateProfile(request))
        );
    }

    @PostMapping(value = "/cv/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<CvUploadResponse>> uploadCv(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "cv", required = false) MultipartFile cv
    ) {
        MultipartFile toUpload = file != null ? file : cv;
        if (toUpload == null) {
            throw new com.careerdevelopment.exception.ValidationException("CV file is required (multipart field: file or cv)");
        }
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("CV uploaded successfully", studentService.uploadCv(toUpload))
        );
    }

    @GetMapping("/cv")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<CvUploadResponse>> getCv() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Active CV retrieved successfully", studentService.getActiveCv())
        );
    }

    @DeleteMapping("/cv/{cvId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<Void>> deleteCv(
            @PathVariable Long cvId
    ) {
        studentService.deleteCv(cvId);
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("CV deleted successfully", null)
        );
    }

    @GetMapping("/jobs")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<JobResponse>>> jobs() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Open jobs retrieved successfully", studentService.listOpenJobs())
        );
    }

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<ApplicationResponse>> apply(
            @PathVariable Long jobId
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Application submitted successfully", studentService.applyToJob(jobId))
        );
    }

    @GetMapping("/applications")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<ApplicationResponse>>> applications() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Applications retrieved successfully", studentService.getMyApplications())
        );
    }

    @GetMapping("/notifications")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<List<NotificationResponse>>> notifications() {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Notifications retrieved successfully", studentService.getMyNotifications())
        );
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<Void>> markNotificationRead(
            @PathVariable("id") Long notificationId
    ) {
        studentService.markNotificationRead(notificationId);
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Notification marked as read", null)
        );
    }

    @PostMapping("/feedback/company/{companyId}")
    public ResponseEntity<com.careerdevelopment.dto.api.ApiResponse<StudentFeedbackResponse>> submitCompanyFeedback(
            @PathVariable Long companyId,
            @Valid @RequestBody StudentFeedbackRequest request
    ) {
        return ResponseEntity.ok(
                com.careerdevelopment.dto.api.ApiResponse.success("Feedback submitted successfully", studentService.submitFeedbackForCompany(companyId, request))
        );
    }
}
