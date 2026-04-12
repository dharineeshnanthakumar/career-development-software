package com.careerdevelopment.repository;

import com.careerdevelopment.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudent_Id(Long studentId);

    List<Application> findByJobRequirement_Id(Long jobRequirementId);

    Optional<Application> findByIdAndStudent_Id(Long id, Long studentId);

    boolean existsByStudent_IdAndJobRequirement_Id(Long studentId, Long jobRequirementId);

    void deleteByStudent_Id(Long studentId);

    void deleteByJobRequirement_Id(Long jobRequirementId);
}

