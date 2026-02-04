export const API_BASE = "/api";

export interface InventoryItem {
	id: string;
	name: string;
	description: string;
}

export const ApiService = {
	async listCases() {
		const res = await fetch(`${API_BASE}/cases`);
		return res.json();
	},
	
	async createCase() {
		const res = await fetch(`${API_BASE}/cases`, { method: "POST" });
		return res.json();
	},
	
	async getHistory(caseId: string) {
		const res = await fetch(`${API_BASE}/cases/${caseId}`);
		return res.json();
	},
	
	async getInventory(caseId: string): Promise<InventoryItem[]> {
		const res = await fetch(`${API_BASE}/cases/${caseId}/inventory`);
		if (!res.ok) return [];
		return res.json();
	},
	
	async getCoreInfos(caseId: string) {
		const res = await fetch(`${API_BASE}/cases/${caseId}/coreinfos`);
		return res.json();
	},
	
	async sendChatMessage(caseId: string, message: string) {
		const res = await fetch(`${API_BASE}/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ caseId, message }),
		});
		return res.json();
	},
};