<?php
/**
 * Hochzeits-Tischplan API
 * ─────────────────────────────────────────────────────────────────────────────
 * Speichert den Tischplan-Stand als JSON-Datei (tischplan_data.json) auf dem
 * Server. Diese Datei muss zusammen mit index.html ins Webhosting-Verzeichnis.
 *
 * Optionaler Schreibschutz (empfohlen):
 *   1. Trage unten bei WRITE_TOKEN einen geheimen Wert ein, z.B. 'meinGeheimnis'.
 *   2. Lege im Projektordner eine Datei .env.production an:
 *        VITE_WRITE_TOKEN=meinGeheimnis
 *   3. Baue die App neu: npm run build
 *   Wenn WRITE_TOKEN leer bleibt, sind Schreibzugriffe ohne Token erlaubt.
 */
define('WRITE_TOKEN', '');   // z.B. 'meinGeheimnis123'

// ─── Header ───────────────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Write-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/tischplan_data.json';

// ── GET: aktuellen Stand zurückgeben ──────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo file_exists($dataFile) ? file_get_contents($dataFile) : 'null';
    exit;
}

// ── POST: neuen Stand speichern ───────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Optionale Token-Prüfung
    if (WRITE_TOKEN !== '') {
        $token = $_SERVER['HTTP_X_WRITE_TOKEN'] ?? '';
        if ($token !== WRITE_TOKEN) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
    }

    $body = file_get_contents('php://input');

    // Größenlimit: 2 MB
    if (strlen($body) > 2 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['error' => 'Payload zu groß']);
        exit;
    }

    // JSON + Grundstruktur validieren
    $decoded = json_decode($body, true);
    if ($decoded === null || !isset($decoded['zones']) || !is_array($decoded['zones'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Ungültiges Datenformat']);
        exit;
    }

    // Atomar schreiben: temp-Datei → umbenennen
    $tmpFile = $dataFile . '.tmp.' . getmypid();
    if (file_put_contents($tmpFile, $body, LOCK_EX) === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Datei konnte nicht geschrieben werden']);
        exit;
    }
    rename($tmpFile, $dataFile);

    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Methode nicht erlaubt']);
