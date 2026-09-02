# DevXgen — Developer Community Platform

> Where Developers Interact, Share & Grow | [devxgen.vercel.app](https://devxgen.vercel.app)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Router |
| **Backend** | Node.js, Express, TypeScript, Socket.IO |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | Google OAuth 2.0 + JWT |
| **Media** | AWS S3 presigned URLs |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- Google Cloud Console OAuth 2.0 credentials
- AWS S3 bucket (for media uploads)

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment Variables

**Backend** (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/devxgen
JWT_SECRET=your_strong_random_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=devxgen-uploads
CLIENT_URL=http://localhost:5173
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Exchange OAuth token for JWT |
| GET | `/api/users/me` | Get authenticated user profile |
| PUT | `/api/users/profile` | Update bio and skills |
| GET | `/api/posts` | Paginated feed (tag/type filters) |
| POST | `/api/posts` | Create discussion/announcement |
| POST | `/api/posts/poll` | Create interactive poll |
| POST | `/api/posts/:id/react` | Toggle reaction |
| POST | `/api/posts/:id/vote` | Vote on poll |
| GET | `/api/posts/:id/comments` | Fetch comments |
| POST | `/api/posts/:id/comments` | Create comment |
| POST | `/api/upload/presigned` | Get S3 presigned upload URL |

## Features

- 🔐 **OAuth Integration** — Secure sign-in via Google
- 📝 **Rich Posts** — Text, images, code blocks, and link previews
- 📊 **Interactive Polls** — Live voting with animated progress bars
- 📢 **Announcements** — Visually distinct community updates
- ❤️ **Reactions** — Like, Insightful, Fire, Code-Ninja
- 💬 **Comments** — Nested comments on all post types
- 🔔 **Real-time** — Live notifications via WebSocket
- 🏷️ **Tag Filtering** — Filter feed by topic
- 📱 **Responsive** — Mobile-first with bottom navigation
- ☀️ **Light Mode** — Premium, vibrant light UI with custom animations

## Deployment

| Service | Target |
|---------|--------|
| Frontend | Vercel |
| Backend | Render Web Service |
| Database | MongoDB Atlas |
| Media | AWS S3 |

## License

MIT © DevXgen
