
const SOUNDS = {
  startup: "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3",
  launch: "https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3",
  notify: "https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3",
  alert: "https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3",
  shutdown: "https://assets.mixkit.co/sfx/preview/mixkit-low-power-notification-sound-1145.mp3"
};

export const playSound = (type: keyof typeof SOUNDS) => {
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.4;
    audio.play().catch(e => console.warn("Audio playback blocked:", e));
  } catch (err) {
    console.error("Sound service error:", err);
  }
};
