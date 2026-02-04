import { useEffect, useState, useRef } from 'preact/hooks';
import { ApiService } from '../services/api';

interface InfoPanelProps {
	caseId?: string | number;
	lastUpdateTrigger?: unknown;
}

export default function InfoPanel({ caseId, lastUpdateTrigger }: InfoPanelProps) {
	const [infos, setInfos] = useState<string[]>([]);
	const [search, setSearch] = useState<string>("");
	
	const [panelWidth, setPanelWidth] = useState(384);
	const isResizing = useRef(false);
	
	useEffect(() => {
		if (caseId != null) {
			ApiService.getCoreInfos(String(caseId)).then(setInfos);
		}
	}, [caseId, lastUpdateTrigger]);
	
	const startResizing = (e: MouseEvent) => {
		isResizing.current = true;
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", stopResizing);
		document.body.style.cursor = "col-resize";
	};
	
	const handleMouseMove = (e: MouseEvent) => {
		if (!isResizing.current) return;
		const newWidth = window.innerWidth - e.clientX;
		if (newWidth > 200 && newWidth < 700) {
			setPanelWidth(newWidth);
		}
	};
	
	const stopResizing = () => {
		isResizing.current = false;
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", stopResizing);
		document.body.style.cursor = "default";
	};
	
	const filtered = infos.filter(i => i.toLowerCase().includes(search.toLowerCase()));
	
	return (
			<div
					className="relative bg-zinc-900/50 flex h-full border-l border-zinc-800"
					style={{ width: `${panelWidth}px` }}
			>
				<div
						onMouseDown={startResizing}
						className="absolute left-[-4px] top-0 w-2 h-full cursor-col-resize hover:bg-blue-500/30 transition-colors z-50"
				/>
				
				<div className="flex flex-col w-full p-4 overflow-hidden">
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
			</div>
	);
}