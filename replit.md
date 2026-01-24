# Manav Welfare Seva Society - NGO Education Management System

## Overview
This full-stack education management system for Manav Welfare Seva Society supports an NGO providing free education to underprivileged children in Haryana, India. It manages student registrations, roll numbers, admit cards, results, and memberships, featuring distinct admin and student dashboards. The system aims to streamline operations, enhance educational outreach, and facilitate community engagement.

## User Preferences
- **Communication Style**: I prefer clear, concise language and direct answers.
- **Coding Style**: I appreciate well-structured, maintainable code, favoring modern TypeScript practices.
- **Workflow**: I prefer iterative development with regular updates and clear explanations for changes.
- **Interaction**: Please ask for confirmation before making significant architectural changes or altering core functionalities.
- **Working Preferences**: I value detailed explanations for complex solutions and comprehensive summaries of implemented features.

## System Architecture
The system is built as a full-stack application with a clear separation between frontend and backend.

### UI/UX Decisions
- **Design System**: Utilizes `shadcn/ui` and `TailwindCSS` for a modern, responsive, and consistent user interface.
- **Theming**: A clean, accessible color scheme is used across all dashboards (admin, student, public).
- **Templates**: Standardized page layouts for dashboards and public-facing content ensure a uniform user experience.

### Technical Implementations
- **Frontend**: Developed with React, Vite, and TypeScript for a fast and type-safe user interface.
- **Backend**: Implemented using Express.js with TypeScript, providing a robust API layer.
- **Authentication**: JWT-based authentication ensures secure access with role-based control (admin, student, volunteer).
- **Database ORM**: Drizzle ORM is used for type-safe database interactions with PostgreSQL.
- **Email Notifications**: Integrated Nodemailer with Gmail for automated email alerts on key events (registrations, payments, approvals).
- **File Management**: Utilizes Replit App Storage for secure file uploads (e.g., gallery images) with presigned URLs.
- **Internationalization**: Support for bilingual content (Hindi and English) in key areas like team members and services.

### Feature Specifications
- **Student Management**: Registration, roll number generation (e.g., MWSS{year}{4-digit}), results, and admit card generation.
- **Membership Management**: Tracking and generation of membership cards with payment approval workflows.
- **Volunteer Management**: Registration, approval, and management of volunteer accounts and applications.
- **Payment & Donation System**: Tracks donations, fees, and memberships with an admin approval workflow. Supports configurable payment methods (QR codes, UPI IDs, bank details).
- **Content Management**: Dynamic management of public-facing content sections (About Us, Services, Gallery, Events, etc.) and custom pages.
- **Admin Configuration**: Database-driven management of admin sidebar menus and feature toggles.
- **Bulk Operations**: Functionality for bulk roll number assignment and results upload via CSV.

### System Design Choices
- **Modular Structure**: The project is organized into `client/`, `server/`, and `shared/` directories for better maintainability.
- **Database Abstraction**: A `storage.ts` layer in the backend abstracts database operations, allowing for easier future database migrations.
- **Role-Based Access Control**: Ensures that users can only access resources and functionalities permitted by their assigned role (Admin, Student, Volunteer).

## External Dependencies
- **Database**: PostgreSQL (hosted on Replit)
- **Object Storage**: Replit App Storage (for image uploads and other static assets)
- **Email Service**: Gmail via Nodemailer
- **Frontend Libraries**: React, Vite, TypeScript, TailwindCSS, shadcn/ui
- **Backend Libraries**: Express.js, Drizzle ORM, bcrypt (for password hashing), jsonwebtoken (for JWTs), Uppy (for file uploading)