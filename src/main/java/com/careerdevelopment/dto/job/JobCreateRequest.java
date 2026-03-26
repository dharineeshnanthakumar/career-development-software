package com.careerdevelopment.dto.job;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class JobCreateRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String eligibilityCriteria;

    @NotBlank
    private String location;

    @NotBlank
    private String ctc;

    @NotBlank
    private String deadline; // ISO-8601 date string, e.g. 2026-12-31

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEligibilityCriteria() {
        return eligibilityCriteria;
    }

    public void setEligibilityCriteria(String eligibilityCriteria) {
        this.eligibilityCriteria = eligibilityCriteria;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCtc() {
        return ctc;
    }

    public void setCtc(String ctc) {
        this.ctc = ctc;
    }

    public String getDeadline() {
        return deadline;
    }

    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }

    public LocalDate toDeadline() {
        return LocalDate.parse(deadline);
    }
}

