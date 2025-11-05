# Student Attendance Management System - TODO List

## CORE ISSUES TO FIX

### 1. Student-Class Relationship

- [x] Create a new join model: StudentClass { studentId, classId }
- [x] Update Student model to remove direct classIds reference
- [x] Update Class model to support many-to-many relationship
- [x] Update backend APIs to support multiple class assignments
- [x] Update UI forms to select multiple classes when adding or editing a
      student

### 2. Show Class Names in Student Table

- [x] Update student list UI to display one or multiple class names per student
- [x] Fetch joined data (populate or manual aggregation)

### 3. Fix "Add Student" form

- [x] Add **Multi-select dropdown** for selecting multiple classes
- [x] On submit, create Student record + StudentClass associations

### 4. Attendance Must Be Taken Per Class

- [x] Add class selector at the top of attendance page
- [x] Show only students belonging to the selected class
- [x] Save attendance records based on (studentId, classId, date)

### 5. Attendance History Filtering

- [x] Allow filtering by class, student, and date

## BACKEND TASKS

### Models

- [x] Create StudentClass model (new)
- [x] Update Student model
- [x] Update Class model
- [x] Update Attendance model (if needed)

### API Endpoints

- [x] Update /api/classes endpoints
- [x] Update /api/students endpoints
- [x] Create /api/student-class endpoints (new)
- [x] Update /api/attendance endpoints

### Data Operations

- [x] Use aggregation or populate for joined results
- [x] Implement proper validation for many-to-many relationships

## FRONTEND TASKS

### UI Components

- [x] Update Add Student modal → multi-select class dropdown
- [x] Display class list next to student rows
- [x] Attendance page:
  - [x] Class dropdown
  - [x] Student list updates when class changes
  - [x] Attendance checkboxes save correctly

### Data Management

- [x] Update DataContext to handle many-to-many relationships
- [x] Update API utility functions
- [x] Implement proper error handling

## IMPLEMENTATION PLAN

### Phase 1: Backend Implementation

1. [x] Create StudentClass model
2. [x] Update existing models (Student, Class, Attendance)
3. [x] Update API routes
4. [x] Test backend functionality

### Phase 2: Frontend Implementation

1. [x] Update DataContext
2. [x] Update UI components
3. [x] Implement multi-select dropdowns
4. [x] Update attendance pages

### Phase 3: Testing & Refinement

1. [x] Test all functionality
2. [x] Fix any issues
3. [x] Optimize performance
4. [x] Clean up code
