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
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public StudentProfileResponse registerStudent(StudentRegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        String rollNumber = request.getRollNumber().trim();
        
        if (userRepository.existsByEmail(email)) {
            throw new ValidationException("Email already in use");
        }

        if (studentRepository.findByRollNumber(rollNumber).isPresent()) {
            throw new ValidationException("Roll number already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_STUDENT);
        userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setName(request.getName().trim());
        student.setRollNumber(rollNumber);
        student.setDepartment(request.getDepartment().trim());
        student.setGraduationYear(request.getGraduationYear());
        student.setCgpa(request.getCgpa());
        student.setPhone(request.getPhone().trim());
        student.setEnrolledInPlacement(false);

        studentRepository.save(student);

        return toStudentProfileResponse(student);
    }

    @Transactional
    public CompanyProfileResponse registerCompany(CompanyRegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        String contactEmail = request.getContactEmail().toLowerCase().trim();
        
        if (userRepository.existsByEmail(email)) {
            throw new ValidationException("Email already in use");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_COMPANY);
        userRepository.save(user);

        Company company = new Company();
        company.setUser(user);
        company.setName(request.getName().trim());
        company.setIndustry(request.getIndustry().trim());
        company.setWebsite(request.getWebsite() != null ? request.getWebsite().trim() : null);
        company.setContactPerson(request.getContactPerson().trim());
        company.setContactEmail(contactEmail);
        company.setContactPhone(request.getContactPhone() != null ? request.getContactPhone().trim() : null);
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
            if (!Boolean.TRUE.equals(company.isVerified())) {
                throw new UnauthorizedException("Your company account is pending verification by the admin. Please contact the administrator.");
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

