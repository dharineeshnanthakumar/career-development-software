package com.careerdevelopment.model;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "students")
public class Student extends User {

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer graduationYear;

    @Column(nullable = false)
    private Double cgpa;

    @Column(name = "cv_file")
    private String cvFile;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Application> applications;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Feedback> feedbacks;

    public Student() {
        super();
        this.setRole(com.careerdevelopment.model.enums.Role.STUDENT);
        // TODO: Implement constructor logic
    }

    // Getters and Setters

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public String getCvFile() { return cvFile; }
    public void setCvFile(String cvFile) { this.cvFile = cvFile; }

    public List<Application> getApplications() { return applications; }
    public void setApplications(List<Application> applications) { this.applications = applications; }

    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> feedbacks) { this.feedbacks = feedbacks; }
}
