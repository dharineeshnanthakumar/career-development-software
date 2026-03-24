package com.careerdevelopment.service.impl;

import com.careerdevelopment.model.Student;
import com.careerdevelopment.service.StudentService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentServiceImpl implements StudentService {

    @Override
    public Student enrollStudent(Student student) {
        // TODO: Implement student enrollment logic
        return null;
    }

    @Override
    public void uploadCv(Long studentId, MultipartFile cvFile) {
        // TODO: Implement CV upload logic
    }
}
