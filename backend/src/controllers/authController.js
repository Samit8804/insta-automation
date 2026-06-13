const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword })
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw error;

    const token = generateToken(user.id);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (preferences) {
      if (preferences.automationEnabled !== undefined)
        updates.preferences_automation_enabled = preferences.automationEnabled;
      if (preferences.defaultMode)
        updates.preferences_default_mode = preferences.defaultMode;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, role, created_at, preferences_automation_enabled, preferences_default_mode')
      .single();

    if (error) throw error;

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
