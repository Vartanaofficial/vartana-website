"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "calm" | "nature" | "jazz" | "sax";
const themes: { id: Theme; name: string; description: string }[] = [
  { id: "calm", name: "Calm Spa", description: "Nada lembut · pelan & lapang" },
  { id: "nature", name: "Alam", description: "Desir air · suasana hutan" },
  { id: "jazz", name: "Slow Jazz", description: "Akord hangat · bass santai" },
  { id: "sax", name: "Saxo Lounge", description: "Melodi tiup · suasana senja" },
];

// Original synthesized soundscapes: no external streams or automatic playback.
function soundscape(context: AudioContext, output: GainNode, theme: Theme) {
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

export default function AmbientMusic() {
  const [theme, setTheme] = useState<Theme>("calm"), [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false), [busy, setBusy] = useState(false);
  const [volume, setVolume] = useState(25), [error, setError] = useState("");
  const audio = useRef<AudioContext | null>(null), master = useRef<GainNode | null>(null);
  const stop = useRef<(() => void) | null>(null), enabled = useRef(false), root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); root.current?.querySelector<HTMLButtonElement>(".ambient-trigger")?.focus(); } };
    const visibility = () => {
      if (!audio.current || !enabled.current) return;
      if (document.hidden) void audio.current.suspend();
      else void audio.current.resume().catch(() => { enabled.current = false; setPlaying(false); });
    };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape);
      document.removeEventListener("visibilitychange", visibility); stop.current?.(); void audio.current?.close();
    };
  }, []);
  async function play(next: Theme) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (!audio.current) {
        const context = new AudioContext(), gain = context.createGain();
        gain.gain.value = volume / 150; gain.connect(context.destination);
        audio.current = context; master.current = gain;
      }
      await audio.current.resume();
      stop.current?.(); stop.current = soundscape(audio.current, master.current!, next);
      enabled.current = true; setPlaying(true); setTheme(next);
    } catch { enabled.current = false; setPlaying(false); setError("Audio belum bisa diputar. Coba klik putar lagi."); }
    finally { setBusy(false); }
  }
  async function toggle() {
    if (busy) return;
    if (!playing) { await play(theme); return; }
    enabled.current = false; stop.current?.(); stop.current = null; setPlaying(false);
    await audio.current?.suspend();
  }
  const selected = themes.find(item => item.id === theme)!;
  return <div ref={root} className={`ambient-player ${playing ? "is-playing" : ""}`}>
    {open && <section id="ambient-options" className="ambient-panel" aria-label="Pilihan suasana musik">
      <div className="ambient-panel-heading"><span>Ruang tenangmu</span><button type="button" aria-label="Tutup pilihan musik" onClick={() => setOpen(false)}>×</button></div>
      <p>Pilih suasana untuk menemani ritualmu.</p>
      <div className="ambient-themes">{themes.map(item => <button type="button" key={item.id} aria-pressed={theme === item.id} disabled={busy} onClick={() => void play(item.id)}><span>{item.name}<small>{item.description}</small></span><span aria-hidden="true">{theme === item.id ? "●" : "○"}</span></button>)}</div>
      <div className="ambient-controls"><button type="button" disabled={busy} onClick={() => void toggle()}>{playing ? "Jeda musik" : "Putar musik"}</button><span>{playing ? "ON" : "OFF"}</span></div>
      <label className="ambient-panel-volume">Volume<input aria-label="Volume musik" type="range" min="0" max="100" value={volume} onChange={event => { const value = Number(event.target.value); setVolume(value); if (audio.current && master.current) master.current.gain.setTargetAtTime(value / 150, audio.current.currentTime, .15); }}/></label>
      <p className="ambient-footnote">Suasana instrumental sintetis · tanpa vokal</p>
      {error && <p role="status">{error}</p>}
    </section>}
    <button className="ambient-trigger" type="button" aria-label="Pilih tema musik" aria-expanded={open} aria-controls="ambient-options" onClick={() => setOpen(value => !value)}>
      <span className="ambient-record" aria-hidden="true"><span>V</span></span><span>{selected.name}<small>{playing ? "ON · PILIH SUASANA" : "OFF · PILIH SUASANA"}</small></span>
    </button>
  </div>;
}
