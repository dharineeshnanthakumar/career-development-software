package com.careerdevelopment.dto.job;

import com.careerdevelopment.model.enums.JobStatus;
import jakarta.validation.constraints.NotBlank;

public class JobUpdateRequest extends JobCreateRequest {
    @NotBlank
    private String status;

    public JobStatus toStatus() {
        return JobStatus.valueOf(status);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

