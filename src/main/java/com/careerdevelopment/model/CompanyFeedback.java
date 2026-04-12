package com.careerdevelopment.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "company_feedback")
public class CompanyFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobRequirement jobRequirement;

    @Column(nullable = false)
    private int rating;

    @Lob
    private String comments;

    @Column(nullable = false, updatable = false)
    private Instant submittedAt;

    @PrePersist
    void prePersist() {
        if (submittedAt == null) {
            submittedAt = Instant.now();
        }
    }

    public CompanyFeedback() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public JobRequirement getJobRequirement() {
        return jobRequirement;
    }

    public void setJobRequirement(JobRequirement jobRequirement) {
        this.jobRequirement = jobRequirement;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}

