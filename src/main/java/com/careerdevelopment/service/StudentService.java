package com.careerdevelopment.service;
import com.careerdevelopment.model.Student;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
@Service
public class StudentService {
    public Student enrollStudent(Student student) {
        return null;
    }
    public void uploadCv(Long studentId, MultipartFile cvFile) {
    }
}
