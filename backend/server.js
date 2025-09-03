const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');

const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
