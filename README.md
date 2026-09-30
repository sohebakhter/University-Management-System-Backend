# 🎓 University Management System — Backend

A role-based **University Management System Backend** built with **Node.js, Express.js, TypeScript, PostgreSQL, and Prisma ORM**.

The system manages university academic operations including students, instructors, departments, courses, semesters, sections, registrations, payments, attendance, examinations, results, and audit logs.

The application follows a modular and scalable backend architecture with role-based authorization and secure authentication using HTTP-only cookies.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* Role-based access control
* Three primary roles:

  * `ADMIN`
  * `STUDENT`
  * `INSTRUCTOR`
* Secure access/refresh token handling using cookies
* Protected routes using authentication middleware
* User status management
* Google authentication support through `googleId`

### 👨‍🎓 Student Management

* Student profile management
* Unique student ID
* Department association
* Program information
* Admission date
* Student-specific academic information
* Own registrations, payments, attendance, and published results

### 👨‍🏫 Instructor Management

* Instructor profile management
* Unique employee ID
* Department association
* Designation
* Section assignment
* Instructor-specific authorization for assigned sections

### 🏢 Department Management

* Create departments
* View active departments
* View department details
* Update department information
* Soft delete departments
* Unique department codes

### 📚 Course Management

* Course creation and management
* Course code and title
* Credit management
* Department-based courses
* Course listing and details
* Soft deletion

### 📅 Semester Management

* Semester creation
* Academic year management
* Registration period
* Semester fee configuration
* Semester status management
* Semester lifecycle:

```text
UPCOMING
    ↓
REGISTRATION_OPEN
    ↓
ONGOING
    ↓
COMPLETED
```

### 🧑‍🏫 Section Management

* Create sections for courses
* Assign instructors
* Configure section capacity
* Semester-based sections
* View enrolled students
* Instructor-specific section access

### 📝 Course Registration

Registration is connected to both students and sections.

The registration lifecycle is:

```text
PENDING
   ↓
Payment SUCCESS
   ↓
ENROLLED
   ↓
COMPLETED
```

A student can drop an enrolled course before completion.

```text
ENROLLED
   ↓
DROPPED
```

A student cannot attend classes or participate in academic activities through a registration that is still `PENDING`.

### 💳 Payment Management

Semester fee payment is handled separately from academic registration.

Supported providers:

```text
BKASH
STRIPE
SSLCOMMERZ
```

Current payment implementation focuses on **bKash**.

Payment lifecycle:

```text
PENDING
   ├── SUCCESS
   ├── FAILED
   └── CANCELLED
```

When the semester fee payment becomes `SUCCESS`, the student's eligible `PENDING` registrations for that semester can become `ENROLLED`.

### 🗓️ Attendance Management

* Instructor-based attendance marking
* Bulk attendance
* Student attendance history
* Section attendance
* Attendance update
* Only assigned instructors can manage attendance
* Attendance is allowed only for enrolled students

Attendance statuses:

```text
PRESENT
ABSENT
LATE
EXCUSED
```

### 📝 Examination Management

* Create exams
* Assign exams to sections
* Exam types:

  * `QUIZ`
  * `MIDTERM`
  * `FINAL`
  * `ASSIGNMENT`
* Total marks
* Exam date
* Instructor-based section authorization

### 📊 Result Management

* Individual result creation
* Bulk result creation
* Result updates
* Student result history
* Result publishing
* Draft/published result states

Result statuses:

```text
DRAFT
PUBLISHED
```

Students can view their own **published** results.

### 📜 Audit Logs

Important administrative and system actions can be tracked using audit logs.

Each audit log stores:

* Actor
* Action
* Entity
* Entity ID
* Metadata
* Timestamp

---

# 🏗️ Technology Stack

| Technology        | Purpose              |
| ----------------- | -------------------- |
| Node.js           | Runtime              |
| Express.js        | REST API framework   |
| TypeScript        | Type safety          |
| PostgreSQL        | Relational database  |
| Prisma ORM        | Database ORM         |
| JWT               | Authentication       |
| HTTP-only Cookies | Secure token storage |
| Zod/Joi           | Request validation   |
| bKash API         | Payment integration  |
| bcrypt            | Password hashing     |
| Git & GitHub      | Version control      |

---

# 🧩 System Architecture

The system is centered around the following academic relationships:

