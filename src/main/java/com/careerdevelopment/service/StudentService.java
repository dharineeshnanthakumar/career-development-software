package com.careerdevelopment.service;

import com.careerdevelopment.model.Student;
import org.springframework.web.multipart.MultipartFile;

public interface StudentService {
    Student enrollStudent(Student student);
    void uploadCv(Long studentId, MultipartFile cvFile);
}
