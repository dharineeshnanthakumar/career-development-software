package com.careerdevelopment.controller;

import com.careerdevelopment.model.User;
import com.careerdevelopment.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestParam String email, @RequestParam String password) {
        // TODO: Map to service logic
        return ResponseEntity.ok(null);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        // TODO: Map to service logic
        return ResponseEntity.ok("Registration successful");
    }
}
