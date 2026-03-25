package com.careerdevelopment.service;
import com.careerdevelopment.model.Application;
import com.careerdevelopment.model.enums.ApplicationStatus;
import org.springframework.stereotype.Service;
@Service
public class ApplicationService {
    public Application applyToJob(Long studentId, Long jobId) {
        return null;
    }
    public void sendCvToCompany(Long applicationId) {
    }
    public ApplicationStatus trackStatus(Long applicationId) {
        return null;
    }
    public void updateApplicationStatus(Long applicationId, ApplicationStatus status) {
    }
}