```text
                         USER
                    /           \
                   /             \
              STUDENT          INSTRUCTOR
                 │                  │
                 │                  │
                 ▼                  ▼
          REGISTRATION           SECTION
                 │              /   │   \
                 │             /    │    \
                 ▼            ▼     ▼     ▼
            ATTENDANCE      COURSE SEMESTER INSTRUCTOR
                 │
                 │
                 ▼
                EXAM
                 │
                 ▼
               RESULT
```

Payment is connected independently to the student and semester:

```text
STUDENT
   │
   ▼
PAYMENT
   ▲
   │
SEMESTER
```

---

# 🔄 Academic Workflow

## 1. Student Registration

A student selects a section and creates a registration.

Initially:

```text
Registration = PENDING
```

The student is not considered officially enrolled yet.

---

## 2. Semester Fee Payment

The student starts the semester fee payment.

```text
Payment = PENDING
```

After successful gateway confirmation:

```text
Payment = SUCCESS
```

The backend can then activate the student's pending registrations for that semester:

```text
PENDING Registration
        ↓
   Payment SUCCESS
        ↓
ENROLLED Registration
```

---

## 3. Class Attendance

Only an enrolled student can have attendance recorded.

```text
Registration = ENROLLED
        ↓
   Attendance
```

Possible statuses:

```text
PRESENT
ABSENT
LATE
EXCUSED
```

---

## 4. Examination

An instructor can create exams for an assigned section.

Example:

```text
Course: Database Management System
Section: A
Exam: Midterm
Total Marks: 30
```

---

## 5. Result

Results are associated with both:

```text
Exam
   +
Registration
```

Example:

```text
Student
   ↓
Registration
   ↓
Exam
   ↓
Result
```

A result can initially remain:

```text
DRAFT
```

and later become:

```text
PUBLISHED
```

Students can view published results.

---

# 👥 User Roles

## ADMIN

The administrator has system-wide management access.

Typical responsibilities:

* Manage departments
* Manage courses
* Manage semesters
* Manage sections
* Manage users
* Manage students/instructors
* Manage registrations
* Manage examinations
* Manage results
* View payments
* Manage system-level operations

---

## STUDENT

Students can access their own academic information.

Typical permissions:

* View own profile
* Register for courses
* View own registrations
* Drop eligible registrations
* Make semester payments
* View payment history
* View own attendance
* View published results

Students cannot:

* Manage other students
* Manage courses
* Create exams
* Mark attendance
* Modify results

---

## INSTRUCTOR

Instructors have academic access limited to their assigned sections.

Typical permissions:

* View assigned sections
* View enrolled students
* Mark attendance
* Update attendance
* Create exams for assigned sections
* Create/update results for assigned sections

An instructor cannot manage another instructor's section.

---

# 🗄️ Database Design

The database is implemented using PostgreSQL and Prisma ORM.

## Main Models

```text
User
Student
Instructor
Department
Course
Semester
Section
Registration
Attendance
Exam
Result
Payment
AuditLog
```

---

# 🔗 Entity Relationships

### User → Student

```text
User 1 ───── 1 Student
```

### User → Instructor

```text
User 1 ───── 1 Instructor
```

### Department → Student

```text
Department 1 ───── N Student
```

### Department → Instructor

```text
Department 1 ───── N Instructor
```

### Department → Course

```text
Department 1 ───── N Course
```

### Course → Section

```text
Course 1 ───── N Section
```

### Semester → Section

```text
Semester 1 ───── N Section
```

### Instructor → Section

```text
Instructor 1 ───── N Section
```

### Student → Registration

```text
Student 1 ───── N Registration
```

### Section → Registration

```text
Section 1 ───── N Registration
```

### Registration → Attendance

```text
Registration 1 ───── N Attendance
```

### Section → Exam

```text
Section 1 ───── N Exam
```

### Exam → Result

```text
Exam 1 ───── N Result
```

### Registration → Result

```text
Registration 1 ───── N Result
```

### Student → Payment

```text
Student 1 ───── N Payment
```

### Semester → Payment

```text
Semester 1 ───── N Payment
```

---

# 📁 Suggested Project Structure

