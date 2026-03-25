package com.careerdevelopment.controller;

import com.careerdevelopment.model.Feedback;
import com.careerdevelopment.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping("/student")
    public ResponseEntity<Feedback> submitStudentFeedback(@RequestBody Feedback feedback) {
        // TODO: Map to service logic
        return new ResponseEntity<>(org.springframework.http.HttpStatus.OK);
    }

    @PostMapping("/company")
    public ResponseEntity<Feedback> submitCompanyFeedback(@RequestBody Feedback feedback) {
        // TODO: Map to service logic
        return new ResponseEntity<>(org.springframework.http.HttpStatus.OK);
    }
}
