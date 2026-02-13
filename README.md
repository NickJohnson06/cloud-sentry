# CloudSentry

## Overview
CloudSentry is a multi-tenant SaaS analytics and subscription management platform designed to help SaaS businesses track product usage, enforce subscription tiers, and monetize API-driven services.

The platform demonstrates scalable event ingestion architecture, organization-level data isolation, usage-based billing enforcement, and subscription lifecycle automation using Stripe Webhooks. It is built to support high-throughput API event tracking while maintaining strict tenant boundaries and secure access controls.

## Architecture

### High-Level Design
- **Multi-Tenant System:** Organization-based data isolation and workspace management.
- **Event-Driven Ingestion:** Scalable API for high-volume event tracking and indexing.
- **Document-Based Data Modeling:** MongoDB for flexible event storage and aggregation.
- **Secure API:** RESTful endpoints built with Node.js and Express, secured via JWT.
- **Modern Frontend:** React-based SPA with protected routes and real-time visualization.
- **Subscription Engine:** Automated billing lifecycles managed through Stripe Webhooks.
- **Access Control:** Role-Based Access Control (RBAC) for Owners, Admins, and Members.

### Data Flow
User Action → React Frontend → Express API → MongoDB (Atlas)

Stripe Webhooks → Subscription & Plan Enforcement Service → Organization Plan State (MongoDB)

## Objectives
- Build a robust multi-tenant SaaS foundation with strict data isolation.
- Implement secure, API key-based ingestion processing for external events.
- Automate subscription management, including upgrades, downgrades, and cancellations.
- Provide usage analytics and billing metrics through server-side aggregation pipelines.
- Enforce usage limits and rate limiting based on subscription tiers.
- Demonstrate best practices in backend scalability and security.

## Technology Stack

### Infrastructure & Cloud Services
- **Compute:** Render / Railway (Backend)
- **Hosting:** Vercel (Frontend)
- **Database:** MongoDB Atlas
- **Payments:** Stripe

### Application Components
- **Backend Runtime:** Node.js, Express
- **Frontend Framework:** React, Chart.js / Recharts
- **Authentication:** JWT, Custom RBAC

## Key Features

### SaaS Core
- **Multi-tenant Workspaces:** Secure environments for different organizations.
- **Role-Based Access Control:** Granular permissions (Owner, Admin, Member).

### Data & Analytics
- **Secure Ingestion:** Scalable endpoints for event tracking.
- **Dynamic Dashboards:** Visual metrics for usage and revenue.
- **Spike Detection:** Automated alerts for unusual activity.

### Monetization
- **Stripe Integration:** Seamless subscription management.
- **Plan Enforcement:** Automated limits based on active plans.
- **Revenue Metrics:** Built-in financial tracking.

## Project Structure
```
├── backend/                     # Node.js / Express API
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API route definitions
│   │   ├── middleware/          # Auth, RBAC, rate limiting
│   │   ├── services/            # Business logic (billing, analytics)
│   │   ├── utils/               # Helpers and utilities
│   │   └── server.js            # App entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level pages
│   │   ├── services/            # API client logic
│   │   ├── hooks/               # Custom React hooks
│   │   └── App.jsx
│   └── package.json
│
└── README.md                    # Project documentation
```

## Current Status

Phase 1 – Foundation
- [ ] Multi-tenant architecture
- [ ] Authentication & RBAC

Phase 2 – Core Engine
- [ ] Event ingestion pipeline
- [ ] Analytics aggregation layer

Phase 3 – Monetization
- [ ] Stripe subscription integration
- [ ] Plan enforcement middleware

Phase 4 – Enhancements
- [ ] Advanced anomaly detection