```text
src/
│
├── app/
│   ├── config/
│   ├── errors/
│   ├── middlewares/
│   ├── routes/
│   └── utils/
│
├── modules/
│   │
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.route.ts
│   │   └── auth.validation.ts
│   │
│   ├── user/
│   ├── student/
│   ├── instructor/
│   ├── department/
│   ├── course/
│   ├── semester/
│   ├── section/
│   ├── registration/
│   ├── attendance/
│   ├── exam/
│   ├── result/
│   └── payment/
│
├── generated/
│   └── prisma/
│
├── app.ts
└── server.ts
│
├── prisma/
│   └── schema/
│       ├── schema.prisma
│       ├── enums.prisma
│       ├── user.prisma
│       ├── student.prisma
│       ├── instructor.prisma
│       ├── department.prisma
│       ├── course.prisma
│       ├── semester.prisma
│       ├── section.prisma
│       ├── registration.prisma
│       ├── attendance.prisma
│       ├── exam.prisma
│       ├── result.prisma
│       ├── payment.prisma
│       └── auditLog.prisma
│
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

# 🔐 Authentication

Authentication uses JWT-based access and refresh tokens.

Tokens are stored in secure cookies rather than database fields.

The database does **not** store:

```text
accessToken
refreshToken
```

The `User` model therefore does not require token/refresh-token columns.

---

# 🛡️ Authorization

Protected routes use role-based middleware.

Conceptually:

```text
Request
   ↓
Authentication
   ↓
Identify User
   ↓
Check Role
   ↓
Check Resource Ownership
   ↓
Controller
   ↓
Service
   ↓
Database
```

For instructors, role authorization alone is not enough.

The backend also checks whether the instructor is actually assigned to the requested section.

Example:

```text
INSTRUCTOR
    ↓
Instructor profile
    ↓
section.instructorId
    ↓
Requested section
```

This prevents an instructor from managing another instructor's section.

---

# 💳 Payment Flow

The current payment architecture supports multiple providers through the `PaymentProvider` enum.

```text
PaymentProvider
├── BKASH
├── STRIPE
└── SSLCOMMERZ
```

Current gateway flow:

```text
Student
   ↓
POST /payments/checkout
   ↓
Create Payment
   ↓
PENDING
   ↓
bKash Initiation
   ↓
bKash Checkout
   ↓
Callback
   ↓
Execute Payment
   ↓
SUCCESS / FAILED / CANCELLED
```

For a successful payment:

```text
Payment.SUCCESS
      ↓
Find student's PENDING registrations
      ↓
Match semester
      ↓
Registration.ENROLLED
```

---

# 🌐 API Overview

## Authentication

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh-token
POST   /auth/logout
```

---

## Departments

```text
POST   /departments
GET    /departments
GET    /departments/:id
PATCH  /departments/:id
DELETE /departments/:id
```

---

## Courses

```text
POST   /courses
GET    /courses
GET    /courses/:id
PATCH  /courses/:id
DELETE /courses/:id
```

---

## Semesters

```text
POST   /semesters
GET    /semesters
GET    /semesters/:id
PATCH  /semesters/:id
PATCH  /semesters/:id/status
DELETE /semesters/:id
```

---

## Sections

```text
POST   /sections
GET    /sections
GET    /sections/:id
PATCH  /sections/:id
DELETE /sections/:id
GET    /sections/:id/students
```

---

## Registrations

```text
POST   /registrations
GET    /registrations
GET    /registrations/my
GET    /registrations/:id
PATCH  /registrations/:id/drop
PATCH  /registrations/:id/status
```

---

## Attendance

```text
POST   /attendance
POST   /attendance/bulk
GET    /attendance/my
GET    /attendance/section/:sectionId
PATCH  /attendance/:id
```

---

## Exams

```text
POST   /exams
GET    /exams
GET    /exams/:id
PATCH  /exams/:id
DELETE /exams/:id
```

---

## Results

```text
POST   /results
POST   /results/bulk
GET    /results/my
GET    /results/registration/:registrationId
PATCH  /results/:id
```

---

## Payments

```text
POST   /payments/checkout
POST   /payments/bkash/initiate
POST   /payments/bkash/callback
GET    /payments/my
GET    /payments/:id
```

---

# 📌 Important Business Rules

### Registration

A registration must belong to:

* An existing student
* An active section

The student must satisfy the semester registration requirements.

A registration starts as:

```text
PENDING
```

and becomes:

```text
ENROLLED
```

after successful semester fee payment.

---

### Section Capacity

A section cannot exceed its configured capacity.

```text
Section Capacity = 40

Current Enrolled Students = 40

New Enrollment
     ↓
❌ Not Allowed
```

Only active/enrolled registrations should be considered for capacity.

---

### Attendance

Attendance can only be marked when:

```text
Registration.status = ENROLLED
```

and the instructor must be assigned to the section.

---

### Result

A result must belong to:

* A valid exam
* A valid registration
* The same section

The marks must not exceed the exam's total marks.

Example:

```text
Total Marks = 50

Valid:
0 ≤ marks ≤ 50
```

---

