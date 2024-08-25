require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// User model
const UserSchema = new mongoose.Schema({
  user_id: String,
  email: String,
  roll_number: String
});

const User = mongoose.model('User', UserSchema);

// Initialize user data
async function initializeUser() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const newUser = new User({
        user_id: 'john_doe_17091999',
        email: 'john@xyz.com',
        roll_number: 'ABCD123'
      });
      await newUser.save();
      console.log('User initialized');
    }
  } catch (error) {
    console.error('Error initializing user:', error);
  }
}

// Call initializeUser after successful connection
mongoose.connection.once('open', () => {
  initializeUser();
});

// POST /bfhl endpoint
app.post('/bfhl', async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ is_success: false, error: 'Invalid input. Expected an array.' });
    }

    const numbers = data.filter(item => !isNaN(item));
    const alphabets = data.filter(item => isNaN(item) && item.length === 1);
    const highestLowercaseAlphabet = alphabets
      .filter(char => char.toLowerCase() === char)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 1);

    const user = await User.findOne();

    if (!user) {
      return res.status(404).json({ is_success: false, error: 'User not found' });
    }

    res.json({
      is_success: true,
      user_id: user.user_id,
      email: user.email,
      roll_number: user.roll_number,
      numbers,
      alphabets,
      highest_lowercase_alphabet: highestLowercaseAlphabet,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ is_success: false, error: 'Internal server error' });
  }
});

// GET /bfhl endpoint
app.get('/bfhl', (req, res) => {
  res.json({ operation_code: 1 });
});

app.get('/', (req, res) => {
    res.json("Hello");
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});