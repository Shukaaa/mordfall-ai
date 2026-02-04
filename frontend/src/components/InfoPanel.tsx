import { useEffect, useState } from 'preact/hooks';
import { ApiService } from '../services/api';

interface InfoPanelProps {
	caseId?: string | number;
	lastUpdateTrigger?: unknown;
}

export default function InfoPanel({ caseId, lastUpdateTrigger }: InfoPanelProps) {
	const [infos, setInfos] = useState<string[]>([]);
	const [search, setSearch] = useState<string>("");
	
	useEffect(() => {
		if (caseId != null) {
			ApiService.getCoreInfos(String(caseId)).then(setInfos);
		}
	}, [caseId, lastUpdateTrigger]);
	
	const filtered = infos.filter(i => i.toLowerCase().includes(search.toLowerCase()));
	
	return (
			<div className="w-80 bg-zinc-900/50 p-4 flex flex-col h-full border-l border-zinc-800">
				<h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Evidence Log</h3>
				<input
						type="text"
						placeholder="Suchen..."
						className="bg-zinc-800 p-2 rounded mb-4 text-xs focus:ring-1 ring-blue-500 outline-none"
						onInput={(e: Event) => setSearch((e.target as HTMLInputElement).value)}
				/>
				<div className="flex-1 overflow-y-auto space-y-2">
					{filtered.map((info, idx) => (
							<div key={idx} className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 animate-in fade-in duration-500">
								{info}
							</div>
					))}
				</div>
			</div>
	);
}
