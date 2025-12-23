import { useCallback, useRef, useEffect } from 'react';

// Static audio URLs (placeholder - can be replaced with real audio files)
const SOUND_URLS = {
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  reveal: '/sounds/reveal.mp3',
};

interface UseBattleSoundsOptions {
  muted?: boolean;
}

interface SoundState {
  hasPlayedVictory: boolean;
  hasPlayedDefeat: boolean;
  hasPlayedReveal: boolean;
}

// Session-based sound state to prevent replays
const SOUND_STATE_KEY = 'battle-sound-state';

function getSoundState(battleId: string): SoundState {
  try {
    const stored = sessionStorage.getItem(`${SOUND_STATE_KEY}-${battleId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {
    hasPlayedVictory: false,
    hasPlayedDefeat: false,
    hasPlayedReveal: false,
  };
}

function updateSoundState(battleId: string, update: Partial<SoundState>) {
  const current = getSoundState(battleId);
  const newState = { ...current, ...update };
  sessionStorage.setItem(`${SOUND_STATE_KEY}-${battleId}`, JSON.stringify(newState));
}

export function useBattleSounds(battleId: string, options: UseBattleSoundsOptions = {}) {
  const { muted = false } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = useCallback((soundType: keyof typeof SOUND_URLS) => {
    if (muted) return;

    const state = getSoundState(battleId);
    const stateKey = `hasPlayed${soundType.charAt(0).toUpperCase() + soundType.slice(1)}` as keyof SoundState;
    
    // Check if already played
    if (state[stateKey]) {
      console.log(`Sound ${soundType} already played for battle ${battleId}`);
      return;
    }

    try {
      // Create and play audio
      const audio = new Audio(SOUND_URLS[soundType]);
      audio.volume = 0.5;
      audioRef.current = audio;
      
      audio.play().catch(err => {
        // Audio may fail to play if user hasn't interacted with page yet
        console.log('Audio playback failed:', err);
      });

      // Mark as played
      updateSoundState(battleId, { [stateKey]: true });
    } catch (err) {
      console.error('Failed to create audio:', err);
    }
  }, [battleId, muted]);

  const playVictory = useCallback(() => playSound('victory'), [playSound]);
  const playDefeat = useCallback(() => playSound('defeat'), [playSound]);
  const playReveal = useCallback(() => playSound('reveal'), [playSound]);

  const resetSounds = useCallback(() => {
    sessionStorage.removeItem(`${SOUND_STATE_KEY}-${battleId}`);
  }, [battleId]);

  return {
    playVictory,
    playDefeat,
    playReveal,
    resetSounds,
  };
}
