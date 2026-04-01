import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app  = express();
const PORT = process.env.PORT || 3000;

// Datendatei: Umgebungsvariable DATA_FILE oder neben server.js
const DATA_FILE  = process.env.DATA_FILE  || join(__dirname, 'tischplan_data.json');
const WRITE_TOKEN = process.env.WRITE_TOKEN || '';   // optional

app.use(express.json({ limit: '2mb' }));

// Statische React-App aus dist/
app.use(express.static(join(__dirname, 'dist')));

// ── GET /api.php → aktuellen State laden ─────────────────────────────────────
app.get('/api.php', (_req, res) => {
  if (existsSync(DATA_FILE)) {
    res.type('json').send(readFileSync(DATA_FILE, 'utf-8'));
  } else {
    res.type('json').send('null');
  }
});

// ── POST /api.php → State speichern ──────────────────────────────────────────
app.post('/api.php', (req, res) => {
  // Optionale Token-Prüfung
  if (WRITE_TOKEN && req.headers['x-write-token'] !== WRITE_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const data = req.body;
  if (!data || !Array.isArray(data.zones)) {
    return res.status(400).json({ error: 'Ungültiges Datenformat' });
  }

  writeFileSync(DATA_FILE, JSON.stringify(data), 'utf-8');
  res.json({ ok: true });
});

// SPA-Fallback: alle anderen Routen → index.html
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hochzeits-Tischplan läuft auf Port ${PORT}`);
});
