package com.careerdevelopment.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

public class StudentAdminUpdateRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String rollNumber;

    @NotBlank
    private String department;

    @NotNull
    private Integer graduationYear;

    @NotBlank
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be 10 digits starting with 6, 7, 8, or 9")
    private String phone;

    @NotNull
    @Min(value = 0, message = "CGPA must be at least 0")
    @Max(value = 10, message = "CGPA cannot exceed 10")
    private Double cgpa;

    private boolean isEnrolledInPlacement;

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

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public boolean isEnrolledInPlacement() {
        return isEnrolledInPlacement;
    }

    public void setEnrolledInPlacement(boolean enrolledInPlacement) {
        isEnrolledInPlacement = enrolledInPlacement;
    }
}

