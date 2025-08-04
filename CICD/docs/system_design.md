# System Design Document

## Overview

This document outlines the architecture and components of the TempTracker application, including client, server, and map services. The system is containerized using Docker and deployed via a CI/CD pipeline on an Azure VM.

---

## Architecture Diagram

![System Architecture](../images/system_architecture.png) *(add a diagram if available)*

---

## Components

### 1. Frontend (`client`)
- Built with Next.js
- Fetches data from the backend API
- Allows photo uploads, temperature tracking, and user profile management

### 2. Backend (`server`)
- Node.js Express API
- Interfaces with Supabase for authentication and data storage
- Exposes `/api` routes for temperature submission, profile handling, photo handling, 

### 3. Map Service (`map`)
- Python script container that tracks temperature trends and uploads data
- Uses `.env` config with Supabase URL and Key

### 4. Database (Supabase)
- Hosted PostgreSQL with authentication
- Used for all storage and auth needs

---

## Deployment Stack

| Component     | Technology             |
|---------------|------------------------|
| Frontend      | Next.js (Dockerized)   |
| Backend       | Node.js Express (Dockerized) |
| Map Script    | Python + Supabase SDK  |
| Deployment    | Azure VM + Docker Compose |
| CI/CD         | GitHub Actions + SSH   |

---
