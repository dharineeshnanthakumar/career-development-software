package com.careerdevelopment.service;

import com.careerdevelopment.model.Company;

public interface CompanyService {
    Company registerCompany(Company company);
    // Note: Other functionalities like posting job, updating job status 
    // and giving feedback are typically managed via their respective services, 
    // or we can put them here. We will manage jobs via JobService.
}
