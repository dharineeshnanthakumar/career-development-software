package com.careerdevelopment.dto.application;

import com.careerdevelopment.model.enums.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;

public class ApplicationStatusUpdateRequest {
    @NotBlank
    private String status;

    public ApplicationStatus toStatus() {
        return ApplicationStatus.valueOf(status);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

