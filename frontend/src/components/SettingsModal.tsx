import { useState } from 'preact/hooks';
import { soundManager } from '../utils/SoundManager';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
	if (!isOpen) return null;
	
	const [volumes, setVolumes] = useState({
		music: Math.round(soundManager.getGroupVolume('music') * 100),
		ambient: Math.round(soundManager.getGroupVolume('ambient') * 100),
		sfx: Math.round(soundManager.getGroupVolume('sfx') * 100),
		voice: Math.round(soundManager.getGroupVolume('voice') * 100),
	});
	
	const updateVolume = (group: any, val: number) => {
		const volumeFraction = val / 100;
		soundManager.setGroupVolume(group, volumeFraction);
		setVolumes(prev => ({ ...prev, [group]: val }));
	};
	
	return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
				<div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold text-zinc-100">Audio-Einstellungen</h2>
						<button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl cursor-pointer">&times;</button>
					</div>
					
					<div className="space-y-6">
						{Object.entries(volumes).map(([group, value]) => (
								<div key={group} className="space-y-2">
									<div className="flex justify-between items-center">
										<label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">{group}</label>
										<span className="text-xs font-mono text-zinc-400">{value}%</span>
									</div>
									<input
											type="range"
											min="0"
											max="100"
											value={value}
											onInput={(e) => updateVolume(group, parseInt(e.currentTarget.value))}
											className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-100"
									/>
								</div>
						))}
					</div>
					
					<button
							onClick={onClose}
							className="w-full mt-8 p-3 bg-zinc-100 text-zinc-900 rounded-lg font-bold hover:bg-white transition-colors cursor-pointer"
					>
						Schließen
					</button>
				</div>
			</div>
	);
}