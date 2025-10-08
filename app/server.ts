import express, { Request, Response } from 'express';
import { Server } from "socket.io";
import authRouter from './src/routes/authRoutes'
import userRouter from './src/routes/userRoutes'
import serverRouter from './src/routes/serverRoutes'
import inviteRoutes from './src/routes/inviteRoutes'
import lobbyRoutes from './src/routes/lobbyRoutes'
import chatRoutes from './src/routes/chatRoutes'
import { fail } from './src/utils/http';
import { errorHandler } from './src/middleware/error';
import { requireAuth } from './src/middleware/authMiddleware';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { createServer } from 'http';
import { initSocket } from './src/sockets';
const app = express();
const port = process.env.PORT || 3001;
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});


// not protected routes
app.use('/api', authRouter);

// auth api
// app.use(requireAuth)

// auth protected routes
app.use('/api', serverRouter)
app.use('/api', userRouter);
app.use('/api', inviteRoutes)
app.use('/api', lobbyRoutes)
app.use('/api', chatRoutes)
// error middlewares
app.use((req, res) => fail(res, "NOT_FOUND", "Route not found", 404));
app.use(errorHandler);

// IO setup
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



export default app;

