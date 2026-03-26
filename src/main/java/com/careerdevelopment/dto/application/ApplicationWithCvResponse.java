package com.careerdevelopment.dto.application;

import com.careerdevelopment.model.enums.ApplicationStatus;

import java.time.Instant;

public class ApplicationWithCvResponse {
    private Long applicationId;
    private Long jobRequirementId;
    private ApplicationStatus status;
    private Instant appliedAt;

    private Long studentId;
    private String studentName;
    private String studentRollNumber;

    private Long cvId;
    private String cvFileName;

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public Long getJobRequirementId() {
        return jobRequirementId;
    }

    public void setJobRequirementId(Long jobRequirementId) {
        this.jobRequirementId = jobRequirementId;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentRollNumber() {
        return studentRollNumber;
    }

    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
    }

    public Long getCvId() {
        return cvId;
    }

    public void setCvId(Long cvId) {
        this.cvId = cvId;
    }

    public String getCvFileName() {
        return cvFileName;
    }

    public void setCvFileName(String cvFileName) {
        this.cvFileName = cvFileName;
    }
}

