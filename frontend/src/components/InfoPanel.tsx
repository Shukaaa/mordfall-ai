import {useEffect, useState, useRef} from 'preact/hooks';
import {ApiService, type InventoryItem} from '../services/api';

interface InfoPanelProps {
	caseId?: string | number;
	lastUpdateTrigger?: unknown;
}

type Tab = 'evidence' | 'inventory';

export default function InfoPanel({caseId, lastUpdateTrigger}: InfoPanelProps) {
	const [activeTab, setActiveTab] = useState<Tab>('evidence');
	const [infos, setInfos] = useState<string[]>([]);
	const [inventory, setInventory] = useState<InventoryItem[]>([]);
	const [search, setSearch] = useState<string>("");
	
	const [panelWidth, setPanelWidth] = useState(384);
	const isResizing = useRef(false);
	
	useEffect(() => {
		if (caseId != null) {
			const id = String(caseId);
			Promise.all([
				ApiService.getCoreInfos(id),
				ApiService.getInventory(id)
			]).then(([newInfos, newInventory]) => {
				setInfos(newInfos);
				setInventory(newInventory);
			});
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
	
	const filteredEvidence = infos.filter(i => i.toLowerCase().includes(search.toLowerCase()));
	const filteredInventory = inventory.filter(i =>
			i.name.toLowerCase().includes(search.toLowerCase()) ||
			i.description.toLowerCase().includes(search.toLowerCase())
	);
	
	return (
			<div
					className="relative bg-zinc-900/50 flex h-full border-l border-zinc-800 transition-colors"
					style={{width: `${panelWidth}px`}}
			>
				<div
						onMouseDown={startResizing}
						className="absolute left-[-4px] top-0 w-2 h-full cursor-col-resize hover:bg-blue-500/30 transition-colors z-50"
				/>
				
				<div className="flex flex-col w-full overflow-hidden">
					<div className="flex border-b border-zinc-800 bg-zinc-950/30">
						<button
								onClick={() => setActiveTab('evidence')}
								className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
										activeTab === 'evidence' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-zinc-500 hover:text-zinc-300'
								}`}
						>
							Informationen ({infos.length})
						</button>
						<button
								onClick={() => setActiveTab('inventory')}
								className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
										activeTab === 'inventory' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-zinc-500 hover:text-zinc-300'
								}`}
						>
							Inventar ({inventory.length})
						</button>
					</div>
					
					<div className="p-4 flex flex-col h-full overflow-hidden">
						<input
								type="text"
								placeholder={`${activeTab === 'evidence' ? 'Hinweise' : 'Gegenstände'} suchen...`}
								className="bg-zinc-800/50 p-2 rounded mb-4 text-xs focus:ring-1 ring-blue-500 outline-none border border-zinc-700/50"
								onInput={(e: Event) => setSearch((e.target as HTMLInputElement).value)}
						/>
						
						<div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
							{activeTab === 'evidence' ? (
									filteredEvidence.length > 0 ? (
											filteredEvidence.map((info, idx) => (
													<div key={idx}
															 className="p-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-zinc-300 animate-in slide-in-from-right-2 duration-300">
														<div className="flex gap-2">
															<span className="text-blue-500 font-bold">•</span>
															<p className="leading-relaxed">{info}</p>
														</div>
													</div>
											))
									) : (
											<p className="text-zinc-600 text-xs text-center mt-4 italic">Keine Hinweise gefunden.</p>
									)
							) : (
									filteredInventory.length > 0 ? (
											filteredInventory.map((item) => (
													<div key={item.id}
															 className="group p-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-zinc-100 animate-in zoom-in-95 duration-300">
														<div className="flex items-center gap-2 mb-1">
															<div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"/>
															<span className="font-bold text-xs uppercase tracking-tight">{item.name}</span>
														</div>
														<p className="text-zinc-400 text-xs leading-snug">{item.description}</p>
													</div>
											))
									) : (
											<p className="text-zinc-600 text-xs text-center mt-4 italic">Inventar ist leer.</p>
									)
							)}
						</div>
					</div>
				</div>
			</div>
	);
}