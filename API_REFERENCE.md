# Career Development Software — API Reference

Base URL: `http://localhost:8080`

## Authentication
- Use a JWT in the `Authorization` header for all authenticated endpoints:
  - `Authorization: Bearer <jwt>`
- Roles:
  - `ROLE_STUDENT` (access `/api/student/**`)
  - `ROLE_COMPANY` (access `/api/company/**`)
  - `ROLE_ADMIN` (access `/api/admin/**`)

## Response Format (JSON)
All JSON endpoints return the wrapper:

```json
{
  "success": true,
  "message": "…",
  "data": { }
}
```

On errors returned by the global handler:

```json
{
  "success": false,
  "message": "…",
  "data": null,
  "timestamp": "2026-03-26T10:00:00Z",
  "path": "/api/…"
}
```

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/student` | No | Register as a new student |
| POST | `/api/auth/register/company` | No | Register as a new company (starts unverified) |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get current logged-in user info |

## Admin — Student Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/students/` | ADMIN | List all students |
| POST | `/api/admin/students/enroll/{studentId}` | ADMIN | Enroll student in placement |
| PUT | `/api/admin/students/{studentId}` | ADMIN | Update student record |
| DELETE | `/api/admin/students/{studentId}` | ADMIN | Remove student |

## Admin — Company Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/companies/` | ADMIN | List all companies (including pending) |
| POST | `/api/admin/companies/verify/{companyId}?approve={true\|false}` | ADMIN | Approve/reject company (creates notifications when approved) |
| DELETE | `/api/admin/companies/{companyId}` | ADMIN | Remove company |

## Admin — Feedback

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/feedback/company` | ADMIN | View all company feedback submissions |
| GET | `/api/admin/feedback/student` | ADMIN | View all student feedback submissions |
| GET | `/api/admin/feedback/company/{companyId}` | ADMIN | Feedback for a specific company |
| GET | `/api/admin/feedback/student/{studentId}` | ADMIN | Feedback for a specific student |

## Student

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/student/profile` | STUDENT | View own profile |
| PUT | `/api/student/profile` | STUDENT | Update own profile |
| POST | `/api/student/cv/upload` | STUDENT | Upload CV (PDF/DOCX, max 2MB) |
| GET | `/api/student/cv` | STUDENT | View active CV metadata |
| DELETE | `/api/student/cv/{cvId}` | STUDENT | Delete a CV |
| GET | `/api/student/jobs` | STUDENT | View all open jobs (from verified companies) |
| POST | `/api/student/jobs/{jobId}/apply` | STUDENT | Apply for a job (requires placement enrollment + active CV) |
| GET | `/api/student/applications` | STUDENT | Track own applications |
| GET | `/api/student/notifications` | STUDENT | View notifications |
| PUT | `/api/student/notifications/{id}/read` | STUDENT | Mark notification as read |
| POST | `/api/student/feedback/company/{companyId}` | STUDENT | Submit feedback for a company |

## Company

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/company/profile` | COMPANY | View own profile |
| PUT | `/api/company/profile` | COMPANY | Update own profile |
| POST | `/api/company/jobs` | COMPANY | Post a new job requirement (company must be verified) |
| GET | `/api/company/jobs` | COMPANY | View own job postings |
| PUT | `/api/company/jobs/{jobId}` | COMPANY | Update a job posting |
| GET | `/api/company/jobs/{jobId}/applications` | COMPANY | View all applications for a job (includes CV metadata) |
| GET | `/api/company/cvs/{applicationId}/download` | COMPANY | Download the student CV (file stream response) |
| PUT | `/api/company/applications/{applicationId}/status` | COMPANY | Update application status (triggers notifications) |
| POST | `/api/company/feedback/student/{studentId}` | COMPANY | Submit feedback for a student |
| GET | `/api/company/notifications` | COMPANY | View own notifications |

