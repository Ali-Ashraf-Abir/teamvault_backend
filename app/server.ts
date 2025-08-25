import express, { Request, Response } from 'express';
import authRouter from './src/routes/authRoutes'
const app = express();
// const router = express.Router();
app.use(express.json());
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/api',authRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


export default app;