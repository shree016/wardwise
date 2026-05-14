const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const classifyRoute = require('./routes/classify');
const issuesRoute = require('./routes/issues');
const verifyRoute = require('./routes/verify');

app.use('/api/classify', classifyRoute);
app.use('/api/issues', issuesRoute);

app.use('/api/verify', verifyRoute);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'WardWise Backend Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});