# 🕵️‍♂️ mordfall

> **Note:** This project, including its documentation, source code comments, and AI-generated content, is maintained exclusively in **German**.

Dieses Repository enthält das offizielle Docker-Image für **Mordfall AI**, ein KI-gestütztes Detektiv-Rollenspiel. Die Anwendung nutzt **Bun** im Backend und **Preact** im Frontend, um ein dynamisches Ermittlungserlebnis zu schaffen.

## Schnellstart

Um den Mordfall-Server sofort zu starten, führe diesen Befehl aus:

```bash
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY="DEIN_API_KEY" \
  --name mordfall \
  shukaaa/mordfall:latest

```

Öffne anschließend [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in deinem Browser.

---

## ⚙️ Konfiguration

Das Image wird über Umgebungsvariablen gesteuert.

| Variable | Erforderlich | Beschreibung |
| --- | --- | --- |
| `OPENAI_API_KEY` | **Ja** | Dein OpenAI API-Schlüssel (benötigt für GPT-Logik & TTS). |
| `PORT` | Nein | Der Port, auf dem die App läuft (Standard: `3000`). |
---

## ⚠️ Wichtige Hinweise

* **Kosten:** Die Nutzung der OpenAI API (insbesondere TTS) verursacht Kosten. Behalte dein OpenAI Dashboard im Blick.
* **Entwicklung:** Dieses Image befindet sich in einem frühen Stadium. Feedback und Bug-Reports sind auf [GitHub](https://www.google.com/search?q=https://github.com/Shukaaa/mordfall-ai) willkommen.
