package com.careerdevelopment.service;

import com.careerdevelopment.model.Application;
import com.careerdevelopment.model.enums.ApplicationStatus;
import java.util.List;

public interface ApplicationService {
    Application applyToJob(Long studentId, Long jobId);
    void sendCvToCompany(Long applicationId);
    ApplicationStatus trackStatus(Long applicationId);
    void updateApplicationStatus(Long applicationId, ApplicationStatus status);
}
