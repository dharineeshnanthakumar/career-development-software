package com.careerdevelopment.model;

import javax.persistence.*;

@Entity
@Table(name = "administrators")
public class Administrator extends User {

    @Column(nullable = false, unique = true)
    private String adminId;

    public Administrator() {
        super();
        this.setRole(com.careerdevelopment.model.enums.Role.ADMIN);
        // TODO: Implement constructor logic
    }

    // Getters and Setters
    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
}
