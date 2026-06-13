require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { startScheduler } = require('./services/scheduler');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const scheduleRoutes = require('./routes/schedules');
const logRoutes = require('./routes/logs');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler();
});

module.exports = app;
