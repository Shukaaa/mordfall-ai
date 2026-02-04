import {generateNewCase, generateSpeech, getAiCaseResponse} from "./openai";
import db from "./db";

export const CaseController = {
	async create(req: Request) {
		const caseDetails = await generateNewCase();
		
		const result = db.prepare(`
      INSERT INTO cases (initial_prompt, title)
      VALUES (?, ?)
      RETURNING id
    `).get(caseDetails.fullSecrets, caseDetails.title) as { id: number };
		
		if (caseDetails.initialInventory && Array.isArray(caseDetails.initialInventory)) {
			const insertItem = db.prepare(`
        INSERT INTO inventory (case_id, item_id, name, description)
        VALUES (?, ?, ?, ?)
      `);
			
			for (const item of caseDetails.initialInventory) {
				insertItem.run(result.id, item.id, item.name, item.description);
			}
		}
		
		db.run(`
      INSERT INTO messages (case_id, role, content, game_time, core_info)
      VALUES (?, ?, ?, ?, ?)
    `, [
			result.id,
			'assistant',
			caseDetails.initialScene,
			caseDetails.startingTime,
			JSON.stringify(["Fall begonnen: " + caseDetails.title])
		]);
		
		return Response.json({
			caseId: result.id,
			title: caseDetails.title,
			intro: caseDetails.initialScene
		});
	},
	
	async listCases() {
		const rows = db.prepare("SELECT id, title FROM cases ORDER BY id DESC").all();
		return Response.json(rows);
	},
	
	async getHistory(caseId: string) {
		const rows = db.prepare("SELECT role, content, game_time as time, core_info FROM messages WHERE case_id = ? ORDER BY id ASC").all(caseId);
		
		const formatted = rows.map((row: any) => ({
			role: row.role,
			content: row.content,
			time: row.time,
			coreInformations: row.core_info ? JSON.parse(row.core_info) : []
		}));
		
		return Response.json(formatted);
	},
	
	async getAllCoreInfos(caseId: string) {
		const rows = db.prepare("SELECT core_info FROM messages WHERE case_id = ? AND core_info IS NOT NULL").all(caseId);
		
		const allCoreInfos = rows.reduce((acc: string[], row: any) => {
			if (row.core_info) {
				try {
					const infos = JSON.parse(row.core_info);
					return acc.concat(infos);
				} catch (e) {
					console.warn("Ungültiges core_info JSON, überspringe:", row.core_info);
				}
			}
			return acc;
		}, []);
		
		return Response.json(allCoreInfos);
	},
	
	async chat(req: Request) {
		const { caseId, message } = await req.json();
		
		const lastEntry = db.prepare("SELECT game_time FROM messages WHERE case_id = ? ORDER BY id DESC LIMIT 1").get(caseId) as { game_time: string };
		const history = db.prepare("SELECT role, content FROM messages WHERE case_id = ?").all(caseId) as any[];
		const currentInventory = db.prepare("SELECT item_id as id, name, description FROM inventory WHERE case_id = ?").all(caseId);
		
		const fullContext = [...history, { role: "user", content: message }];
		const aiData = await getAiCaseResponse(fullContext, lastEntry?.game_time || "08:00", currentInventory);
		
		if (aiData.inventoryChanges && aiData.inventoryChanges.length > 0) {
			for (const change of aiData.inventoryChanges) {
				if (change.action === "ADD") {
					db.run("INSERT INTO inventory (case_id, item_id, name, description) VALUES (?, ?, ?, ?)",
							[caseId, change.id, change.name, change.description]);
				} else if (change.action === "REMOVE") {
					db.run("DELETE FROM inventory WHERE case_id = ? AND item_id = ?", [caseId, change.id]);
				}
			}
		}
		
		db.run("INSERT INTO messages (case_id, role, content) VALUES (?, ?, ?)", [caseId, 'user', message]);
		db.run("INSERT INTO messages (case_id, role, content, game_time, core_info) VALUES (?, ?, ?, ?, ?)",
				[caseId, 'assistant', aiData.text, aiData.time, JSON.stringify(aiData.coreInformations)]);
		
		return Response.json(aiData);
	},
	
	async getInventory(caseId: string) {
		const rows = db.prepare("SELECT item_id as id, name, description FROM inventory WHERE case_id = ?").all(caseId);
		return Response.json(rows);
	},
	
	async streamTTS(req: Request) {
		const url = new URL(req.url);
		const text = url.searchParams.get("text");
		
		if (!text) {
			return new Response("Text parameter is missing", { status: 400 });
		}
		
		try {
			const openAiRes = await generateSpeech(text);
			
			if (!openAiRes.ok) {
				return new Response("OpenAI TTS Error", { status: openAiRes.status });
			}
			
			return new Response(openAiRes.body, {
				headers: {
					"Content-Type": "audio/mpeg",
					"Transfer-Encoding": "chunked",
				},
			});
		} catch (error) {
			console.error("TTS Stream Error:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	}
};