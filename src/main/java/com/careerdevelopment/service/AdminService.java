package com.careerdevelopment.service;

import com.careerdevelopment.model.Company;

public interface AdminService {
    void reviewCompany(Long companyId, boolean approve);
    void monitorApplications();
}
