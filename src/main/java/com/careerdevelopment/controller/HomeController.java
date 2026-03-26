package com.careerdevelopment.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
                "success", true,
                "message", "Welcome to the Career Development Software API!",
                "status", "Running"
        );
    }
}
