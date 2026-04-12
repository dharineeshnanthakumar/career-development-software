package com.careerdevelopment.service;

import com.careerdevelopment.dto.application.ApplicationResponse;
import com.careerdevelopment.dto.cv.CvUploadResponse;
import com.careerdevelopment.dto.feedback.StudentFeedbackRequest;
import com.careerdevelopment.dto.feedback.StudentFeedbackResponse;
import com.careerdevelopment.dto.job.JobResponse;
import com.careerdevelopment.dto.notification.NotificationResponse;
import com.careerdevelopment.dto.student.StudentProfileResponse;
import com.careerdevelopment.dto.student.StudentProfileUpdateRequest;
import com.careerdevelopment.exception.ResourceNotFoundException;
import com.careerdevelopment.exception.UnauthorizedException;
import com.careerdevelopment.exception.ValidationException;
import com.careerdevelopment.model.Application;
import com.careerdevelopment.model.CV;
import com.careerdevelopment.model.Company;
import com.careerdevelopment.model.JobRequirement;
import com.careerdevelopment.model.Student;
import com.careerdevelopment.model.StudentFeedback;
import com.careerdevelopment.model.enums.ApplicationStatus;
import com.careerdevelopment.model.enums.JobStatus;
import com.careerdevelopment.model.enums.NotificationType;
import com.careerdevelopment.repository.ApplicationRepository;
import com.careerdevelopment.repository.CompanyRepository;
import com.careerdevelopment.repository.CVRepository;
import com.careerdevelopment.repository.JobRequirementRepository;
import com.careerdevelopment.repository.StudentFeedbackRepository;
import com.careerdevelopment.repository.StudentRepository;
import com.careerdevelopment.security.SecurityUtils;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Service
public class StudentService {
    private final SecurityUtils securityUtils;
    private final StudentRepository studentRepository;
    private final CVRepository cvRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final CompanyRepository companyRepository;
    private final StudentFeedbackRepository studentFeedbackRepository;

    public StudentService(
            SecurityUtils securityUtils,
            StudentRepository studentRepository,
            CVRepository cvRepository,
            JobRequirementRepository jobRequirementRepository,
            ApplicationRepository applicationRepository,
            NotificationService notificationService,
            CompanyRepository companyRepository,
            StudentFeedbackRepository studentFeedbackRepository
    ) {
        this.securityUtils = securityUtils;
        this.studentRepository = studentRepository;
        this.cvRepository = cvRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.companyRepository = companyRepository;
        this.studentFeedbackRepository = studentFeedbackRepository;
    }

    private Student getCurrentStudent() {
        Long userId = securityUtils.getPrincipal().getUserId();
        return studentRepository.findByUser_Id(userId)
                .orElseThrow(() -> new UnauthorizedException("Student profile not found"));
    }

    public StudentProfileResponse getProfile() {
        Student s = getCurrentStudent();
        StudentProfileResponse res = new StudentProfileResponse();
        res.setStudentId(s.getId());
        res.setUserId(s.getUser().getId());
        res.setEmail(s.getUser().getEmail());
        res.setName(s.getName());
        res.setRollNumber(s.getRollNumber());
        res.setDepartment(s.getDepartment());
        res.setGraduationYear(s.getGraduationYear());
        res.setCgpa(s.getCgpa());
        res.setPhone(s.getPhone());
        res.setEnrolledInPlacement(s.isEnrolledInPlacement());
        return res;
    }

    public StudentProfileResponse updateProfile(StudentProfileUpdateRequest request) {
        Student s = getCurrentStudent();

        studentRepository.findByRollNumber(request.getRollNumber())
                .filter(other -> !other.getId().equals(s.getId()))
                .ifPresent(other -> {
                    throw new ValidationException("rollNumber already in use");
                });

        s.setName(request.getName());
        s.setRollNumber(request.getRollNumber());
        s.setDepartment(request.getDepartment());
        s.setGraduationYear(request.getGraduationYear());
        s.setCgpa(request.getCgpa());
        s.setPhone(request.getPhone());

        studentRepository.save(s);
        return getProfile();
    }

    public CvUploadResponse uploadCv(MultipartFile file) {
        Student s = getCurrentStudent();

        String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            throw new ValidationException("CV original filename is missing");
        }

        String ext = extensionOf(original).toLowerCase(Locale.ROOT);
        if (!ext.equals("pdf") && !ext.equals("docx") && !ext.equals("doc")) {
            throw new ValidationException("CV file must be PDF, DOC or DOCX");
        }

