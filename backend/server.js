// const express = require('express');
// const cors = require('cors');
// const authRoutes = require('./routes/authRoutes');
// const fileRoutes = require('./routes/fileRoutes');
// const removeRoutes = require('./routes/removeRoutes');
// const app = express();
// require('dotenv').config();

// // CORS configuration
// const corsOptions = {
//   origin: 'http://localhost:3000', // Replace with your frontend's URL if different
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };

// app.use(cors(corsOptions)); // Apply CORS options
// app.use(express.json()); // Parse JSON request bodies
// app.use('/uploads', express.static('uploads')); // Serve static files from the uploads directory
// app.use('/api/auth', authRoutes); // Authentication routes
// app.use('/api/files', fileRoutes); // File-related routes
// app.use('/api/remove', removeRoutes); // Routes for removing files

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const removeRoutes = require('./routes/removeRoutes');
const salesRepRoutes = require('./routes/salesRepRoutes'); // Add this line
const app = express();
require('dotenv').config();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add all needed methods
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If using cookies
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/remove', removeRoutes);
app.use('/api', salesRepRoutes); // Add this line for sales reps

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));