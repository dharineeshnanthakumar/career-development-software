package com.careerdevelopment.service;

import com.careerdevelopment.dto.company.CompanyProfileResponse;
import com.careerdevelopment.dto.admin.StudentAdminUpdateRequest;
import com.careerdevelopment.dto.feedback.CompanyFeedbackResponse;
import com.careerdevelopment.dto.feedback.StudentFeedbackResponse;
import com.careerdevelopment.dto.student.StudentProfileResponse;
import com.careerdevelopment.exception.ResourceNotFoundException;
import com.careerdevelopment.exception.ValidationException;
import com.careerdevelopment.model.Company;
import com.careerdevelopment.model.CompanyFeedback;
import com.careerdevelopment.model.JobRequirement;
import com.careerdevelopment.model.Student;
import com.careerdevelopment.model.StudentFeedback;
import com.careerdevelopment.model.User;
import com.careerdevelopment.model.enums.NotificationType;
import com.careerdevelopment.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CVRepository cvRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final NotificationRepository notificationRepository;
    private final CompanyFeedbackRepository companyFeedbackRepository;
    private final StudentFeedbackRepository studentFeedbackRepository;
    private final NotificationService notificationService;

    public AdminService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            CVRepository cvRepository,
            ApplicationRepository applicationRepository,
            CompanyRepository companyRepository,
            JobRequirementRepository jobRequirementRepository,
            NotificationRepository notificationRepository,
            CompanyFeedbackRepository companyFeedbackRepository,
            StudentFeedbackRepository studentFeedbackRepository,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.cvRepository = cvRepository;
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.notificationRepository = notificationRepository;
        this.companyFeedbackRepository = companyFeedbackRepository;
        this.studentFeedbackRepository = studentFeedbackRepository;
        this.notificationService = notificationService;
    }

    public List<StudentProfileResponse> listStudents() {
        return studentRepository.findAll().stream().map(this::toStudentProfileResponse).toList();
    }

    public void enrollStudent(Long studentId) {
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        s.setEnrolledInPlacement(true);
        studentRepository.save(s);
    }

    public StudentProfileResponse updateStudent(Long studentId, StudentAdminUpdateRequest request) {
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        studentRepository.findByRollNumber(request.getRollNumber())
                .filter(other -> !other.getId().equals(studentId))
                .ifPresent(other -> {
                    throw new ValidationException("rollNumber already in use");
                });

        s.setName(request.getName());
        s.setRollNumber(request.getRollNumber());
        s.setDepartment(request.getDepartment());
        s.setGraduationYear(request.getGraduationYear());
        s.setPhone(request.getPhone());
        s.setEnrolledInPlacement(request.isEnrolledInPlacement());

        studentRepository.save(s);
        return toStudentProfileResponse(s);
    }

    public void deleteStudent(Long studentId) {
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        User user = s.getUser();

        // company_feedback references applications, and applications references cv.
        companyFeedbackRepository.deleteByStudent_Id(studentId);
        studentFeedbackRepository.deleteByStudent_Id(studentId);
        notificationRepository.deleteByRecipient_Id(user.getId());

        applicationRepository.deleteByStudent_Id(studentId);
        cvRepository.deleteByStudent_Id(studentId);

        studentRepository.delete(s);
        userRepository.delete(user);
    }

    public List<CompanyProfileResponse> listCompanies() {
        return companyRepository.findAll().stream().map(this::toCompanyResponse).toList();
    }

    public void verifyCompany(Long companyId, boolean approve) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        boolean previouslyVerified = company.isVerified();
        company.setVerified(approve);
        companyRepository.save(company);

        if (approve && !previouslyVerified) {
            List<Student> enrolled = studentRepository.findByIsEnrolledInPlacementTrue();
            for (Student s : enrolled) {
                notificationService.create(
                        s.getUser(),
                        "Placement cell notified: New company available",
                        "A company has been verified and can receive placement applications.",
                        NotificationType.COMPANY_ENROLLED
                );
            }
        }
    }

    public void deleteCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        User user = company.getUser();

        // company_feedback references applications; delete it first.
        companyFeedbackRepository.deleteByCompany_Id(companyId);
        studentFeedbackRepository.deleteByCompany_Id(companyId);
        notificationRepository.deleteByRecipient_Id(user.getId());

        List<JobRequirement> jobs = jobRequirementRepository.findByCompany_Id(companyId);
        for (JobRequirement job : jobs) {
            applicationRepository.deleteByJobRequirement_Id(job.getId());
        }
        jobRequirementRepository.deleteAll(jobs);

        companyRepository.delete(company);
        userRepository.delete(user);
    }

    public List<CompanyFeedbackResponse> listCompanyFeedback() {
        return companyFeedbackRepository.findAll().stream().map(this::toCompanyFeedbackResponse).toList();
    }

    public List<StudentFeedbackResponse> listStudentFeedback() {
        return studentFeedbackRepository.findAll().stream().map(this::toStudentFeedbackResponse).toList();
    }

    public List<CompanyFeedbackResponse> listCompanyFeedbackForCompany(Long companyId) {
        return companyFeedbackRepository.findByCompany_Id(companyId).stream()
                .map(this::toCompanyFeedbackResponse)
                .toList();
    }

    public List<StudentFeedbackResponse> listStudentFeedbackForStudent(Long studentId) {
        return studentFeedbackRepository.findByStudent_Id(studentId).stream()
                .map(this::toStudentFeedbackResponse)
                .toList();
    }

    private StudentProfileResponse toStudentProfileResponse(Student s) {
        StudentProfileResponse res = new StudentProfileResponse();
        res.setStudentId(s.getId());
        res.setUserId(s.getUser().getId());
        res.setEmail(s.getUser().getEmail());
        res.setName(s.getName());
        res.setRollNumber(s.getRollNumber());
        res.setDepartment(s.getDepartment());
        res.setGraduationYear(s.getGraduationYear());
        res.setPhone(s.getPhone());
        res.setEnrolledInPlacement(s.isEnrolledInPlacement());
        return res;
    }

    private CompanyProfileResponse toCompanyResponse(Company c) {
        CompanyProfileResponse res = new CompanyProfileResponse();
        res.setCompanyId(c.getId());
        res.setUserId(c.getUser().getId());
        res.setEmail(c.getUser().getEmail());
        res.setName(c.getName());
        res.setIndustry(c.getIndustry());
        res.setWebsite(c.getWebsite());
        res.setContactPerson(c.getContactPerson());
        res.setContactEmail(c.getContactEmail());
        res.setContactPhone(c.getContactPhone());
        res.setVerified(c.isVerified());
        return res;
    }

    private CompanyFeedbackResponse toCompanyFeedbackResponse(CompanyFeedback fb) {
        CompanyFeedbackResponse res = new CompanyFeedbackResponse();
        res.setId(fb.getId());
        res.setCompanyId(fb.getCompany().getId());
        res.setStudentId(fb.getStudent().getId());
        res.setApplicationId(fb.getApplication().getId());
        res.setRating(fb.getRating());
        res.setComments(fb.getComments());
        res.setSubmittedAt(fb.getSubmittedAt());
        return res;
    }

    private StudentFeedbackResponse toStudentFeedbackResponse(StudentFeedback fb) {
        StudentFeedbackResponse res = new StudentFeedbackResponse();
        res.setId(fb.getId());
        res.setStudentId(fb.getStudent().getId());
        res.setCompanyId(fb.getCompany().getId());
        res.setRating(fb.getRating());
        res.setComments(fb.getComments());
        res.setSubmittedAt(fb.getSubmittedAt());
        return res;
    }
}

