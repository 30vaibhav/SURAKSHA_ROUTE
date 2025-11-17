const mongoose = require('mongoose');

module.exports = function connect(){
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ejs_auth_mvc';
  mongoose.set('strictQuery', false);
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
};
