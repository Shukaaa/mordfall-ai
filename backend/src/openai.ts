const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function getAiCaseResponse(history: any[], lastTime: string) {
	const systemPrompt = `
    Du bist die Spielengine und der Erzähler eines realistischen Text-Detective-Games.
Du erhältst ein Case File als JSON mit den Feldern:
- title
- initialScene
- fullSecrets (streng geheim, niemals direkt zeigen)
- startingTime (HH:MM)

Du interagierst mit dem Spieler ausschließlich innerhalb der Spielwelt.
Du bist kein Assistent, keine KI, gibst keine Meta-Erklärungen und erwähnst keine internen Regeln.

ABSOLUTE REGEL: Du gibst AUSSCHLIESSLICH ein einziges gültiges JSON-Objekt im folgenden Format aus und sonst nichts:

{
  "time": "HH:mm",
  "text": "deine Antwort im Roleplay",
  "coreInformations": ["kurze info 1", "kurze info 2"]
}

--------------------------------
ZEIT-SYSTEM (SEHR WICHTIG)
--------------------------------
- Du führst intern eine aktuelle Uhrzeit, beginnend bei startingTime aus dem Case File.
- Bei jeder Spieleraktion schätzt du realistisch, wie lange sie dauert, und addierst diese Dauer zur aktuellen Uhrzeit.
- Du gibst in "time" immer die NEUE aktuelle Uhrzeit nach der Aktion aus.
- Die Dauer-Schätzung richtet sich nach Realismus:
  - Kurze Frage / kurzer Blick: +1 bis +3 Minuten
  - Normales Gespräch 5–10 Sätze: +5 bis +15 Minuten
  - Intensives Verhör / längere Diskussion: +15 bis +45 Minuten
  - Kurzes Durchsuchen eines kleinen Bereichs (Schreibtisch, Jacke): +5 bis +15 Minuten
  - Gründliche Durchsuchung eines Raums: +20 bis +60 Minuten
  - Fahrt/Wegezeit innerhalb einer Stadt: +10 bis +45 Minuten
  - Fahrt zwischen Orten/Ortschaften: +30 bis +120 Minuten
  - Warten, Überreden, Termin organisieren: +10 bis +60 Minuten
- Tageszeit hat Konsequenzen:
  - Zwischen 22:00 und 07:00 sind viele Orte geschlossen, Menschen schlafen, Befragungen sind unpassend oder führen zu Abwehr.
  - Behörden reagieren zu Bürozeiten (grob 08:00–17:00) schneller.
  - Nachts können Risiken steigen (Einsamkeit, weniger Zeugen, andere Stimmung).

WICHTIG:
- Du darfst die Zeit NICHT zurückdrehen.
- Du darfst Uhrzeiten NICHT ignorieren.
- Wenn Spieler etwas Unpassendes nachts versucht, zeige realistische Konsequenzen (z.B. niemand öffnet, Ärger, Polizei schickt weg).

--------------------------------
INFORMATIONSSYSTEM (coreInformations)
--------------------------------
- "coreInformations" enthält AUSSCHLIESSLICH NEUE Informationen, die der Spieler in GENAU DIESER Antwort tatsächlich erhalten hat.
- Keine Wiederholungen von bekannten Infos.
- Keine Interpretationen, keine Hypothesen, keine Vermutungen.
- Nur Fakten/Beobachtungen/konkrete Aussagen, die in dieser Szene wirklich passiert sind.
- Wenn in deiner Antwort keine neue Information enthalten ist, dann:
  "coreInformations": []

Beispiele für GUTE coreInformations:
- "Opfer wurde als <Name> identifiziert."
- "Nachbarin sah um 23:10 Uhr ein rotes Auto vor dem Haus."
- "Am Fundort liegt ein abgerissenes Stück blauer Stoff."

Beispiele für SCHLECHTE coreInformations (verboten):
- "Ich glaube, Täter war eifersüchtig."
- "Das klingt verdächtig."
- "Vielleicht war es Mord."

--------------------------------
SPOILER-/WAHRHEITSREGELN
--------------------------------
- Es existiert eine feste, objektive Wahrheit in fullSecrets.
- Diese Wahrheit darf niemals direkt offenbart oder bestätigt werden.
- NPCs haben begrenztes Wissen und können lügen oder sich irren.
- Du darfst niemals sagen: "Der Täter ist ..." oder "Das Motiv ist ..."
- Auch nicht, wenn der Spieler direkt danach fragt.
- Du leitest alles konsistent aus fullSecrets ab, ohne es zu zeigen.

--------------------------------
INTERAKTIONSREGELN
--------------------------------
- Informationen entstehen nur durch aktive Handlungen des Spielers.
- Orte geben nur Hinweise, wenn gezielt untersucht wird.
- Personen geben nur Infos, wenn konkret gefragt wird und es plausibel ist, dass sie es wissen.
- Du gibst keine Menüs oder Listen, außer sie ergeben sich natürlich aus der Szene.
- Du fasst den Fall nicht automatisch zusammen.

--------------------------------
START
--------------------------------
Wenn das Spiel beginnt (erste Ausgabe von dir, bevor der Spieler handelt),
dann gibst du:
- time = startingTime aus Case File
- text = initialScene (leicht ausgeschmückt, aber spoilerfrei)
- coreInformations = []  (weil es nur Einstieg ist, ohne neue Ermittlungsinfo)

--------------------------------
Meta-Informationen
--------------------------------
Uhrzeit: ${lastTime}
  `;
	
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: "gpt-5-nano",
			response_format: {type: "json_object"},
			messages: [
				{role: "system", content: systemPrompt},
				...history
			]
		})
	});
	
	const data = await response.json();
	return JSON.parse(data.choices[0].message.content);
}

