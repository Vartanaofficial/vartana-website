export type Theme = "calm" | "nature" | "jazz" | "sax";
export function soundscape(context: AudioContext, output: GainNode, theme: Theme) {
  const bus = context.createGain(); bus.connect(output);
  const delay = context.createDelay(2), feedback = context.createGain();
  delay.delayTime.value = .42; feedback.gain.value = .24;
  bus.connect(delay); delay.connect(feedback); feedback.connect(delay); feedback.connect(output);
  const sources = new Set<AudioScheduledSourceNode>();
  function note(midi: number, at: number, duration: number, amplitude: number, reed = false) {
    const voice = context.createOscillator(), envelope = context.createGain(), filter = context.createBiquadFilter();
    voice.type = reed ? "triangle" : "sine";
    voice.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    filter.type = "lowpass"; filter.frequency.value = reed ? 1450 : 2300;
    envelope.gain.setValueAtTime(.0001, at);
    envelope.gain.exponentialRampToValueAtTime(amplitude, at + (theme === "calm" ? 1.7 : .08));
    envelope.gain.exponentialRampToValueAtTime(.0001, at + duration);
    voice.connect(filter); filter.connect(envelope); envelope.connect(bus);
    sources.add(voice);
    voice.onended = () => { sources.delete(voice); voice.disconnect(); filter.disconnect(); envelope.disconnect(); };
    voice.start(at); voice.stop(at + duration + .02);
  }
  if (theme === "nature") {
    const buffer = context.createBuffer(1, context.sampleRate * 8, context.sampleRate), samples = buffer.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < samples.length; i++) {
      previous = (previous + (Math.random() * 2 - 1) * .025) / 1.025;
      samples[i] = previous * 2;
    }
    const water = context.createBufferSource(), filter = context.createBiquadFilter();
    water.buffer = buffer; water.loop = true; filter.type = "lowpass"; filter.frequency.value = 900;
    water.connect(filter); filter.connect(bus); water.start(); sources.add(water);
  }
  const chords = theme === "jazz" || theme === "sax"
    ? [[50, 57, 60, 64, 69], [55, 59, 62, 65, 69], [48, 55, 59, 62, 64], [45, 52, 55, 59, 64]]
    : [[48, 55, 62, 67], [45, 52, 60, 64], [41, 48, 60, 67], [43, 50, 62, 69]];
  const period = theme === "calm" || theme === "nature" ? 8 : 6;
  let bar = 0;
  const schedule = () => {
    if (context.state !== "running") return;
    const now = context.currentTime + .04, chord = chords[bar++ % chords.length];
    if (theme === "nature") return;
    chord.slice(1).forEach((pitch, index) => note(pitch, now + index * .09, period + 1, theme === "calm" ? .055 : .045));
    if (theme === "calm") {
      note(chord[2] + 12, now + 2, 5, .025);
    } else {
      for (let beat = 0; beat < 4; beat++) note(chord[0] - 12 + (beat % 2 ? 7 : 0), now + beat * 1.5, 1.35, .15);
      if (theme === "sax") {
        [chord[2] + 12, chord[3] + 12, chord[4] + 12, chord[2] + 12].forEach((pitch, index) => note(pitch, now + index * 1.3 + .4, 1.2, .07, true));
      } else {
        note(chord[4] + 12, now + 2.2, 2, .035);
      }
    }
  };
  schedule(); const timer = setInterval(schedule, period * 1000);
  return () => {
    clearInterval(timer);
    sources.forEach(source => { try { source.stop(); } catch {} });
    bus.disconnect(); delay.disconnect(); feedback.disconnect();
  };
}

