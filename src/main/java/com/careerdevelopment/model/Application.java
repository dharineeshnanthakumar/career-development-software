package com.careerdevelopment.model;
import com.careerdevelopment.model.enums.ApplicationStatus;
import javax.persistence.*;
import java.util.Date;
@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date applicationDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;
    public Application() {
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public Date getApplicationDate() { return applicationDate; }
    public void setApplicationDate(Date applicationDate) { this.applicationDate = applicationDate; }
    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }
}
