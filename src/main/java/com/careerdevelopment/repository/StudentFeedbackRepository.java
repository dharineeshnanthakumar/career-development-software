package com.careerdevelopment.repository;

import com.careerdevelopment.model.StudentFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentFeedbackRepository extends JpaRepository<StudentFeedback, Long> {
    List<StudentFeedback> findByStudent_Id(Long studentId);

    List<StudentFeedback> findByCompany_Id(Long companyId);

    void deleteByStudent_Id(Long studentId);

    void deleteByCompany_Id(Long companyId);
}

