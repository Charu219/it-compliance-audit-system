const express   = require('express');
const router    = express.Router();
const jwt       = require('jsonwebtoken');
const passport  = require('../middleware/passport');
const { register, login, getMe } = require('../controllers/authController');
const { auth }  = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me', auth,  getMe);

// ── Google OAuth ──────────────────────────────────────────
// Step 1: redirect user to Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google redirects back here
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=google_failed', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const user  = { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, department: req.user.department, avatar: req.user.avatar };
    // Redirect to frontend with token in URL
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

module.exports = router;