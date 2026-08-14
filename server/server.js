const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { PORT, CLIENT_URL } = require('./src/config/env');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth.routes');
const businessRoutes = require('./src/routes/business.routes');
const clientRoutes = require('./src/routes/client.routes');
const invoiceRoutes = require('./src/routes/invoice.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  const { warmUp } = require('./src/services/pdf.service');
  warmUp();
});
