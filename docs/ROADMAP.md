# Sewing Inventory App - Roadmap

## Overview
A personal inventory management application for tracking sewing materials including fabric, patterns, and accessories. Built with React Native Web for cross-platform support (Android, iOS, Web).

---

## Phase 1: MVP - Fabric Inventory ⏳

**Goal:** Basic fabric inventory management with CRUD operations

### Features
- [ ] Add new fabric with all fields
  - [ ] Type of fabric
  - [ ] Color and/or pattern
  - [ ] Amount/length (metric system)
  - [ ] Label (brand/manufacturer)
  - [ ] Where purchased
  - [ ] Cost
  - [ ] Multiple images
  - [ ] Project ideas field
- [ ] View/browse all fabrics
  - [ ] List view of all fabrics
  - [ ] Detail view for individual fabric
- [ ] Basic search and filtering
  - [ ] Search by fabric type
  - [ ] Filter by color
  - [ ] Filter by brand
- [ ] Edit fabric entries
- [ ] Delete fabric entries

### Technical Setup
- [ ] Initialize project structure
  - [ ] Backend (Node.js + Express + TypeScript)
  - [ ] Frontend (React Native Web + TypeScript)
- [ ] Setup PostgreSQL database
- [ ] Setup Firebase Authentication
- [ ] Configure local file storage
- [ ] Setup React Query + Zustand
- [ ] Setup React Native Paper

---

## Phase 2: Pattern Management 📋

**Goal:** Track sewing patterns with PDF storage and metadata

### Features
- [ ] Add new pattern with fields
  - [ ] Pattern name/number
  - [ ] Brand
  - [ ] Cost
  - [ ] Garment type
  - [ ] Sizes included
  - [ ] Multiple images
- [ ] PDF pattern storage
  - [ ] Manual PDF upload
  - [ ] Auto-fetch PDF from URL
  - [ ] Store source link
  - [ ] Capture/store instructions from source website
- [ ] View/browse patterns
- [ ] Search and filter patterns
  - [ ] By garment type
  - [ ] By brand
- [ ] Edit pattern entries
- [ ] Delete pattern entries

---

## Phase 3: Accessories & Haberdashery 🧵

**Goal:** Track sewing accessories and notions

### Features
- [ ] Define accessory categories structure
- [ ] Add accessories with relevant fields
- [ ] View/browse accessories
- [ ] Search and filter accessories
- [ ] Edit/delete accessories

---

## Phase 4: Project Tracking 📐

**Goal:** Track completed sewing projects and material usage

### Features
- [ ] Create new project
  - [ ] Project name
  - [ ] Date completed
  - [ ] Multiple photos of finished item
  - [ ] Link materials used
- [ ] Automatic inventory deduction when materials used
- [ ] View project history
- [ ] Link projects to original patterns
- [ ] Track which fabrics were used in which projects

---

## Phase 5: Shopping & Budget Features 💰

**Goal:** Wishlist and spending tracking

### Features
- [ ] Wishlist/Shopping list
  - [ ] Add items to wishlist
  - [ ] Mark items as purchased
  - [ ] Move wishlist items to inventory
- [ ] Budget tracking and reports
  - [ ] Total spending by category
  - [ ] Spending over time
  - [ ] Cost per project
  - [ ] Monthly/yearly reports

---

## Future Features 🚀

### Advanced Features (Priority TBD)
- [ ] Custom tags and notes system
- [ ] Family sharing (read-only access)
- [ ] External fabric store search
  - [ ] Configure favorite fabric labels/stores
  - [ ] Search store websites/APIs for specific fabrics
- [ ] Export data (CSV, PDF reports)
- [ ] Backup and restore functionality
- [ ] Advanced analytics and insights
- [ ] Barcode/QR code scanning for quick entry
- [ ] Fabric swatch matching

---

## Technical Milestones

### Infrastructure
- [ ] Setup CI/CD pipeline
- [ ] Database migrations: using **node-pg-migrate** from the start
- [ ] Migrate to Prisma ORM (when complexity increases)
- [ ] Migrate to cloud blob storage (S3, Azure, etc.)
- [ ] Setup production environment
- [ ] Implement comprehensive testing
- [ ] Performance optimization
- [ ] Security audit

### Platform Rollout
- [x] Web (via React Native Web)
- [ ] Android
- [ ] iOS

---

## Progress Tracking

**Current Phase:** Phase 1 - MVP (Fabric Inventory)
**Status:** Planning Complete
**Next Steps:** Create GitHub issues and begin implementation

**Last Updated:** 2026-02-15
