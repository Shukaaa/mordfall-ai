import {CustomStorage} from "./CustomStorage.ts";

type SoundGroup = 'music' | 'ambient' | 'sfx' | 'voice';

interface PlayOptions {
	loop?: boolean;
	fadeInDuration?: number;
	layerable?: boolean;
}

class SoundManager {
	private cache: Record<string, HTMLAudioElement> = {};
	
	private groups: Record<SoundGroup, { volume: number; instances: HTMLAudioElement[] }> = {
		music:   { volume: CustomStorage.get('vol_music', 0.5),   instances: [] },
		ambient: { volume: CustomStorage.get('vol_ambient', 0.3), instances: [] },
		sfx:     { volume: CustomStorage.get('vol_sfx', 0.7),     instances: [] },
		voice:   { volume: CustomStorage.get('vol_voice', 1.0),   instances: [] },
	};
	
	preload(srcs: string[]) {
		srcs.forEach(src => {
			if (!this.cache[src]) {
				const audio = new Audio(src);
				audio.preload = "auto";
				audio.load();
				this.cache[src] = audio;
			}
		});
	}
	
	playFastSfx(src: string) {
		const cached = this.cache[src];
		if (cached) {
			const instance = cached.cloneNode() as HTMLAudioElement;
			instance.volume = this.groups['sfx'].volume;
			instance.play();
		} else {
			this.play(src, 'sfx');
		}
	}
	
	private fadeAudio(audio: HTMLAudioElement, targetVolume: number, duration: number, callback?: () => void) {
		const startVolume = audio.volume;
		const diff = targetVolume - startVolume;
		const steps = 30;
		const stepDuration = duration / steps;
		let currentStep = 0;
		
		const interval = setInterval(() => {
			currentStep++;
			const nextVolume = startVolume + (diff * (currentStep / steps));
			audio.volume = Math.max(0, Math.min(1, nextVolume));
			
			if (currentStep >= steps) {
				clearInterval(interval);
				audio.volume = targetVolume;
				if (callback) callback();
			}
		}, stepDuration);
	}
	
	play(src: string, group: SoundGroup, options: PlayOptions = {}) {
		if (options.layerable === false) {
			this.stopGroup(group);
		}
		
		const audio = new Audio(src);
		audio.loop = options.loop || false;
		
		const currentVolume = this.groups[group].volume;
		audio.volume = options.fadeInDuration ? 0 : currentVolume;
		
		this.groups[group].instances.push(audio);
		audio.play().catch(e => console.warn("Autoplay blockiert", e));
		
		if (options.fadeInDuration) {
			this.fadeAudio(audio, currentVolume, options.fadeInDuration);
		}
		
		audio.onended = () => {
			this.groups[group].instances = this.groups[group].instances.filter(i => i !== audio);
		};
		
		return audio;
	}
	
	fadeOutGroup(group: SoundGroup, duration: number) {
		this.groups[group].instances.forEach(audio => {
			this.fadeAudio(audio, 0, duration, () => {
				audio.pause();
				audio.src = "";
				this.groups[group].instances = this.groups[group].instances.filter(i => i !== audio);
			});
		});
	}
	
	stopGroup(group: SoundGroup) {
		this.groups[group].instances.forEach(audio => {
			audio.pause();
			audio.src = "";
			audio.load();
		});
		this.groups[group].instances = [];
	}
	
	async playVoiceWithIntro(text: string, apiBase: string) {
		this.stopGroup('voice');
		this.play('/sounds/recorder.wav', 'sfx', { layerable: true });
		const url = `${apiBase}/tts?text=${encodeURIComponent(text)}`;
		return this.play(url, 'voice', { layerable: false });
	}
	
	setGroupVolume(group: SoundGroup, volume: number) {
		this.groups[group].volume = volume;
		CustomStorage.set(`vol_${group}`, volume);
		this.groups[group].instances.forEach(a => {
			a.volume = volume;
		});
	}
	
	getGroupVolume(group: SoundGroup): number {
		return this.groups[group].volume;
	}
}

export const soundManager = new SoundManager();