const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const groupRoutes = require('./routes/group.routes');
const expenseRoutes = require('./routes/expense.routes');
const chatRoutes = require('./routes/chat.routes');
const personalRoutes = require('./routes/personal.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const expenseManageRoutes = require('./routes/expenseManage.routes');

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/groups', expenseRoutes);
app.use('/api/groups', chatRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/expenses', expenseManageRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
