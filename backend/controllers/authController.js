const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing username, email, or password' });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ username, email, password, role });

    const createdAt = typeof user.get === 'function'
      ? (user.get('created_at') ?? user.get('createdAt'))
      : (user.created_at ?? user.createdAt ?? null);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        coins: user.coins || 0,
        createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const fields = err.errors?.map(e => e.path).join(', ') || 'unique field';
      return res.status(400).json({ message: `Duplicate value for ${fields}` });
    }
    res.status(500).json({ message: 'Register error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    // Track login activity
    await user.update({
      login_count: (user.login_count || 0) + 1,
      last_login_at: new Date(),
    });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET is not set' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const createdAt = typeof user.get === 'function'
      ? (user.get('created_at') ?? user.get('createdAt'))
      : (user.created_at ?? user.createdAt ?? null);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        coins: user.coins || 0,
        createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'role', 'coins', 'created_at']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      coins: user.coins || 0,
      createdAt: user.created_at,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};
