package com.careerdevelopment.service.impl;

import com.careerdevelopment.model.Application;
import com.careerdevelopment.model.enums.ApplicationStatus;
import com.careerdevelopment.service.ApplicationService;
import org.springframework.stereotype.Service;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    @Override
    public Application applyToJob(Long studentId, Long jobId) {
        // TODO: Implement job application logic
        return null;
    }

    @Override
    public void sendCvToCompany(Long applicationId) {
        // TODO: Implement CV sending logic
    }

    @Override
    public ApplicationStatus trackStatus(Long applicationId) {
        // TODO: Implement status tracking logic
        return null;
    }

    @Override
    public void updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        // TODO: Implement application status update logic
    }
}
