package com.careerdevelopment.service;

import com.careerdevelopment.model.Application;
import com.careerdevelopment.model.enums.ApplicationStatus;
import org.springframework.stereotype.Service;

@Service
public class ApplicationService {

    public Application applyToJob(Long studentId, Long jobId) {
        // TODO: Implement job application logic
        return null;
    }

    public void sendCvToCompany(Long applicationId) {
        // TODO: Implement CV sending logic
    }

    public ApplicationStatus trackStatus(Long applicationId) {
        // TODO: Implement status tracking logic
        return null;
    }

    public void updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        // TODO: Implement application status update logic
    }
}
