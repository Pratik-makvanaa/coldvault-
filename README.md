## ColdVault (Monorepo)

A full‑stack cold‑storage management app with a React (Vite) frontend and a Spring Boot backend. It helps admins manage cold‑room chambers, customers, and bookings, with a dashboard UI, basic auth, and PDF/printable reports.

### Repo layout
- `backend/`: Java 21 + Spring Boot 3.3.x REST API (MySQL, JPA)
- `coldvault-updated/`: React 18 + Vite + Tailwind CSS frontend

### Features
- Chambers: CRUD per admin with duplicate‑name validation
- Customers: CRUD per admin with duplicate‑name validation
- Bookings: Create/list/delete bookings
- Auth: Simple signup/login for admins (no JWT yet)
- Dashboard UI with charts, sparklines, and PDF export

---

## Tech stack
- Backend: Spring Boot 3.3.5, Spring Web, Spring Data JPA, MySQL Connector/J
- Frontend: React 18, Vite 5, Tailwind CSS, Axios, jsPDF (+ autotable)
- Java 21, Maven Wrapper

---

## Getting started

### Prerequisites
- Java 21
- Node.js 18+ and npm
- MySQL 8.x running locally

### 1) Backend setup (`backend/`)
1. Create a MySQL database:
   - Database name: `coldvault_db`
2. Configure database credentials. Preferred: copy the example file and edit:
   - Copy `backend/application.properties.example` to `backend/src/main/resources/application.properties`
   - Or edit the existing file at `backend/src/main/resources/application.properties`
   - You may also use environment variables
   - `spring.datasource.url=jdbc:mysql://localhost:3306/coldvault_db`
   - `spring.datasource.username=YOUR_DB_USERNAME`
   - `spring.datasource.password=YOUR_DB_PASSWORD`
   - Notes:
     - Default server port is `8080`
     - `spring.jpa.hibernate.ddl-auto=update` auto-creates/updates tables
     - Security auto-config is currently disabled for development
3. Install and run:
   - Windows:
     - `cd backend`
     - `mvnw.cmd spring-boot:run`
   - macOS/Linux:
     - `cd backend`
     - `./mvnw spring-boot:run`

API base URL: `http://localhost:8080/api`

### 2) Frontend setup (`coldvault-updated/`)
1. Install dependencies:
   - `cd coldvault-updated`
   - `npm install`
2. Configure API base URL:
   - Copy `coldvault-updated/env.example` to `coldvault-updated/.env`
   - Adjust `VITE_API_BASE_URL` if your backend runs on a different host/port/path
3. Start dev server:
   - `npm run dev`
4. Open the URL printed by Vite (typically `http://localhost:5173`).

The frontend reads `VITE_API_BASE_URL` (default `http://localhost:8080/api`) from `.env` (see `coldvault-updated/src/api/api.js`).

---

## Environment & configuration
- Do not commit real credentials. Replace any sample passwords with your own secure values.
- Example files:
  - Backend: `backend/application.properties.example` → copy to `backend/src/main/resources/application.properties`
  - Frontend: `coldvault-updated/env.example` → copy to `coldvault-updated/.env`
- For production, consider:
  - Enabling Spring Security/JWT
  - Moving DB credentials to environment variables or a secrets manager
  - CORS restrictions (`@CrossOrigin`) to trusted origins only

---

## API overview (selected)
- `POST /api/auth/signup` – create admin
- `POST /api/auth/login` – login (returns admin object without password)
- `GET /api/chambers?adminId={id}` – list chambers for admin
- `POST /api/chambers` – create chamber
- `DELETE /api/chambers/{id}` – delete chamber
- `GET /api/customers?adminId={id}` – list customers for admin
- `POST /api/customers` – create customer
- `DELETE /api/customers/{id}` – delete customer
- `GET /api/bookings` – list bookings
- `POST /api/bookings` – create booking
- `DELETE /api/bookings/{id}` – delete booking

---

## Build
- Backend (fat jar):
  - `cd backend && mvnw.cmd clean package` (Windows)
  - `cd backend && ./mvnw clean package` (macOS/Linux)
  - Run: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
- Frontend (static build):
  - `cd coldvault-updated && npm run build`
  - Output in `coldvault-updated/dist/`

---

## Project structure (high level)
```
backend/
  src/main/java/com/coldvault/backend/
    controller/ (Admin, Chamber, Customer, Booking)
    model/ repository/ service/
  src/main/resources/application.properties
  pom.xml

coldvault-updated/
  env.example
  src/
    api/api.js
    pages/ (Landing, Login, Dashboard)
    components/ styles/
  package.json
  vite.config.js
  tailwind.config.js
```

---

## Notes and next steps
- Add proper authentication (JWT) and password hashing
- Tighten CORS and validation, add error handling on the client
- Externalize configuration for multiple environments

---

## License
Specify a license here (e.g., MIT) if you intend to open source.

