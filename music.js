const audioContext = new AudioContext();

// Music setup
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
gainNode.gain.setValueAtTime(0, audioContext.currentTime);

const melody = [
  261.63, 293.66, 329.63, 349.23,
  392.00, 440.00, 493.88, 523.25
];

let currentNote = 0;
const playNote = () => {
  oscillator.frequency.setValueAtTime(melody[currentNote], audioContext.currentTime);
  currentNote = (currentNote + 1) % melody.length;
};

setInterval(playNote, 200);
oscillator.start();

// Death sound setup
const createDeathSound = () => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.frequency.setValueAtTime(440, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.5);
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.5);
};

export const setMusic = (playing) => {
  gainNode.gain.setValueAtTime(playing ? 0.1 : 0, audioContext.currentTime);
};

export const playDeathSound = () => {
  createDeathSound();
};
