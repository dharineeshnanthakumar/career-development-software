package com.careerdevelopment.model;
import javax.persistence.*;
@Entity
@Table(name = "administrators")
public class Administrator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String adminId;
    public Administrator() {
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
}
