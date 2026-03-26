package com.careerdevelopment.repository;

import com.careerdevelopment.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser_Id(Long userId);

    Optional<Student> findByRollNumber(String rollNumber);

    List<Student> findByIsEnrolledInPlacementTrue();
}

