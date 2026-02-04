import { useEffect, useState } from 'preact/hooks';
import { ApiService } from '../services/api';

interface CaseItem {
	id: string;
	title?: string;
}

interface SidebarProps {
	onSelectCase: (id: string) => void;
	activeId?: string;
}

export default function Sidebar({ onSelectCase, activeId }: SidebarProps) {
	const [cases, setCases] = useState([]);
	const [creating, setCreating] = useState<boolean>(false);
	
	const loadCases = async () => {
		const data = await ApiService.listCases();
		setCases(data);
	};
	
	useEffect(() => { loadCases(); }, []);
	
	const handleCreate = async () => {
		setCreating(true);
		try {
			const newCase: { caseId: string } = await ApiService.createCase();
			await loadCases();
			onSelectCase(newCase.caseId);
		} catch (err) {
			console.error('Fehler beim Erstellen des Falls:', err);
		} finally {
			setCreating(false);
		}
	};
	
	return (
			<div className="w-64 bg-zinc-950 p-4 flex flex-col border-r border-zinc-800">
				<button
						type="button"
						onClick={handleCreate}
						className="w-full mb-6 p-3 bg-zinc-100 text-zinc-900 rounded-lg font-bold hover:bg-white transition-colors flex items-center justify-center"
						disabled={creating}
						aria-busy={creating}
				>
					{creating ? (
							<>
								<svg className="animate-spin h-4 w-4 mr-2 text-zinc-900" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
								</svg>
								Erstelle...
							</>
					) : (
							'+ Neuer Fall'
					)}
				</button>
				
				<div className="flex-1 overflow-y-auto space-y-2" aria-live="polite">
					{cases.map((c: CaseItem) => (
							<button
									key={c.id}
									type="button"
									onClick={() => onSelectCase(c.id)}
									className={`w-full text-left p-3 rounded-md transition-all ${
											activeId === c.id ? 'bg-zinc-800 border-l-4 border-blue-500' : 'hover:bg-zinc-900'
									}`}
									disabled={creating}
									aria-disabled={creating}
							>
								<p className="text-sm font-medium truncate">{c.title || `Fall #${c.id}`}</p>
							</button>
					))}
				</div>
			</div>
	);
}