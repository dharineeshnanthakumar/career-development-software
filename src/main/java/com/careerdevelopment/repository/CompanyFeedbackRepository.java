package com.careerdevelopment.repository;

import com.careerdevelopment.model.CompanyFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyFeedbackRepository extends JpaRepository<CompanyFeedback, Long> {
    List<CompanyFeedback> findByCompany_Id(Long companyId);

    List<CompanyFeedback> findByJobRequirement_Id(Long jobId);

    void deleteByJobRequirement_Id(Long jobId);

    void deleteByCompany_Id(Long companyId);

    @Modifying
    @Query("DELETE FROM CompanyFeedback cf WHERE cf.application IN (SELECT a FROM Application a WHERE a.student.id = :studentId)")
    void deleteByStudent_Id(@Param("studentId") Long studentId);
}


