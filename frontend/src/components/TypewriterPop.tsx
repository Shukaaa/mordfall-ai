import { useEffect, useMemo, useRef, useState } from "preact/hooks";

type Props = {
	text: string;
	totalMs?: number;
	start?: boolean;
	jitterFactor?: number;
	className?: string;
	onCharReveal?: (index: number, char: string) => void;
	onComplete?: () => void;
};

export default function TypewriterPop({
																				text,
																				totalMs = 4000,
																				start = true,
																				jitterFactor = 0.4,
																				className = "",
																				onCharReveal,
																				onComplete,
																			}: Props) {
	const chars = useMemo(() => Array.from(text), [text]);
	const [visible, setVisible] = useState<boolean[]>(() => chars.map(() => false));
	const timersRef = useRef<number[]>([]);
	
	useEffect(() => {
		setVisible(chars.map(() => false));
		timersRef.current.forEach((t) => clearTimeout(t));
		timersRef.current = [];
		if (!start || chars.length === 0) return;
		
		const N = chars.length;
		const chunk = totalMs / Math.max(1, N);
		const times: number[] = [];
		
		for (let i = 0; i < N; i++) {
			const base = (i / Math.max(1, N)) * totalMs;
			const jitter = (Math.random() * 2 - 1) * chunk * jitterFactor;
			let t = Math.round(base + jitter);
			if (t < 0) t = 0;
			if (t > totalMs) t = totalMs;
			times.push(t);
		}
		if (N > 0) times[N - 1] = totalMs;
		
		for (let i = 0; i < N; i++) {
			const timer = window.setTimeout(() => {
				setVisible((prev) => {
					const copy = prev.slice();
					copy[i] = true;
					return copy;
				});
				onCharReveal?.(i, chars[i]);
			}, times[i]);
			timersRef.current.push(timer);
		}
		
		const finishTimer = window.setTimeout(() => {
			onComplete?.();
		}, totalMs);
		timersRef.current.push(finishTimer);
		
		return () => {
			timersRef.current.forEach((t) => clearTimeout(t));
			timersRef.current = [];
		};
	}, [text, start, totalMs, jitterFactor]);
	
	return (
			<>
				<style>
					{`.typewriter-pop { display:inline; }
          .typewriter-pop .char { opacity:0; display:inline-block; white-space:pre; }
          .typewriter-pop .char.visible { opacity:1; }
          /* kleine optionale Skalierung/Pop */
          .typewriter-pop .char.pop { transform-origin:50% 50%; }
        `}
				</style>
				
				<span className={`typewriter-pop ${className}`}>
        {chars.map((ch, i) => (
						<span
								key={i}
								className={`char pop ${visible[i] ? "visible" : ""}`}
						>
            {ch === " " ? "\u00A0" : ch}
          </span>
				))}
      </span>
			</>
	);
}
