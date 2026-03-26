package com.careerdevelopment.repository;

import com.careerdevelopment.model.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CVRepository extends JpaRepository<CV, Long> {
    Optional<CV> findByStudent_IdAndIsActiveTrue(Long studentId);

    List<CV> findByStudent_IdOrderByUploadedAtDesc(Long studentId);

    Optional<CV> findByIdAndStudent_Id(Long cvId, Long studentId);

    void deleteByStudent_Id(Long studentId);
}

