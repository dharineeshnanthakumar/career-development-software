package com.careerdevelopment.service;

import com.careerdevelopment.model.Feedback;

public interface FeedbackService {
    Feedback submitStudentFeedback(Feedback feedback);
    Feedback submitCompanyFeedback(Feedback feedback);
}
