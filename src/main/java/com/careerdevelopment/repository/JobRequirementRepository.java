package com.careerdevelopment.repository;

import com.careerdevelopment.model.JobRequirement;
import com.careerdevelopment.model.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRequirementRepository extends JpaRepository<JobRequirement, Long> {
    List<JobRequirement> findByCompany_Id(Long companyId);

    List<JobRequirement> findByStatus(JobStatus status);
}

