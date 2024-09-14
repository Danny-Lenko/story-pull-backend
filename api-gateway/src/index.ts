import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

console.log('test linting test linting test linting');

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CMS API Gateway' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
