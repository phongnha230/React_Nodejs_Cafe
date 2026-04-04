const jwt = require('jsonwebtoken');

module.exports = function authenticateJWT(req, res, next) {
  const raw = req.header('Authorization');
  if (!raw) return res.status(401).json({ message: 'Missing Authorization header' });

  const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = payload; // {id, role}
    next();
  });
};

