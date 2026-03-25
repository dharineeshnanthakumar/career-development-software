package com.careerdevelopment.model;
import com.careerdevelopment.model.enums.ApprovalStatus;
import javax.persistence.*;
import java.util.List;
@Entity
@Table(name = "companies")
public class Company extends User {
    @Column(nullable = false, unique = true)
    private String companyId;
    @Column(nullable = false)
    private String companyName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private List<Job> jobs;
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private List<Feedback> feedbacks;
    public Company() {
        super();
        this.setRole(com.careerdevelopment.model.enums.Role.COMPANY);
    }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public ApprovalStatus getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(ApprovalStatus approvalStatus) { this.approvalStatus = approvalStatus; }
    public List<Job> getJobs() { return jobs; }
    public void setJobs(List<Job> jobs) { this.jobs = jobs; }
    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> feedbacks) { this.feedbacks = feedbacks; }
}
