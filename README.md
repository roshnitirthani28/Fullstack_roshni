## SyncDoc

SyncDoc is a full-stack real-time collaborative document editor with chat, file uploads, and AI assistance.

### Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Socket.io client
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io
- **AI**: Google Gemini API (`@google/genai`)
- **File Uploads**: Cloudinary

### Features

- **User authentication** with JWT (register & login).
- **Dashboard** to create, rename, delete documents.
- **Document sharing with roles**:
  - Owner (full control)
  - Editor (edit and chat)
  - Viewer (read only, cannot edit)
- **Backend-enforced roles** (viewer edit attempts return HTTP 403).
- **Real-time collaborative editor** per document via Socket.io.
- **Real-time chat** per document.
- **File upload in chat** (stored in Cloudinary).
- **AI helpers** per document:
  - Summarize document
  - Fix grammar (Gemini)

### Project Structure

```text
project-root/
  client/   # Next.js frontend
  server/   # Express backend
```

### Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (or a MongoDB Atlas URI)
- Cloudinary account (for file uploads)
- Google Gemini API key from Google AI Studio

### Setup

1. **Clone / open this folder in Cursor or VS Code.**
2. **Create your environment file:**

   ```bash
   cp .env.example .env
   ```

   Fill in:

   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - Cloudinary values

3. **Install dependencies (root will install for both client and server):**

   ```bash
   npm install
   ```

4. **Run development servers (client + server concurrently):**

   ```bash
   npm run dev
   ```

5. **Open the app:**

   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:4000`

### Sample Test Data

The backend exposes a seed route you can call once to populate sample users and documents.

- After `npm run dev` is running, call:

  ```bash
  curl http://localhost:4000/api/dev/seed
  ```

This will create:

- One owner user
- One editor user
- One viewer user
- A sample shared document

You can then log in with these accounts (see comments in `server/src/dev/seed.js`).

### Scripts

- **Root**
  - `npm run dev` – runs frontend and backend together.
- **Client**
  - `npm run dev` – Next.js dev server.
- **Server**
  - `npm run dev` – Express with nodemon + Socket.io.

### Notes

- JWT is sent in the `Authorization: Bearer <token>` header from the client.
- Viewer users are **blocked** from editing documents:
  - REST API returns **403 Forbidden** when a viewer tries to update.
  - Socket.io edit events are rejected with a 403-style error payload.
