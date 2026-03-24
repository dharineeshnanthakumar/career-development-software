package com.careerdevelopment.controller;

import com.careerdevelopment.model.Job;
import com.careerdevelopment.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping("/post")
    public ResponseEntity<Job> postJob(@RequestBody Job job) {
        // TODO: Map to service logic
        return ResponseEntity.ok(null);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        // TODO: Map to service logic
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<Job> getJobById(@PathVariable Long jobId) {
        // TODO: Map to service logic
        return ResponseEntity.ok(null);
    }
}
