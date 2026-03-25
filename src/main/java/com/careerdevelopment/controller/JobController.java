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
        return new ResponseEntity<>(org.springframework.http.HttpStatus.OK);
    }
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(new java.util.ArrayList<>());
    }
    @GetMapping("/{jobId}")
    public ResponseEntity<Job> getJobById(@PathVariable Long jobId) {
        return new ResponseEntity<>(org.springframework.http.HttpStatus.OK);
    }
}
