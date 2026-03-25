package com.careerdevelopment.model;
import com.careerdevelopment.model.enums.FeedbackType;
import javax.persistence.*;
import java.util.Date;
@Entity
@Table(name = "feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String feedbackId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackType type;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job; 
    @Column(columnDefinition = "TEXT", nullable = false)
    private String comments;
    @Column
    private Integer rating;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date feedbackDate;
    public Feedback() {
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFeedbackId() { return feedbackId; }
    public void setFeedbackId(String feedbackId) { this.feedbackId = feedbackId; }
    public FeedbackType getType() { return type; }
    public void setType(FeedbackType type) { this.type = type; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public Date getFeedbackDate() { return feedbackDate; }
    public void setFeedbackDate(Date feedbackDate) { this.feedbackDate = feedbackDate; }
}
