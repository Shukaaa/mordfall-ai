import { useEffect, useState } from 'preact/hooks';
import { ApiService } from '../services/api';
import SettingsModal from "./SettingsModal.tsx";

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
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
						className="w-full mb-6 p-3 bg-zinc-100 text-zinc-900 rounded-lg font-bold hover:bg-white transition-colors flex items-center justify-center cursor-pointer"
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
									className={`w-full text-left p-3 rounded-md transition-all cursor-pointer ${
											activeId === c.id ? 'bg-zinc-800' : 'hover:bg-zinc-900'
									}`}
									disabled={creating}
									aria-disabled={creating}
							>
								<p className="text-sm font-medium truncate">{c.title || `Fall #${c.id}`}</p>
							</button>
					))}
				</div>
				
				<div className="mt-auto pt-4 border-t border-zinc-900">
					<button
							onClick={() => setIsSettingsOpen(true)}
							className="w-full flex items-center gap-3 p-3 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all cursor-pointer"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						<span className="text-sm font-medium">Einstellungen</span>
					</button>
				</div>
				
				<SettingsModal
						isOpen={isSettingsOpen}
						onClose={() => setIsSettingsOpen(false)}
				/>
			</div>
	);
}