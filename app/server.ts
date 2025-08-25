import express, { Request, Response } from 'express';
import authRouter from './src/routes/authRoutes'
import { fail } from './src/utils/http';
import { errorHandler } from './src/middleware/error';
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});


// routes
app.use('/api',authRouter);

// error middlewares
app.use((req, res) => fail(res, "NOT_FOUND", "Route not found", 404));
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


export default app;