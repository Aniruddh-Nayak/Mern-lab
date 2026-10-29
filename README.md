# MERN Lab Task 1

Two independent web development exercises: an inventory CRUD application backed by an in-memory REST API, and a React sign-up/login application backed by MongoDB.

## Table of contents

- [Project overview](#project-overview)
- [Part A — Inventory CRUD with a REST API](#part-a--inventory-crud-with-a-rest-api)
- [Part B — Sign-up and login with MongoDB](#part-b--sign-up-and-login-with-mongodb)
- [Screenshots](#screenshots)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Security notes](#security-notes)
- [License](#license)

## Project overview

| Part | Application | Backend / storage |
| --- | --- | --- |
| A | Inventory interface to create, view, update, and delete items | Express REST API; data is held in an in-memory JavaScript array |
| B | React sign-up and login interface | Express REST API, MongoDB, bcrypt password hashing, and JWT authentication |

Each part has its own dependencies and is started separately. Follow the setup instructions for the part you want to run.

## Part A — Inventory CRUD with a REST API

Part A is an inventory management interface with item search, add/edit/delete actions, summary statistics, and a light/dark theme toggle. The browser communicates with an Express REST API.

### Run Part A

Requirements: Node.js 18 or later and npm.

```bash
cd part-a-crud
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Items are stored in memory and reset when the server restarts. This is intentional for the array-based exercise.

### REST API

All routes use the `/api/items` base path and JSON request/response bodies.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/items` | List all items |
| `GET` | `/api/items/:id` | Get one item |
| `POST` | `/api/items` | Create an item |
| `PUT` | `/api/items/:id` | Update an item |
| `DELETE` | `/api/items/:id` | Delete an item |

Create and update requests accept an item like:

```json
{
  "name": "Book",
  "price": 250
}
```

## Part B — Sign-up and login with MongoDB

Part B is a React sign-up/login client with an Express API. User records are stored in MongoDB, passwords are hashed with bcrypt, and successful sign-up/login responses include a JWT.

### Configure the server

Requirements: Node.js 18 or later, npm, and a running MongoDB instance (local or MongoDB Atlas).

```bash
cd part-b-signup/server
npm install
cp .env.example .env
```

Edit `part-b-signup/server/.env` and set values for your environment:

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | API server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/mern_signup` |
| `JWT_SECRET` | Secret used to sign tokens | Use a long, unique random value |
| `CLIENT_ORIGIN` | Allowed client origin for CORS | `http://localhost:5173` |

Start the API:

```bash
npm start
```

The API starts at [http://localhost:5000](http://localhost:5000) after it connects to MongoDB. Its health endpoint is `GET /api/health`.

### Start the client

In a second terminal:

```bash
cd part-b-signup/client
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually [http://localhost:5173](http://localhost:5173)).

### Authentication endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account |
| `POST` | `/api/auth/login` | Authenticate an existing account |

Both endpoints accept JSON with `email` and `password` fields. Passwords must contain at least eight characters.

## Screenshots

Add your screenshots to `docs/screenshots/`, then replace the placeholder text below with the corresponding Markdown image, for example:

```md
![Part A output](./docs/screenshots/part-a-output.png)
```

### Part A — REST API inventory output

_Screenshot placeholder — add the Part A application output here._

<!-- Add: ![Part A output](./docs/screenshots/part-a-output.png) -->

### Part B — MongoDB sign-up/login output

_Screenshot placeholder — add the Part B application output here._

<!-- Add: ![Part B output](./docs/screenshots/part-b-output.png) -->

## Project structure

```text
.
├── part-a-crud/
│   ├── public/                 # Inventory web interface
│   └── server.js               # Express CRUD REST API
└── part-b-signup/
    ├── client/                 # React + Vite client
    └── server/                 # Express authentication API and MongoDB models
```

## Requirements

- Node.js 18 or later and npm
- MongoDB (local or MongoDB Atlas) for Part B
- A modern web browser

## Security notes

- Keep `part-b-signup/server/.env` private. It contains local configuration and must not be committed.
- Use a unique, strong `JWT_SECRET`; do not use the example value in a real deployment.
- The authentication setup is intended for a lab exercise. Review and harden it before deploying publicly.

## License

No license has been selected for this project yet.
