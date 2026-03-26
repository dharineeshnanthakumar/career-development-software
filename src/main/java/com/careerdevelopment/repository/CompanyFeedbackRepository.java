package com.careerdevelopment.repository;

import com.careerdevelopment.model.CompanyFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyFeedbackRepository extends JpaRepository<CompanyFeedback, Long> {
    List<CompanyFeedback> findByCompany_Id(Long companyId);

    List<CompanyFeedback> findByStudent_Id(Long studentId);

    void deleteByStudent_Id(Long studentId);

    void deleteByCompany_Id(Long companyId);
}

