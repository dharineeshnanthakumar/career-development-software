package com.careerdevelopment.service;

import com.careerdevelopment.dto.auth.LoginRequest;
import com.careerdevelopment.dto.auth.StudentRegisterRequest;
import com.careerdevelopment.exception.UnauthorizedException;
import com.careerdevelopment.exception.ValidationException;
import com.careerdevelopment.model.Student;
import com.careerdevelopment.model.User;
import com.careerdevelopment.model.enums.Role;
import com.careerdevelopment.repository.CompanyRepository;
import com.careerdevelopment.repository.StudentRepository;
import com.careerdevelopment.repository.UserRepository;
import com.careerdevelopment.security.JwtTokenUtil;
import com.careerdevelopment.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenUtil jwtTokenUtil;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void registerStudent_Success() {
        StudentRegisterRequest req = new StudentRegisterRequest();
        req.setEmail("test@student.com");
        req.setPassword("password123");
        req.setName("Test Student");
        req.setGraduationYear(2025);
        req.setCgpa(8.5);
        req.setRollNumber("12345");
        req.setDepartment("Computer Science");
        req.setPhone("1234567890");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });

        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            s.setId(10L);
            return s;
        });

        var response = authService.registerStudent(req);

        assertNotNull(response);
        assertEquals("test@student.com", response.getEmail());
        assertEquals("Test Student", response.getName());
        verify(userRepository, times(1)).save(any(User.class));
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void registerStudent_EmailAlreadyExists() {
        StudentRegisterRequest req = new StudentRegisterRequest();
        req.setEmail("test@student.com");

        when(userRepository.existsByEmail("test@student.com")).thenReturn(true);

        assertThrows(ValidationException.class, () -> authService.registerStudent(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerStudent_RollNumberAlreadyExists() {
        StudentRegisterRequest req = new StudentRegisterRequest();
        req.setEmail("test@student.com");
        req.setPassword("password123");
        req.setName("Test Student");
        req.setGraduationYear(2025);
        req.setCgpa(8.5);
        req.setRollNumber("12345");
        req.setDepartment("Computer Science");
        req.setPhone("1234567890");

        Student existingStudent = new Student();
        existingStudent.setId(5L);
        existingStudent.setRollNumber("12345");

        when(userRepository.existsByEmail("test@student.com")).thenReturn(false);
        when(studentRepository.findByRollNumber("12345")).thenReturn(Optional.of(existingStudent));

        assertThrows(ValidationException.class, () -> authService.registerStudent(req));
        verify(userRepository, never()).save(any(User.class));
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    void login_Success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@student.com");
        req.setPassword("password123");

        User user = new User();
        user.setId(1L);
        user.setEmail("test@student.com");
        user.setPassword("hashedPassword");
        user.setRole(Role.ROLE_STUDENT);

        when(userRepository.findByEmail("test@student.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtTokenUtil.generateToken(1L, "test@student.com", Role.ROLE_STUDENT)).thenReturn("mocked.jwt.token");

        var response = authService.login(req);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
    }

    @Test
    void login_InvalidPassword() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@student.com");
        req.setPassword("wrongpassword");

        User user = new User();
        user.setEmail("test@student.com");
        user.setPassword("hashedPassword");

        when(userRepository.findByEmail("test@student.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashedPassword")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }
}
