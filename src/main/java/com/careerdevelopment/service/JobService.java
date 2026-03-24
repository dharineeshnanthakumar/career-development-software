package com.careerdevelopment.service;

import com.careerdevelopment.model.Job;
import java.util.List;

public interface JobService {
    Job postJob(Job job);
    List<Job> getAllJobs();
    Job getJobById(Long jobId);
    void notifyEligibleStudents(Long jobId);
}
