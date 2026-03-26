package com.careerdevelopment.config;

import com.careerdevelopment.model.User;
import com.careerdevelopment.model.enums.Role;
import com.careerdevelopment.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Component
public class DatabaseInitializer {
    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private static final String DEFAULT_ADMIN_EMAIL = "admin@university.edu";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@1234";

    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(DataSource dataSource, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        Set<String> requiredTables = Set.of(
                "users",
                "students",
                "cvs",
                "companies",
                "job_requirements",
                "applications",
                "notifications",
                "company_feedback",
                "student_feedback"
        );

        boolean allTablesExist = tablesExist(requiredTables);
        if (allTablesExist) {
            log.info("Database already initialized, skipping setup");
            // Still ensure the default admin exists (idempotent safety).
            if (!userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
                insertDefaultAdmin();
            }
            return;
        }

        log.info("Initializing database...");

        if (!userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
            insertDefaultAdmin();
        }
    }

    private boolean tablesExist(Set<String> requiredTables) {
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();

            Set<String> existingTables = new HashSet<>();
            try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String table = rs.getString("TABLE_NAME");
                    if (table != null) {
                        existingTables.add(table.toLowerCase(Locale.ROOT));
                    }
                }
            }

            for (String table : requiredTables) {
                if (!existingTables.contains(table.toLowerCase(Locale.ROOT))) {
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            // If schema checks fail, fall back to trying the admin insert; Hibernate will create tables with ddl-auto=update.
            log.warn("Failed to check required tables; will attempt admin initialization anyway. error={}", e.getMessage());
            return false;
        }
    }

    private void insertDefaultAdmin() {
        User admin = new User();
        admin.setEmail(DEFAULT_ADMIN_EMAIL.toLowerCase(Locale.ROOT));
        admin.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
        admin.setRole(Role.ROLE_ADMIN);

        userRepository.save(admin);

        log.warn("Default admin credentials created (first run / missing admin). email={}, password={}",
                DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
    }
}

