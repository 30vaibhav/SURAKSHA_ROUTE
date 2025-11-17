const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.showSignup = (req, res) => {
  res.render('signup');
};

exports.signup = async (req, res) => {
  const { name, email, password, confirm } = req.body;
  if (!name || !email || !password || !confirm) {
    req.session.error = 'All fields are required.';
    return res.redirect('/auth/signup');
  }
  if (password !== confirm) {
    req.session.error = 'Passwords do not match.';
    return res.redirect('/auth/signup');
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      req.session.error = 'Email already registered.';
      return res.redirect('/auth/signup');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, passwordHash });
    await user.save();
    req.session.success = 'Signup successful. You can login now.';
    return res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.session.error = 'Internal error.';
    return res.redirect('/auth/signup');
  }
};

exports.showLogin = (req, res) => {
  res.render('login');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.session.error = 'Email and password required.';
    return res.redirect('/auth/login');
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.session.error = 'Invalid credentials.';
      return res.redirect('/auth/login');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      req.session.error = 'Invalid credentials.';
      return res.redirect('/auth/login');
    }
    // login
    req.session.user = { id: user._id, name: user.name, email: user.email };
    req.session.success = 'Welcome back!';
    return res.redirect('/');
  } catch (err) {
    console.error(err);
    req.session.error = 'Internal error.';
    return res.redirect('/auth/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
