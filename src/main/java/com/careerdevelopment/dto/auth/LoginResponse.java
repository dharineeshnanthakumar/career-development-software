package com.careerdevelopment.dto.auth;

public class LoginResponse {
    private String token;
    private String tokenType = "Bearer";

    public LoginResponse() {}

    public LoginResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }
}

