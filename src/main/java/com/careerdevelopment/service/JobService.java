package com.careerdevelopment.service;
import com.careerdevelopment.model.Job;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
@Service
public class JobService {
    public Job postJob(Job job) {
        return null;
    }
    public List<Job> getAllJobs() {
        return new ArrayList<>();
    }
    public Job getJobById(Long jobId) {
        return null;
    }
    public void notifyEligibleStudents(Long jobId) {
    }
}
