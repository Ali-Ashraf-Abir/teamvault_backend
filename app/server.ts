import express, { Request, Response } from 'express';
import authRouter from './src/routes/authRoutes'
import userRouter from './src/routes/userRoutes'
import serverRouter from './src/routes/serverRoutes'
import inviteRoutes from './src/routes/inviteRoutes'
import { fail } from './src/utils/http';
import { errorHandler } from './src/middleware/error';
import { requireAuth } from './src/middleware/authMiddleware';
import cookieParser from "cookie-parser";
import cors from 'cors';
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
app.use('/api',authRouter);

// auth api
// app.use(requireAuth)

// auth protected routes
app.use('/api',serverRouter)
app.use('/api',userRouter);
app.use('/api',inviteRoutes)
// error middlewares
app.use((req, res) => fail(res, "NOT_FOUND", "Route not found", 404));
app.use(errorHandler);

console.log("Starting server...");
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


export default app;