### Result Visibility

Students should only see:

```text
ResultStatus = PUBLISHED
```

Draft results remain available to authorized academic staff.

---

### Payment

A successful payment belongs to:

```text
Student + Semester
```

Payment status is independent from attendance and result records, but successful semester payment controls whether pending registrations become active/enrolled.

---

# 🗑️ Soft Delete

The following entities support soft deletion using:

```prisma
deletedAt DateTime?
```

Examples:

```text
Student
Instructor
Department
Course
Section
Registration
```

Active records are generally queried using:

```ts
deletedAt: null
```

This preserves historical data instead of physically removing records.

---

# ⚠️ Exam Deletion Note

The current `Exam` model does not contain a `deletedAt` field.

Therefore, if soft deletion is required for exams, add:

```prisma
deletedAt DateTime?
```

to the `Exam` model.

This is preferable to physically deleting an exam that may already have results associated with it.

---

# 🧪 Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/university_db"

PORT=5000

NODE_ENV=development

JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

BCRYPT_SALT_ROUNDS=10

BKASH_BASE_URL="your-bkash-base-url"
BKASH_APP_KEY="your-bkash-app-key"
BKASH_APP_SECRET="your-bkash-app-secret"
BKASH_USERNAME="your-bkash-username"
BKASH_PASSWORD="your-bkash-password"
BKASH_CALLBACK_URL="your-callback-url"
```

> Never commit real credentials or secrets to GitHub.

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
```

```bash
cd University-Management-System-Backend
```

---

## 2. Install dependencies

Using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

---

## 3. Configure environment variables

Create:

```text
.env
```

and configure the required environment variables.

---

## 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## 5. Run database migration

For development:

```bash
npx prisma migrate dev
```

---

## 6. Start development server

```bash
npm run dev
```

or:

```bash
pnpm dev
```

---

# 📦 Useful Prisma Commands

Generate Prisma Client:

```bash
npx prisma generate
```

Create migration:

```bash
npx prisma migrate dev --name init
```

Open Prisma Studio:

```bash
npx prisma studio
```

Format Prisma schema:

```bash
npx prisma format
```

Check Prisma schema:

```bash
npx prisma validate
```

---

# 🧪 API Testing

Recommended tools:

* Postman
* Thunder Client
* Insomnia

Suggested testing order:

```text
1. Register/Login
       ↓
2. Create Department
       ↓
3. Create Student/Instructor
       ↓
4. Create Course
       ↓
5. Create Semester
       ↓
6. Create Section
       ↓
7. Student Registration
       ↓
8. Payment
       ↓
9. Registration → ENROLLED
       ↓
10. Attendance
       ↓
11. Exam
       ↓
12. Result
```

---

# 🔒 Security Considerations

The application should follow these security practices:

* Password hashing using bcrypt
* HTTP-only cookies for authentication tokens
* Secure cookie configuration in production
* Role-based authorization
* Resource-level authorization
* Request validation
* Environment-based secrets
* No hard-coded credentials
* Database constraints for unique values
* Soft deletion for important records
* Audit logging for sensitive operations

---

# 📈 Future Improvements

Possible future extensions include:

* Advanced dashboard APIs
* GPA/CGPA calculation
* Transcript generation
* Course prerequisite management
* Student academic promotion
* Faculty workload management
* Class routine management
* Automated email notifications
* SMS notifications
* Stripe integration
* SSLCommerz integration
* Payment refund system
* More detailed audit reporting
* File/document management
* Admin analytics
* Pagination and advanced filtering
* API documentation with Swagger/OpenAPI

---

# 🎯 Project Goal

The goal of this project is to provide a clean, secure, and scalable backend architecture for managing university academic operations.

The system separates major responsibilities into independent but connected domains:

```text
Authentication
      │
      ▼
Users
      │
 ┌────┴─────┐
 ▼          ▼
Student   Instructor
 │          │
 │          └────────┐
 ▼                   ▼
Registration ─────► Section
 │                   │
 ├── Attendance      ├── Course
 │                   ├── Semester
 │                   └── Instructor
 │
 └── Result ◄────── Exam

Student ───── Payment ───── Semester
```

This separation keeps the academic, financial, and authentication responsibilities clear while allowing them to work together as one complete university management system.

---

# 👨‍💻 Author

**Soheb Akhter Badhan**

Full Stack Web Developer

Built with:

```text
Node.js
Express.js
TypeScript
PostgreSQL
Prisma
JWT
bKash
```

---

# 📄 License

This project is developed for educational and portfolio purposes.
