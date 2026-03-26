package com.careerdevelopment.dto.application;

import com.careerdevelopment.model.enums.ApplicationStatus;

import java.time.Instant;

public class ApplicationResponse {
    private Long applicationId;
    private Long jobRequirementId;
    private ApplicationStatus status;
    private Instant appliedAt;

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
}

