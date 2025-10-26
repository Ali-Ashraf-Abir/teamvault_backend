# TeamVault - Backend

The backend server for TeamVault, a real-time collaboration platform. Built with Node.js, Socket.io, and PostgreSQL.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18.x or higher
- Docker and Docker Compose
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Ali-Ashraf-Abir/teamvault-backend.git
cd teamvault-backend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up PostgreSQL with Docker

The project includes a `docker-compose.yml` file for easy PostgreSQL setup.

**Start the PostgreSQL container:**

```bash
docker-compose up -d
```

This will:
- Pull the PostgreSQL Docker image
- Create a container with the database
- Expose PostgreSQL on port 5432
- Create necessary volumes for data persistence

**Check if the container is running:**

```bash
docker-compose ps
```

**View PostgreSQL logs:**

```bash
docker-compose logs postgres
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://admin:admin@localhost:5432/teamvault?schema=public"

# JWT Configuration
JWT_AT_SECRET="your-access-token-secret-change-this-in-production"
JWT_RT_SECRET="your-refresh-token-secret-change-this-in-production"

# Environment
NODE_ENV="development"
```

**Important Notes:**
- The `DATABASE_URL` format follows Prisma's connection string pattern
- Change the database name from `teamvault` to match your database
- **CRITICAL**: Change both JWT secrets in production to secure random strings
- The database credentials (username: `admin`, password: `admin`) should match your `docker-compose.yml` configuration

### 5. Run Database Migrations

Since you're using Prisma, run the following commands:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to set up database schema
npx prisma migrate dev

# (Optional) Seed the database if you have seed data
npx prisma db seed
```

### 6. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The server should now be running on `http://localhost:5000`

## 🐳 Docker Commands

### Starting the Database

```bash
# Start PostgreSQL in detached mode
docker-compose up -d

# Start and view logs
docker-compose up
```

### Stopping the Database

```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers with volumes (deletes data)
docker-compose down -v
```

### Managing the Database

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U teamvault -d teamvault_db

# Backup database
docker-compose exec postgres pg_dump -U teamvault teamvault_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U teamvault teamvault_db < backup.sql
```

## 📁 Project Structure

```
teamvault-backend/
├── src/
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── socket/           # Socket.io handlers
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── prisma/               # Database schema and migrations
├── docker-compose.yml    # Docker configuration
├── .env                  # Environment variables
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Servers
- `GET /api/servers` - Get all user servers
- `POST /api/servers` - Create new server
- `GET /api/servers/:id` - Get server details
- `PUT /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server

### Lobbies
- `GET /api/lobbies` - Get all lobbies
- `POST /api/lobbies` - Create new lobby
- `GET /api/lobbies/:id` - Get lobby details
- `POST /api/lobbies/:id/join` - Join lobby
- `POST /api/lobbies/:id/leave` - Leave lobby

### Invitations
- `GET /api/invitations` - Get user invitations
- `POST /api/invitations` - Send invitation
- `POST /api/invitations/:id/accept` - Accept invitation
- `POST /api/invitations/:id/decline` - Decline invitation

### Messages
- `GET /api/messages/:lobbyId` - Get lobby messages
- `POST /api/messages` - Send message (via Socket.io preferred)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🔌 Socket.io Events

### Server Events
- `connection` - Client connected
- `disconnect` - Client disconnected
- `authenticate` - Authenticate socket connection

### Message Events
- `message:send` - Send a message
- `message:new` - Broadcast new message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

### Lobby Events
- `lobby:join` - Join a lobby room
- `lobby:leave` - Leave a lobby room
- `lobby:updated` - Lobby information changed

### Notification Events
- `notification:new` - New notification for user

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Production Deployment

### Build the Application

```bash
npm run build
```

### Using Docker for Production

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t teamvault-backend .
docker run -p 5000:5000 teamvault-backend
```

## 🔧 Configuration

### Docker Compose Configuration

The `docker-compose.yml` typically contains:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: teamvault
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Note:** These credentials match the DATABASE_URL in your `.env` file.

## 🐛 Troubleshooting

### Database Connection Issues

If you can't connect to PostgreSQL:

1. Check if Docker container is running: `docker-compose ps`
2. Verify database credentials in `.env`
3. Ensure port 5432 is not being used by another service
4. Check Docker logs: `docker-compose logs postgres`

### Port Already in Use

If port 5000 is already in use:

```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Change PORT in .env file
PORT=5001
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Frontend Repository](https://github.com/Ali-Ashraf-Abir/teamvault-frontend)
- [API Documentation](https://docs.teamvault.com/api) (Coming Soon)

---

Built with ❤️ using Node.js and PostgreSQL
