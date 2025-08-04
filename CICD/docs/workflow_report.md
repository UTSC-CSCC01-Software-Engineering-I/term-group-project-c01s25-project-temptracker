# CI/CD Workflow Explanation

## Overview

This document describes the Continuous Integration and Continuous Deployment (CI/CD) process used in **TempTracker**, powered by **GitHub Actions**, **Docker**, and **Microsoft Azure**.

---

## Step-by-Step CI/CD Process

### 1. Developer Pushes/PRs to `main`, `develop`, or Creates a New Release Tag

#### Job 1: Test and Build

Triggered by `.github/workflows/github-actions-workflow.yml`:

- **Server**
  - Inject `.env` using GitHub Secrets
  - Build with `server/Dockerfile`
  - Install dependencies
  - Run unit tests

- **Client**
  - Inject `.env` using GitHub Secrets
  - Build with `client/Dockerfile`
  - Install dependencies
  - Run unit tests

- **Map**
  - Inject `.env` using GitHub Secrets
  - Build with `map/Dockerfile`
  - Run tests for Python map script

- **Docker Hub Push**
  - Log in using credentials stored in GitHub Secrets
  - Build & push:
    - `server:latest` and `server:<tag>`
    - `client:latest` and `client:<tag>`
    - `map:latest` and `map:<tag>`

![Docker Hub](https://drive.google.com/uc?export=view&id=1AKdi72rV-OBXmyPmCYRgk3u5XZ2sfnu3)


#### Job 2: Deploy (Only if Job 1 Succeeds)

- SSH into the Azure VM using a private key and user from GitHub Secrets
- Navigate to the `temptracker` directory
- Run `docker-compose.yml` to pull latest containers from Docker Hub
- The website is deployed and accessible at:  
  [`http://4.236.162.53:3000/`](http://4.236.162.53:3000/)

---

## GitHub Actions Workflow

Located at:  
`.github/workflows/github-actions-workflow.yml`

---

## Dockerfile Locations

- **Client:** `client/Dockerfile`
- **Server:** `server/Dockerfile`
- **Map:** `map/Dockerfile`

---

## Docker Compose File

Located in the VM directory `~/temptracker/`, but a reference copy is also placed in:  
`CICD/config/docker-compose.yml`

---

## Key Steps (CI/CD Summary)

1. **Trigger Workflow** on `push`, `pull_request`, or `release`
2. **Set Up Environments** using GitHub Secrets for all 3 services
3. **Run Tests**:
   - `npm test` (client and server)
   - `pytest`  (map)
4. **Build Docker Images** for client, server, and map
5. **Push to Docker Hub** with both `latest` and versioned tags
6. **SSH to Azure VM** using `SSH_PRIVATE_KEY` and `HOST`
7. **Deploy with Docker Compose**:
   ```bash
   docker compose down
   docker compose pull
   docker compose up -d --remove-orphans
