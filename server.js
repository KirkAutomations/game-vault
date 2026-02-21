const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DB = path.join(__dirname, 'subscribers.json');

if (!fs.existsSync(DB)) fs.writeFileSync(DB, '[]');

app.use(express.json());
app.use(express.static(__dirname, { index: 'index.html' }));

app.post('/api/subscribe', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const subs = JSON.parse(fs.readFileSync(DB, 'utf8'));
  if (subs.some(s => s.email === email)) {
    return res.json({ message: 'Already subscribed', ok: true });
  }
  subs.push({ email, subscribed_at: new Date().toISOString() });
  fs.writeFileSync(DB, JSON.stringify(subs, null, 2));
  console.log(`✅ New subscriber: ${email} (total: ${subs.length})`);
  res.json({ message: 'Subscribed', ok: true });
});

app.get('/api/subscribers', (req, res) => {
  const subs = JSON.parse(fs.readFileSync(DB, 'utf8'));
  res.json({ count: subs.length, subscribers: subs });
});

app.listen(PORT, () => {
  console.log(`\n🎮 Game Vault running at http://localhost:${PORT}\n`);
});