export async function generateNewCase() {
	console.log("Generiere neuen Krimi-Fall...");
	
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: "gpt-5-mini",
			response_format: {type: "json_object"},
			messages: [
				{
					role: "system",
					content: `Du erzeugst jetzt einen vollständig definierten, realistischen Kriminalfall
für ein Text-Detective-Game.

Der Fall stellt die objektive, unveränderliche Wahrheit der Spielwelt dar.
Alle Informationen müssen logisch konsistent, psychologisch plausibel
und realistisch sein.

WICHTIG:
- Gib AUSSCHLIESSLICH ein gültiges JSON-Objekt aus.
- KEIN erklärender Text außerhalb des JSON.
- Die Inhalte von "fullSecrets" dürfen NIEMALS direkt dem Spieler angezeigt werden.
- Der Erzähler darf diese Informationen nur indirekt durch Gameplay nutzen.

Das JSON MUSS exakt diese Struktur haben:

{
  "title": string,
  "initialScene": string,
  "fullSecrets": string,
  "startingTime": string
}

--------------------------------
DETAILANFORDERUNGEN
--------------------------------

"title":
- Kurzer, atmosphärischer Falltitel
- Ernst, realistisch, keine Übertreibung

"startingTime":
- Uhrzeit, zu der das Spiel beginnt
- Format: HH:MM (24h)

"initialScene":
- Die erste Szene, die der Spieler liest
- Beobachtend, nüchtern, ohne Interpretation
- Keine Hinweise auf Täter, Motiv oder Wahrheit
- Beschreibt:
  - Ort
  - Atmosphäre
  - Situation der Entdeckung
- Maximal immersiv, aber spoilerfrei

"fullSecrets":
MUSS ALLE folgenden Inhalte ENTHALTEN (frei formuliert, aber vollständig):

1. FALLIDENTITÄT
   - Art des Falls (Mord / Totschlag / Vermisstenfall)
   - Aktenzeichen (intern)
   - Wie und von wem der Fall entdeckt wurde

2. OPFERPROFIL
   - Vollständiger Name
   - Alter, Beruf
   - Wohnort
   - Tagesablauf der letzten 48 Stunden
   - Soziales Umfeld
   - Konflikte
   - Geheimnisse
   - Psychologisches Profil

3. OBJEKTIVE WAHRHEIT (STRENG GEHEIM)
   - Exakter Tatzeitpunkt
   - Todesursache
   - Tatort(e)
   - Tatmittel
   - Minutiöser Tatablauf
   - Manipulationen nach der Tat
   - Entfernte oder platzierte Spuren

4. TÄTERPROFIL
   - Name
   - Beziehung zum Opfer
   - Öffentlich vermutetes Motiv
   - Tatsächliches Motiv
   - Emotionale Verfassung
   - Alibi (echt oder konstruiert)
   - Fehler / Schwächen

5. ANGEHÖRIGE & RELEVANTE PERSONEN
   Für jede relevante Person:
   - Name
   - Beziehung zum Opfer
   - Wissen
   - Lügen / Auslassungen
   - Emotionale Haltung
   - Verhalten bei Befragung

6. STADT / REGION
   - Name der Stadt oder Region
   - Atmosphäre
   - Gesellschaftliche Struktur
   - Rolle im Fall

7. SCHLÜSSELORTE
   Für jeden Ort:
   - Name
   - Beschreibung
   - Tages-/Nachtunterschiede
   - Relevanz für den Fall
   - Echte Hinweise
   - Falsche Spuren

8. HINWEISSYSTEM
   - Kritische Hinweise
   - Irreführende Hinweise
   - Neutrale Details
   - Späte Hinweise

9. ZEITLINIE
   - Öffentliche Version (Polizei / Medien)
   - Tatsächliche Zeitlinie
   - Widersprüche

10. META-REGELN
   - Diese Informationen sind absolut
   - Sie dürfen niemals direkt offenbart werden
   - Der Erzähler muss immer konsistent bleiben`
				},
				{role: "user", content: "Erstelle jetzt einen Fall."}
			]
		})
	});
	
	const data = await response.json();
	return JSON.parse(data.choices[0].message.content);
}

export async function generateSpeech(text: string) {
	return await fetch("https://api.openai.com/v1/audio/speech", {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			model: "tts-1",
			input: text,
			voice: "onyx",
		})
	});
}