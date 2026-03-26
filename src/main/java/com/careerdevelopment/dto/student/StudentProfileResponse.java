package com.careerdevelopment.dto.student;

public class StudentProfileResponse {
    private Long studentId;
    private Long userId;
    private String email;
    private String name;
    private String rollNumber;
    private String department;
    private int graduationYear;
    private String phone;
    private boolean isEnrolledInPlacement;

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(int graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public boolean isEnrolledInPlacement() {
        return isEnrolledInPlacement;
    }

    public void setEnrolledInPlacement(boolean enrolledInPlacement) {
        isEnrolledInPlacement = enrolledInPlacement;
    }
}

