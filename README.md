# Career Development Software (CDS) - Backend

## Prerequisites
- Java 17+
- MySQL 8+
- Maven

## Setup
1. Clone the repository
2. Configure `src/main/resources/application.properties`
   - Change only these 3 values:
     - `spring.datasource.url`
     - `spring.datasource.username`
     - `spring.datasource.password`
3. Run the backend:
   ```bash
   mvn spring-boot:run
   ```

## Default Admin Credentials
- Email: `admin@university.edu`
- Password: `Admin@1234`

On first startup, the application will insert this user (with a BCrypt-hashed password) if the database doesn’t already contain an admin.

## Database Initialization Notes
- The project uses `spring.jpa.hibernate.ddl-auto=update`, which:
  - Automatically creates required tables on first run
  - Applies schema changes incrementally
  - Preserves existing data (no `create` / `create-drop`)
- `DatabaseInitializer` checks the schema and seeds the default admin only when it’s missing.

## API Base URL
- `http://localhost:8080/api`

## Login Example (curl)
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"Admin@1234"}'
```

