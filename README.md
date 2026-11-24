# SkillBridge

A job portal built with the MERN stack that connects candidates and employers. Employers post jobs and list the skills they require. Candidates can compare their skills with job requirements, view their match percentage, and identify skills they may need to improve.

## Live Demo

- **Application:** https://skill-bridge-kappa-peach.vercel.app
- **API Documentation:** https://skillbridge-backend-62vb.onrender.com/api/docs
- **GitHub Repository:** https://github.com/cpai-07/SkillBridge

## Features

### Candidates

- Create an account and log in securely.
- Maintain a skills profile.
- Search and filter available jobs.
- View a match percentage for each job, including matched and missing skills.
- Apply for jobs with a cover letter.
- Track submitted applications.
- View a skill-gap summary showing skills they are missing most often across jobs.
- Extract skills from CV text using the optional AI service or the built-in keyword fallback.

### Employers

- Create, edit and delete job postings.
- Specify the skills required for each job.
- View applicants ranked by their match score.
- Shortlist or reject applicants.

### Other Features

- Candidate and employer roles with JWT authentication.
- Password hashing using bcrypt.
- REST API documentation through Swagger UI.
- API tests using Jest and Supertest.

## How the Match Score Works

The match percentage is calculated by comparing the candidate's skills with the skills required for a job.

```text
Match percentage =
(Number of required skills the candidate has
 / Total number of required skills) × 100
```

Before comparison, skill names are cleaned by converting them to lowercase, removing extra spaces and normalising known variations such as `JS` to `javascript`.

The matching logic is implemented in `server/src/utils/match.js`.

## Technology Stack

| Area                        | Technologies                                                          |
| --------------------------- | --------------------------------------------------------------------- |
| Frontend                    | React 18, Vite, React Router, Axios                                   |
| Backend                     | Node.js, Express                                                      |
| Database                    | MongoDB, Mongoose                                                     |
| Authentication and security | JWT, bcrypt, Helmet, express-rate-limit, express-mongo-sanitize, CORS |
| API documentation           | Swagger UI                                                            |
| Testing                     | Jest, Supertest                                                       |
| Code quality                | ESLint, Prettier                                                      |
| Deployment                  | Vercel, Render, MongoDB Atlas                                         |

## Project Structure

```text
SkillBridge/
├── frontend/
│   └── src/
│       ├── pages/          # Application pages
│       ├── components/     # Reusable UI components
│       └── ...
├── server/
│   └── src/
│       ├── routes/         # API routes
│       ├── controllers/    # Request handling
│       ├── services/       # Application and database logic
│       ├── models/         # Mongoose schemas
│       ├── middleware/     # Authentication, validation and error handling
│       ├── utils/          # Matching logic and helper functions
│       └── docs/           # Swagger/OpenAPI description
│   └── tests/              # Jest and Supertest tests
├── docs/
│   ├── REQUIREMENTS.md
│   └── use-case-diagram.png
├── DEPLOYMENT.md
└── README.md
```

The backend request flow is:

```text
Route → Middleware → Controller → Service → Model → MongoDB
```

Routes define the API endpoints. Middleware handles tasks such as authentication and validation. Controllers process requests, services contain application logic, and models interact with MongoDB.

## Getting Started

### Prerequisites

You need:

- Node.js 20 or newer
- npm
- MongoDB, either a local instance or a MongoDB Atlas cluster

### 1. Clone the Repository

```bash
git clone https://github.com/cpai-07/SkillBridge.git
cd SkillBridge
```

### 2. Configure and Run the Backend

```bash
cd server
npm install
cp .env.example .env
```

Add the required values to `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

Optional AI configuration:

```env
ANTHROPIC_API_KEY=your_api_key
ANTHROPIC_MODEL=your_model_name
```

The AI variables are optional. Without a configured API key, CV skill extraction uses the built-in keyword-based fallback.

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000` by default.

### 3. Configure and Run the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server usually runs at `http://localhost:5173`.

### 4. Optional Demo Data

To create demo users and sample jobs, run the seed command from the `server` folder:

```bash
npm run seed
```

> **Warning:** The seed command clears existing database data before inserting demo users and jobs. Run it only against a development or test database, not a database containing important data.

Demo accounts are intended for local development and testing. They are created when the seed command is run.

## Useful Commands

| Location   | Command          | Purpose                    |
| ---------- | ---------------- | -------------------------- |
| `server`   | `npm test`       | Runs backend tests         |
| `server`   | `npm run lint`   | Checks backend code        |
| `server`   | `npm run format` | Formats backend code       |
| `frontend` | `npm run lint`   | Checks frontend code       |
| `frontend` | `npm run build`  | Creates a production build |

## Environment Variables

### Backend

| Variable            | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `MONGO_URI`         | MongoDB connection string                     |
| `JWT_SECRET`        | Secret used to sign and verify JWTs           |
| `CLIENT_URL`        | Frontend origin allowed by CORS               |
| `PORT`              | API port; defaults to `5000`                  |
| `ANTHROPIC_API_KEY` | Optional key for AI-based CV skill extraction |
| `ANTHROPIC_MODEL`   | Optional model setting for the AI service     |

### Frontend

| Variable       | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `VITE_API_URL` | Backend API address, including the `/api` suffix |

Do not commit `.env` files or real API keys, database credentials or authentication secrets to GitHub.

## API Documentation

When the backend is running locally, open:

`http://localhost:5000/api/docs`

The Swagger UI page documents the API endpoints and allows supported requests to be tried.

Main API groups include:

- `/api/auth`
- `/api/jobs`
- `/api/applications`
- `/api/skills`

## Security

The application includes the following security measures:

- Passwords are hashed using bcrypt and are not returned by the API.
- JWT authentication is used for protected requests.
- Server-side role and ownership checks restrict access to protected resources.
- Input validation is performed on the server.
- Search input is escaped and MongoDB operators are sanitised to help reduce NoSQL injection risks.
- Helmet adds security-related HTTP headers.
- CORS is configured to allow the intended frontend origin.
- Rate limiting is applied to API requests, with stricter limits for selected operations.
- Secrets are stored in environment variables rather than committed to the repository.

## AI Tools and Usage

AI tools were used as development assistance during the creation of SkillBridge.

- **ChatGPT:** Used to refactor code, write the logics, correct sentences in the documentation, and assist with deployment.
- **Claude:** Used to brainstorm ideas, make CSS changes, and restructure the code according to the MVC pattern.

**Application AI feature:** SkillBridge also includes an optional Claude API integration for CV skill extraction. This is separate from using Claude as a development tool. When the API key is not configured, the application uses its built-in keyword-based fallback method.

## Deployment

The application is deployed using Vercel for the frontend, Render for the backend and MongoDB Atlas for the database.

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the deployment setup and configuration steps.

## Project Documentation

- [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) — personas, user stories and project requirements.
- [`docs/use-case-diagram.png`](docs/use-case-diagram.png) — use-case diagram.
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — cloud deployment instructions.
