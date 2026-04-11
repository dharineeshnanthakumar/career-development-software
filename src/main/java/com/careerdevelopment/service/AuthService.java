package com.careerdevelopment.service;

import com.careerdevelopment.config.JwtConfig;
import com.careerdevelopment.dto.auth.CompanyRegisterRequest;
import com.careerdevelopment.dto.auth.LoginRequest;
import com.careerdevelopment.dto.auth.LoginResponse;
import com.careerdevelopment.dto.auth.MeResponse;
import com.careerdevelopment.dto.auth.StudentRegisterRequest;
import com.careerdevelopment.exception.UnauthorizedException;
import com.careerdevelopment.exception.ValidationException;
import com.careerdevelopment.model.Company;
import com.careerdevelopment.model.Student;
import com.careerdevelopment.model.User;
import com.careerdevelopment.model.enums.Role;
import com.careerdevelopment.repository.CompanyRepository;
import com.careerdevelopment.repository.StudentRepository;
import com.careerdevelopment.repository.UserRepository;
import com.careerdevelopment.security.JwtTokenUtil;
import com.careerdevelopment.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.careerdevelopment.dto.student.StudentProfileResponse;
import com.careerdevelopment.dto.company.CompanyProfileResponse;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final SecurityUtils securityUtils;

    public AuthService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenUtil jwtTokenUtil,
            SecurityUtils securityUtils
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.securityUtils = securityUtils;
    }

    public StudentProfileResponse registerStudent(StudentRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_STUDENT);
        userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setName(request.getName());
        student.setRollNumber(request.getRollNumber());
        student.setDepartment(request.getDepartment());
        student.setGraduationYear(request.getGraduationYear());
        student.setCgpa(request.getCgpa());
        student.setPhone(request.getPhone());
        student.setEnrolledInPlacement(false);

        studentRepository.save(student);

        return toStudentProfileResponse(student);
    }

    public CompanyProfileResponse registerCompany(CompanyRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_COMPANY);
        userRepository.save(user);

        Company company = new Company();
        company.setUser(user);
        company.setName(request.getName());
        company.setIndustry(request.getIndustry());
        company.setWebsite(request.getWebsite());
        company.setContactPerson(request.getContactPerson());
        company.setContactEmail(request.getContactEmail().toLowerCase());
        company.setContactPhone(request.getContactPhone());
        company.setVerified(null);

        companyRepository.save(company);

        return toCompanyProfileResponse(company);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Check if company is verified
        if (user.getRole() == Role.ROLE_COMPANY) {
            Company company = companyRepository.findByUser_Id(user.getId())
                    .orElseThrow(() -> new UnauthorizedException("Company profile not found"));
            if (company.isVerified() == null) {
                throw new UnauthorizedException("Your company account is pending verification by the admin. Please contact the administrator.");
            } else if (Boolean.FALSE.equals(company.isVerified())) {
                throw new UnauthorizedException("Your company account has been rejected. Please contact the administrator.");
            }
        }

        String token = jwtTokenUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new LoginResponse(token);
    }

    public MeResponse me() {
        var principal = securityUtils.getPrincipal();
        MeResponse res = new MeResponse();
        res.setUserId(principal.getUserId());
        res.setEmail(principal.getUsername());
        res.setRole(principal.getRole());
        return res;
    }

    private StudentProfileResponse toStudentProfileResponse(Student student) {
        StudentProfileResponse res = new StudentProfileResponse();
        res.setStudentId(student.getId());
        res.setUserId(student.getUser().getId());
        res.setEmail(student.getUser().getEmail());
        res.setName(student.getName());
        res.setRollNumber(student.getRollNumber());
        res.setDepartment(student.getDepartment());
        res.setGraduationYear(student.getGraduationYear());
        res.setCgpa(student.getCgpa());
        res.setPhone(student.getPhone());
        res.setEnrolledInPlacement(student.isEnrolledInPlacement());
        return res;
    }

    private CompanyProfileResponse toCompanyProfileResponse(Company company) {
        CompanyProfileResponse res = new CompanyProfileResponse();
        res.setCompanyId(company.getId());
        res.setUserId(company.getUser().getId());
        res.setEmail(company.getUser().getEmail());
        res.setName(company.getName());
        res.setIndustry(company.getIndustry());
        res.setWebsite(company.getWebsite());
        res.setContactPerson(company.getContactPerson());
        res.setContactEmail(company.getContactEmail());
        res.setContactPhone(company.getContactPhone());
        res.setVerified(company.isVerified());
        return res;
    }
}

