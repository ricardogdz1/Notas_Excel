# XML to Excel Converter

## Overview

This is a full-stack web application that processes Brazilian NFe (Nota Fiscal Eletrônica) XML files and converts them into Excel spreadsheets. The application allows users to upload multiple XML files, processes them to extract invoice data, and provides downloadable Excel reports. Built with React frontend and Express.js backend, it uses Drizzle ORM for database operations and supports real-time processing status updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and bundling
- **File Upload**: React Dropzone for drag-and-drop file uploads

The frontend follows a component-based architecture with reusable UI components from shadcn/ui. The main workflow consists of three phases: file upload, processing status monitoring, and results display with Excel download capability.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **File Processing**: Multer for multipart file uploads
- **XML Parsing**: xml2js for parsing Brazilian NFe XML structure
- **Excel Generation**: ExcelJS for creating downloadable spreadsheets
- **Database ORM**: Drizzle with PostgreSQL dialect
- **Storage Pattern**: Abstracted storage interface with in-memory implementation

The backend uses a service-oriented architecture with separate modules for XML parsing and Excel generation. File processing is handled asynchronously to prevent blocking the upload response.

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Design**: Two main entities - batches (processing groups) and invoices (individual records)
- **Migration System**: Drizzle Kit for database migrations

The database schema supports batch processing with status tracking and detailed invoice records containing all extracted NFe fields including tax information, company details, and transportation data.

### Authentication and Authorization
Currently, the application does not implement authentication or authorization mechanisms. All endpoints are publicly accessible, making it suitable for internal tools or development environments.

### External Service Integrations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Storage**: In-memory storage with abstracted interface for future cloud storage integration
- **Development Tools**: Replit-specific plugins for development environment integration

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript support
- **Backend Framework**: Express.js with TypeScript
- **Database**: Drizzle ORM, @neondatabase/serverless driver
- **Build Tools**: Vite, esbuild for production builds

### UI and Styling
- **Component Library**: Radix UI primitives (@radix-ui/*)
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx, tailwind-merge for conditional styling

### File Processing
- **Upload Handling**: Multer for multipart form processing
- **XML Parsing**: xml2js for Brazilian NFe XML structure
- **Excel Generation**: ExcelJS for spreadsheet creation
- **Validation**: Zod for runtime type validation

### Development and Build
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development Server**: Vite dev server with HMR
- **Production Build**: esbuild for optimized server bundling
- **Database Tools**: Drizzle Kit for schema management and migrations