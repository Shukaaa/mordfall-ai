import {API_BASE, ApiService} from "../services/api";
import {useState} from "preact/hooks";

type Message = {
	role: "user" | "assistant" | "system" | string;
	content: string;
	time: string;
	coreInformations?: string[];
};

type ChatWindowProps = {
	caseId?: string;
	messages?: Message[];
	onNewMessage: (m: Message) => void;
};

export default function ChatWindow({caseId, messages = [], onNewMessage}: ChatWindowProps) {
	const [input, setInput] = useState<string>("");
	
	const handleSend = async () => {
		if (!input.trim() || !caseId) return;
		const userText = input;
		setInput("");
		onNewMessage({role: "user", content: userText, time: "..."});
		
		const aiRes = (await ApiService.sendChatMessage(caseId, userText)) as {
			text: string;
			time: string;
			coreInformations?: string[];
		};
		
		onNewMessage({
			role: "assistant",
			content: aiRes.text,
			time: aiRes.time,
			coreInformations: aiRes.coreInformations,
		});
	};
	
	const handlePlayVoice = async (text: string) => {
		try {
			const audio = new Audio(`${API_BASE}/tts?text=${encodeURIComponent(text)}`);
			audio.play().catch((e) => console.error("Playback failed", e));
		} catch (e) {
			console.error("Sprachausgabe fehlgeschlagen", e);
		}
	};
	
	return (
			<>
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{messages.map((m, i) => (
							<div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
								<div
										className={`max-w-[80%] p-4 rounded-2xl ${
												m.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-800 text-gray-100 border border-zinc-700"
										}`}
								>
									<div className="flex justify-between items-center mb-1 gap-4">
										<div className="flex items-center gap-2">
											<span className="text-[10px] uppercase font-bold opacity-50">{m.role}</span>
											{m.role === "assistant" && (
													<button
															onClick={() => handlePlayVoice(m.content)}
															className="p-1 rounded-md hover:bg-white/10 transition-colors group"
															title="Nachricht vorlesen"
													>
														<svg xmlns="http://www.w3.org/2000/svg"
																 className="h-3 w-3 opacity-40 group-hover:opacity-100" fill="none" viewBox="0 0 24 24"
																 stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
																		d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
														</svg>
													</button>
											)}
										</div>
										
										<div className="flex items-center gap-2">
											<span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded-full">{m.time}</span>
											{m.coreInformations && m.coreInformations.length > 0 && (
													<span
															className="text-[10px] font-semibold bg-black/30 text-white px-2 py-0.5 rounded-full">{m.coreInformations.length}</span>
											)}
										</div>
									</div>
									
									<p className="text-sm leading-relaxed">{m.content}</p>
								</div>
							</div>
					))}
				</div>
				
				<div className="p-4 bg-zinc-900 border-t border-zinc-800">
					<div className="max-w-3xl mx-auto flex gap-2">
						<input
								className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Was tust du als nächstes, Detective?"
								value={input}
								onInput={(e) => setInput((e.currentTarget as HTMLInputElement).value)}
								onKeyDown={(e) => e.key === "Enter" && handleSend()}
						/>
						<button onClick={handleSend} className="bg-blue-600 hover:bg-blue-500 p-3 rounded-xl transition-colors">
							➔
						</button>
					</div>
				</div>
			</>
	);
}
