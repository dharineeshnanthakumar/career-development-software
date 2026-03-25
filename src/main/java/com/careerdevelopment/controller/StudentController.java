package com.careerdevelopment.controller;
import com.careerdevelopment.model.Student;
import com.careerdevelopment.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController
@RequestMapping("/api/students")
public class StudentController {
    @Autowired
    private StudentService studentService;
    @PostMapping("/enroll")
    public ResponseEntity<Student> enrollStudent(@RequestBody Student student) {
        return new ResponseEntity<>(org.springframework.http.HttpStatus.OK);
    }
    @PostMapping("/{studentId}/upload-cv")
    public ResponseEntity<String> uploadCv(@PathVariable Long studentId, @RequestParam("file") MultipartFile cvFile) {
        return ResponseEntity.ok("CV Uploaded Successfully");
    }
}
