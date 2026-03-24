package com.careerdevelopment.service;

import com.careerdevelopment.model.User;

public interface AuthService {
    User login(String email, String password);
    void register(User user);
}
