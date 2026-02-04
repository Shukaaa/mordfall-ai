export class CustomStorage {
	private static PREFIX = 'detective_game_';
	
	static set(key: string, value: any): void {
		try {
			localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
		} catch (e) {
			console.error('Error saving to localStorage', e);
		}
	}
	
	static get<T>(key: string, defaultValue: T): T {
		try {
			const item = localStorage.getItem(this.PREFIX + key);
			return item ? JSON.parse(item) : defaultValue;
		} catch (e) {
			return defaultValue;
		}
	}
}