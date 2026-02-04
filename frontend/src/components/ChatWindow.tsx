import {API_BASE, ApiService} from "../services/api";
import {useState, useRef} from "preact/hooks";
import TypewriterPop from "./TypewriterPop";
import {soundManager} from "../utils/SoundManager.ts";

type Message = {
	role: "user" | "assistant" | "system" | string;
	content: string;
	time: string;
	coreInformations?: string[];
	isNew?: boolean;
};

type ChatWindowProps = {
	caseId?: string;
	messages?: Message[];
	onNewMessage: (m: Message) => void;
};

export default function ChatWindow({caseId, messages = [], onNewMessage}: ChatWindowProps) {
	const [input, setInput] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	
	const handleSend = async () => {
		if (!input.trim() || !caseId || loading) return;
		const userText = input;
		setInput("");
		onNewMessage({ role: "user", content: userText, time: "..." });
		
		setLoading(true);
		try {
			const aiRes = (await ApiService.sendChatMessage(caseId, userText)) as any;
			
			onNewMessage({
				role: "assistant",
				content: aiRes.text,
				time: aiRes.time,
				coreInformations: aiRes.coreInformations,
				isNew: true,
			});
		} catch (e) {
			console.error("Fehler beim Senden", e);
			onNewMessage({
				role: "assistant",
				content: "Fehler beim Abruf der Antwort.",
				time: new Date().toLocaleTimeString(),
			});
		} finally {
			setLoading(false);
		}
	};
	
	const clickSounds = [
		"/sounds/typewriter1.mp3",
		"/sounds/typewriter2.mp3",
		"/sounds/typewriter3.mp3",
		"/sounds/typewriter4.mp3",
		"/sounds/typewriter5.mp3",
		"/sounds/typewriter6.mp3",
	];
	soundManager.preload(clickSounds);
	
	const lastClickTime = useRef(0);
	
	const playRandomClick = () => {
		const now = Date.now();
		if (now - lastClickTime.current < 30) return;
		
		const soundPath = clickSounds[Math.floor(Math.random() * clickSounds.length)];
		
		soundManager.playFastSfx(soundPath);
		lastClickTime.current = now;
	};
	
	const handlePlayVoice = async (text: string) => {
		try {
			await soundManager.playVoiceWithIntro(text, API_BASE);
		} catch (e) {
			console.error("Sprachausgabe fehlgeschlagen", e);
		}
	};
	
	return (
			<>
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{messages.map((m, i) => {
						const shouldAnimate = m.role === "assistant" && (m as any).isNew;
						
						return (
								<div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
									<div
											className={`max-w-[80%] p-4 rounded-2xl ${
													m.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-800 text-gray-100 border border-zinc-700"
											}`}
									>
										<div className="flex justify-between items-center mb-2 gap-4">
											<div className="flex items-center gap-2">
												<span className="text-[10px] uppercase font-bold opacity-50">{m.role}</span>
												{m.role === "assistant" && (
														<button
																onClick={() => handlePlayVoice(m.content)}
																className="p-1 rounded-md hover:bg-white/10 transition-colors group"
																title="Nachricht vorlesen"
														>
															<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-40 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
															</svg>
														</button>
												)}
											</div>
											
											{m.role === "assistant" && (
													<div className="flex items-center gap-2">
														<span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded-full">{m.time}</span>
														{m.coreInformations && m.coreInformations.length > 0 && (
																<span className="text-[10px] font-semibold bg-black/30 text-white px-2 py-0.5 rounded-full">
                    {m.coreInformations.length}
                  </span>
														)}
													</div>
											)}
										</div>
										
										<div className="text-sm leading-relaxed">
											{shouldAnimate ? (
													<TypewriterPop
															text={m.content}
															totalMs={4000}
															jitterFactor={0.4}
															start={true}
															onCharReveal={() => playRandomClick()}
															onComplete={() => {
																delete (m as any).isNew;
															}}
													/>
											) : (
													<p>{m.content}</p>
											)}
										</div>
									</div>
								</div>
						)
					})}
				</div>
				
				<div className="p-4 bg-zinc-900 border-t border-zinc-800">
					<div className="max-w-3xl mx-auto flex items-center gap-2">
						<input
								className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
								placeholder="Was tust du als nächstes, Detective?"
								value={input}
								disabled={loading}
								onInput={(e) => setInput((e.currentTarget as HTMLInputElement).value)}
								onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
						/>
						
						{/* Loading indicator */}
						<div className="flex items-center gap-2">
							{loading && (
									<div className="flex items-center gap-2 pr-1">
          <span className="animate-spin h-5 w-5 border-4 border-white/30 border-t-white rounded-full"
								aria-hidden="true"></span>
										<span className="text-xs text-white/70">Senden…</span>
									</div>
							)}
							
							<button
									onClick={handleSend}
									disabled={loading}
									className={`bg-blue-600 hover:bg-blue-500 p-3 rounded-xl transition-colors ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
							>
								➔
							</button>
						</div>
					</div>
				</div>
			</>
	);
}
