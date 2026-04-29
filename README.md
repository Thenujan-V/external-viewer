# AuraDOCS v4 | External Document Viewer
# Overview
This is a standalone Angular micro-frontend designed to provide secure, one-time access to documents stored within the AuraDOCS ecosystem. It is specifically built to handle requests from both unregistered external customers (via ERP integration) and registered internal users.

This project is deployed as a sub-path application at v4.auradocs.com/viewer.

# Security Architecture
The viewer operates on a "Zero-Knowledge" frontend principle:

Token-Based Access: Access is granted only via a unique UUID token.

Hybrid Auth: * External Users: Validated strictly via the token existence and expiry.

Internal Users: Backend enforces a 401 challenge if the token is flagged as "Private," triggering a redirect to the main AuraDOCS login.

One-Time Consumption: Tokens are invalidated by the image-manager microservice immediately after the first successful stream.

# Technical Stack
Framework: Angular 18+ (Standalone Components)

PDF Engine: ng2-pdf-viewer (Mozilla PDF.js based)

Communication: REST API via HttpClient (Base64 Stream)

Deployment: Nginx Reverse Proxy (Sub-path routing)

# Getting Started
Prerequisites
Node.js (v18.x or higher)
Angular (v18)
Angular CLI (`npm install -g @angular/cli`)

Installation

git clone [repository-url]
cd auradocs-external-viewer
npm install

Development Server
Run ng serve for a dev server. Navigate to `http://localhost:4200/viewer?token=YOUR_TEST_TOKEN`

Note: You must include a token query parameter, otherwise the app will redirect to the Access Denied page.

# Build & Deployment
Production Build
The application must be built with a specific base href to function under the Nginx sub-path:
`ng build --configuration production --base-href /viewer/`