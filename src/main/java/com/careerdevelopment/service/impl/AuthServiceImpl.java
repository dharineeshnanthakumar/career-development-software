package com.careerdevelopment.service.impl;

import com.careerdevelopment.model.User;
import com.careerdevelopment.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Override
    public User login(String email, String password) {
        // TODO: Implement login logic
        return null;
    }

    @Override
    public void register(User user) {
        // TODO: Implement register logic
    }
}
