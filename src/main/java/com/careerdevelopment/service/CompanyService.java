package com.careerdevelopment.service;

import com.careerdevelopment.dto.application.ApplicationResponse;
import com.careerdevelopment.dto.application.ApplicationWithCvResponse;
import com.careerdevelopment.dto.application.ApplicationStatusUpdateRequest;
import com.careerdevelopment.dto.company.CompanyProfileResponse;
import com.careerdevelopment.dto.company.CompanyProfileUpdateRequest;
import com.careerdevelopment.dto.feedback.CompanyFeedbackRequest;
import com.careerdevelopment.dto.feedback.CompanyFeedbackResponse;
import com.careerdevelopment.dto.job.JobCreateRequest;
import com.careerdevelopment.dto.job.JobResponse;
import com.careerdevelopment.dto.job.JobUpdateRequest;
import com.careerdevelopment.dto.notification.NotificationResponse;
import com.careerdevelopment.exception.ResourceNotFoundException;
import com.careerdevelopment.exception.UnauthorizedException;
import com.careerdevelopment.exception.ValidationException;
import com.careerdevelopment.model.Application;
import com.careerdevelopment.model.Company;
import com.careerdevelopment.model.CompanyFeedback;
import com.careerdevelopment.model.CV;
import com.careerdevelopment.model.JobRequirement;
import com.careerdevelopment.model.Student;
import com.careerdevelopment.model.enums.ApplicationStatus;
import com.careerdevelopment.model.enums.JobStatus;
import com.careerdevelopment.model.enums.NotificationType;
import com.careerdevelopment.repository.ApplicationRepository;
import com.careerdevelopment.repository.CompanyFeedbackRepository;
import com.careerdevelopment.repository.CompanyRepository;
import com.careerdevelopment.repository.JobRequirementRepository;
import com.careerdevelopment.repository.StudentRepository;
import com.careerdevelopment.security.SecurityUtils;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {
    private final SecurityUtils securityUtils;
    private final CompanyRepository companyRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final StudentRepository studentRepository;
    private final CompanyFeedbackRepository companyFeedbackRepository;

    public CompanyService(
            SecurityUtils securityUtils,
            CompanyRepository companyRepository,
            JobRequirementRepository jobRequirementRepository,
            ApplicationRepository applicationRepository,
            NotificationService notificationService,
            StudentRepository studentRepository,
            CompanyFeedbackRepository companyFeedbackRepository
    ) {
        this.securityUtils = securityUtils;
        this.companyRepository = companyRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.studentRepository = studentRepository;
        this.companyFeedbackRepository = companyFeedbackRepository;
    }

    private Company getCurrentCompany() {
        Long userId = securityUtils.getPrincipal().getUserId();
        return companyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new UnauthorizedException("Company profile not found"));
    }

    public CompanyProfileResponse getProfile() {
        Company c = getCurrentCompany();
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

    public CompanyProfileResponse updateProfile(CompanyProfileUpdateRequest request) {
        Company c = getCurrentCompany();
        c.setName(request.getName());
        c.setIndustry(request.getIndustry());
        c.setWebsite(request.getWebsite());
        c.setContactPerson(request.getContactPerson());
        c.setContactEmail(request.getContactEmail().toLowerCase());
        c.setContactPhone(request.getContactPhone());
        companyRepository.save(c);
        return getProfile();
    }

    public JobResponse postJob(JobCreateRequest request) {
        Company c = getCurrentCompany();
        if (!c.isVerified()) {
            throw new ValidationException("Company must be verified to post jobs");
        }

        JobRequirement job = new JobRequirement();
        job.setCompany(c);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setEligibilityCriteria(request.getEligibilityCriteria());
        job.setLocation(request.getLocation());
        job.setCtc(request.getCtc());
        try {
            job.setDeadline(request.toDeadline());
        } catch (Exception e) {
            throw new ValidationException("Invalid deadline; expected ISO date (yyyy-MM-dd)");
        }
        job.setStatus(JobStatus.OPEN);
        jobRequirementRepository.save(job);

        // Notify all students about the new job posting.
        List<Student> allStudents = studentRepository.findAll();
        for (Student s : allStudents) {
            notificationService.create(
                    s.getUser(),
                    "New job posted: " + job.getTitle(),
                    "A new job requirement from " + c.getName() + " is now open for applications.",
                    NotificationType.JOB_POSTED
            );
        }

        return toJobResponse(job);
    }

    public List<JobResponse> getMyJobs() {
        Company c = getCurrentCompany();
        return jobRequirementRepository.findByCompany_Id(c.getId()).stream()
                .map(this::toJobResponse)
                .toList();
    }

    public JobResponse updateJob(Long jobId, JobUpdateRequest request) {
        Company c = getCurrentCompany();
        JobRequirement job = jobRequirementRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        if (!job.getCompany().getId().equals(c.getId())) {
            throw new ValidationException("Job does not belong to your company");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setEligibilityCriteria(request.getEligibilityCriteria());
        job.setLocation(request.getLocation());
        job.setCtc(request.getCtc());
        try {
            job.setDeadline(request.toDeadline());
            job.setStatus(request.toStatus());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid job status");
        } catch (Exception e) {
            throw new ValidationException("Invalid deadline; expected ISO date (yyyy-MM-dd)");
        }
        jobRequirementRepository.save(job);

        return toJobResponse(job);
    }

    public List<ApplicationWithCvResponse> getJobApplications(Long jobId) {
        Company c = getCurrentCompany();
        JobRequirement job = jobRequirementRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getCompany().getId().equals(c.getId())) {
            throw new ValidationException("Job does not belong to your company");
        }

        List<Application> apps = applicationRepository.findByJobRequirement_Id(jobId);
        return apps.stream().map(a -> {
            ApplicationWithCvResponse res = new ApplicationWithCvResponse();
            res.setApplicationId(a.getId());
            res.setJobRequirementId(jobId);
            res.setStatus(a.getStatus());
            res.setAppliedAt(a.getAppliedAt());
            res.setStudentId(a.getStudent().getId());
            res.setStudentName(a.getStudent().getName());
            res.setStudentRollNumber(a.getStudent().getRollNumber());
            res.setCvId(a.getCv().getId());
            res.setCvFileName(a.getCv().getFileName());
            return res;
        }).toList();
    }

    public CvDownload downloadCv(Long applicationId) {
        Company c = getCurrentCompany();
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getJobRequirement().getCompany().getId().equals(c.getId())) {
            throw new ValidationException("Application does not belong to your company");
        }

        CV cv = app.getCv();
        Resource resource = new ByteArrayResource(cv.getData());
        return new CvDownload(resource, cv.getFileName());
    }

    public ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequest request) {
        Company c = getCurrentCompany();
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getJobRequirement().getCompany().getId().equals(c.getId())) {
            throw new ValidationException("Application does not belong to your company");
        }

        ApplicationStatus newStatus;
        try {
            newStatus = request.toStatus();
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid application status");
        }
        app.setStatus(newStatus);
        applicationRepository.save(app);

        if (newStatus == ApplicationStatus.INTERVIEW_SCHEDULED) {
            notificationService.create(
                    app.getStudent().getUser(),
                    "Interview scheduled",
                    "Your interview for " + app.getJobRequirement().getTitle() + " has been scheduled.",
                    NotificationType.INTERVIEW_SCHEDULED
            );
        } else if (newStatus == ApplicationStatus.OFFERED) {
            notificationService.create(
                    app.getStudent().getUser(),
                    "Job offer",
                    "Congratulations! You have been offered for " + app.getJobRequirement().getTitle() + ".",
                    NotificationType.JOB_OFFER
            );
        }

        ApplicationResponse res = new ApplicationResponse();
        res.setApplicationId(app.getId());
        res.setJobRequirementId(app.getJobRequirement().getId());
        res.setStatus(app.getStatus());
        res.setAppliedAt(app.getAppliedAt());
        return res;
    }

    public CompanyFeedbackResponse submitFeedbackForStudent(Long studentId, CompanyFeedbackRequest request) {
        Company c = getCurrentCompany();
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Application app = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getStudent().getId().equals(s.getId())) {
            throw new ValidationException("Application does not belong to the given student");
        }
        if (!app.getJobRequirement().getCompany().getId().equals(c.getId())) {
            throw new ValidationException("Application does not belong to your company");
        }

        CompanyFeedback fb = new CompanyFeedback();
        fb.setCompany(c);
        fb.setStudent(s);
        fb.setApplication(app);
        fb.setRating(request.getRating());
        fb.setComments(request.getComments());
        companyFeedbackRepository.save(fb);

        CompanyFeedbackResponse res = new CompanyFeedbackResponse();
        res.setId(fb.getId());
        res.setCompanyId(c.getId());
        res.setStudentId(s.getId());
        res.setApplicationId(app.getId());
        res.setRating(fb.getRating());
        res.setComments(fb.getComments());
        res.setSubmittedAt(fb.getSubmittedAt());
        return res;
    }

    public List<NotificationResponse> getMyNotifications() {
        Long userId = securityUtils.getPrincipal().getUserId();
        return notificationService.listForRecipient(userId);
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

    public record CvDownload(Resource resource, String fileName) {}
}