        long maxBytes = 2L * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new ValidationException("CV file must be <= 2MB");
        }

        byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            throw new ValidationException("Failed to read CV file");
        }

        // Deactivate existing active CV instead of deleting it so we keep history and avoid FK issues.
        cvRepository.findByStudent_IdAndIsActiveTrue(s.getId()).ifPresent(existing -> {
            existing.setActive(false);
            cvRepository.save(existing);
        });

        CV cv = new CV();
        cv.setStudent(s);
        cv.setFileName(original);
        cv.setFileSize(file.getSize());
        cv.setData(data);
        cv.setFilePath("/api/student/cv/download");
        cv.setActive(true);
        cvRepository.save(cv);

        CvUploadResponse res = new CvUploadResponse();
        res.setCvId(cv.getId());
        res.setFileName(cv.getFileName());
        res.setFileSize(cv.getFileSize());
        res.setFilePath(cv.getFilePath());
        res.setUploadedAt(cv.getUploadedAt());
        res.setActive(true);
        return res;
    }

    private String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 ? fileName.substring(dot + 1) : "";
    }

    public CvUploadResponse getActiveCv() {
        Student s = getCurrentStudent();
        CV cv = cvRepository.findByStudent_IdAndIsActiveTrue(s.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No active CV found"));

        CvUploadResponse res = new CvUploadResponse();
        res.setCvId(cv.getId());
        res.setFileName(cv.getFileName());
        res.setFileSize(cv.getFileSize());
        res.setFilePath(cv.getFilePath());
        res.setUploadedAt(cv.getUploadedAt());
        res.setActive(cv.isActive());
        return res;
    }

    public void deleteCv(Long cvId) {
        Student s = getCurrentStudent();
        CV cv = cvRepository.findByIdAndStudent_Id(cvId, s.getId())
                .orElseThrow(() -> new ResourceNotFoundException("CV not found"));

        cvRepository.delete(cv);
    }

    public List<JobResponse> listOpenJobs() {
        List<JobRequirement> open = jobRequirementRepository.findByStatus(JobStatus.OPEN);
        // Only verified companies should be visible to students.
        return open.stream()
                .filter(j -> j.getCompany() != null && j.getCompany().isVerified())
                .map(j -> toJobResponse(j))
                .toList();
    }

    public ApplicationResponse applyToJob(Long jobId) {
        Student s = getCurrentStudent();

        JobRequirement job = jobRequirementRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        if (job.getStatus() != JobStatus.OPEN) {
            throw new ValidationException("Job is not open");
        }

        // Check if student has already applied to this job
        boolean alreadyApplied = applicationRepository.existsByStudent_IdAndJobRequirement_Id(s.getId(), jobId);
        if (alreadyApplied) {
            throw new ValidationException("You have already applied to this job");
        }

        CV activeCv = cvRepository.findByStudent_IdAndIsActiveTrue(s.getId())
                .orElseThrow(() -> new ValidationException("Active CV is required to apply"));

        Application application = new Application();
        application.setStudent(s);
        application.setJobRequirement(job);
        application.setCv(activeCv);
        application.setStatus(ApplicationStatus.APPLIED);

        applicationRepository.save(application);

        // Notify company that a new application was received.
        notificationService.create(
                job.getCompany().getUser(),
                "New application received",
                "Student " + s.getName() + " (" + s.getRollNumber() + ") applied for " + job.getTitle(),
                NotificationType.GENERAL
        );

        ApplicationResponse res = new ApplicationResponse();
        res.setApplicationId(application.getId());
        res.setJobRequirementId(application.getJobRequirement().getId());
        res.setJobTitle(job.getTitle());
        res.setCompanyId(job.getCompany().getId());
        res.setCompanyName(job.getCompany().getName());
        res.setStatus(application.getStatus());
        res.setAppliedAt(application.getAppliedAt());
        return res;
    }

    public List<ApplicationResponse> getMyApplications() {
        Student s = getCurrentStudent();
        return applicationRepository.findByStudent_Id(s.getId()).stream()
                .map(a -> {
                    ApplicationResponse res = new ApplicationResponse();
                    res.setApplicationId(a.getId());
                    res.setJobRequirementId(a.getJobRequirement().getId());
                    res.setJobTitle(a.getJobRequirement().getTitle());
                    res.setCompanyId(a.getJobRequirement().getCompany().getId());
                    res.setCompanyName(a.getJobRequirement().getCompany().getName());
                    res.setStatus(a.getStatus());
                    res.setAppliedAt(a.getAppliedAt());
                    return res;
                })
                .toList();
    }

    public List<NotificationResponse> getMyNotifications() {
        Long userId = securityUtils.getPrincipal().getUserId();
        return notificationService.listForRecipient(userId);
    }

    public void markNotificationRead(Long notificationId) {
        Long userId = securityUtils.getPrincipal().getUserId();
        notificationService.markAsRead(notificationId, userId);
    }

    public StudentFeedbackResponse submitFeedbackForCompany(Long companyId, StudentFeedbackRequest request) {
        Student s = getCurrentStudent();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        StudentFeedback fb = new StudentFeedback();
        fb.setStudent(s);
        fb.setCompany(company);
        fb.setRating(request.getRating());
        fb.setComments(request.getComments());
        studentFeedbackRepository.save(fb);

        StudentFeedbackResponse res = new StudentFeedbackResponse();
        res.setId(fb.getId());
        res.setStudentId(s.getId());
        res.setCompanyId(company.getId());
        res.setRating(fb.getRating());
        res.setComments(fb.getComments());
        res.setSubmittedAt(fb.getSubmittedAt());
        return res;
    }

    private JobResponse toJobResponse(JobRequirement job) {
        JobResponse res = new JobResponse();
        res.setJobId(job.getId());
        res.setCompanyId(job.getCompany().getId());
        res.setCompanyName(job.getCompany().getName());
        res.setTitle(job.getTitle());
        res.setDescription(job.getDescription());
        res.setEligibilityCriteria(job.getEligibilityCriteria());
        res.setLocation(job.getLocation());
        res.setCtc(job.getCtc());
        res.setDeadline(job.getDeadline());
        res.setStatus(job.getStatus());
        res.setPostedAt(job.getPostedAt());
        return res;
    }

    public record CvDownload(org.springframework.core.io.Resource resource, String fileName) {}

    public CvDownload downloadActiveCv() {
        Student s = getCurrentStudent();
        CV cv = cvRepository.findByStudent_IdAndIsActiveTrue(s.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No active CV found"));

        org.springframework.core.io.Resource resource = new ByteArrayResource(cv.getData());
        return new CvDownload(resource, cv.getFileName());
    }
}
