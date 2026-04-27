"""
TROGDOR BUTTON - Always-on-top desktop button that screams TROGDOR!
Uses Web Audio-style formant synthesis via PyAudio/sounddevice.
Double-click this .pyw file to run (no console window).
"""

import tkinter as tk
import threading
import math
import struct
import wave
import os
import tempfile
import random

# Try to use sounddevice, fall back to winsound+wave
try:
    import sounddevice as sd
    HAS_SD = True
except ImportError:
    HAS_SD = False

SAMPLE_RATE = 44100

def generate_trogdor_scream():
    """Generate a heavy metal TROGDOR! scream using formant synthesis."""
    duration = 2.0
    n_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * n_samples

    # --- Vocal cord simulation: sawtooth with pitch envelope ---
    def saw(phase):
        return 2.0 * (phase - math.floor(phase + 0.5))

    def noise():
        return random.uniform(-1, 1)

    # Pitch envelope: E4(329.63) -> hold -> G4(392) -> B4(493.88) -> hold
    def get_pitch(t):
        if t < 0.12:      # "TR" consonant
            return 329.63
        elif t < 0.45:     # "O" vowel
            return 329.63 + (392 - 329.63) * ((t - 0.12) / 0.33) * 0.3
        elif t < 0.6:      # "G-D" stop
            return 340
        elif t < 1.0:      # "-OR" rising
            return 340 + (493.88 - 340) * ((t - 0.6) / 0.4)
        else:              # held "RRRR"
            return 493.88

    # Formant frequencies (bandpass centers) for vowel shapes
    def get_formants(t):
        if t < 0.08:       # "T" burst
            return (400, 1800, 3200)
        elif t < 0.15:     # "R"
            return (500, 1400, 2800)
        elif t < 0.45:     # "AH/OH"
            return (700, 1100, 2600)
        elif t < 0.6:      # "G-D" closure
            return (250, 900, 2200)
        elif t < 1.8:      # "OR!" held
            return (500, 950, 2500)
        else:
            return (500, 950, 2500)

    # Volume envelope - crescendo scream
    def get_volume(t):
        if t < 0.03:
            return t / 0.03 * 0.5        # attack
        elif t < 0.15:
            return 0.5 + (t - 0.03) / 0.12 * 0.3  # "TR"
        elif t < 0.45:
            return 0.8                     # "O"
        elif t < 0.55:
            return 0.5                     # dip for "G-D"
        elif t < 0.9:
            return 0.5 + (t - 0.55) / 0.35 * 0.5  # build to full
        elif t < 1.5:
            return 1.0                     # FULL POWER
        else:
            return max(0, 1.0 - (t - 1.5) / 0.5)  # fade

    # Simple bandpass filter (2-pole IIR)
    class BandPass:
        def __init__(self, freq, q=8):
            self.freq = freq
            self.q = q
            self.y1 = 0
            self.y2 = 0
            self._update(freq)

        def _update(self, freq):
            w0 = 2 * math.pi * freq / SAMPLE_RATE
            alpha = math.sin(w0) / (2 * self.q)
            self.b0 = alpha
            self.b1 = 0
            self.b2 = -alpha
            self.a0 = 1 + alpha
            self.a1 = -2 * math.cos(w0)
            self.a2 = 1 - alpha
            self.x1 = 0
            self.x2 = 0

        def process(self, x):
            y = (self.b0/self.a0)*x + (self.b1/self.a0)*self.x1 + (self.b2/self.a0)*self.x2 \
                - (self.a1/self.a0)*self.y1 - (self.a2/self.a0)*self.y2
            self.x2 = self.x1
            self.x1 = x
            self.y2 = self.y1
            self.y1 = y
            return y

        def set_freq(self, freq):
            if abs(freq - self.freq) > 5:
                self.freq = freq
                self._update(freq)

    # Create formant filter banks
    f1a, f1b, f1c = BandPass(700, 8), BandPass(1100, 8), BandPass(2600, 8)

    # Distortion
    def distort(x, amount=3.0):
        return math.tanh(x * amount)

    phase = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        pitch = get_pitch(t)
        vol = get_volume(t)
        formants = get_formants(t)

        # Update formant filters
        f1a.set_freq(formants[0])
        f1b.set_freq(formants[1])
        f1c.set_freq(formants[2])

        # Source: sawtooth + noise
        phase += pitch / SAMPLE_RATE
        source = saw(phase) * 0.7 + noise() * 0.2

        # "T" consonant burst
        if t < 0.04:
            source = noise() * 1.5

        # Apply formant filters
        out = f1a.process(source) * 1.0 + f1b.process(source) * 0.8 + f1c.process(source) * 0.4

        # Distortion for metal quality
        out = distort(out, 2.5)

        samples[i] = out * vol * 0.7

    # Add a second voice (octave + fifth harmonics for thickness)
    phase2 = 0.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        pitch = get_pitch(t)
        vol = get_volume(t)
        phase2 += (pitch * 1.01) / SAMPLE_RATE  # slightly detuned
        samples[i] += saw(phase2) * vol * 0.15  # subtle thickener

    # Add sub-bass thump at the start
    for i in range(int(SAMPLE_RATE * 0.3)):
        t = i / SAMPLE_RATE
        sub_env = max(0, 1.0 - t / 0.3)
        samples[i] += math.sin(2 * math.pi * 82.41 * t) * sub_env * 0.3

    # Normalize
    peak = max(abs(s) for s in samples)
    if peak > 0:
        scale = 0.85 / peak
        samples = [s * scale for s in samples]

    return samples


def play_scream():
    """Play the TROGDOR scream."""
    samples = generate_trogdor_scream()

    if HAS_SD:
        import numpy as np
        audio = np.array(samples, dtype=np.float32)
        sd.play(audio, SAMPLE_RATE)
    else:
        # Fallback: write to temp WAV and play with winsound
        import winsound
        tmp = os.path.join(tempfile.gettempdir(), "trogdor_scream.wav")
        with wave.open(tmp, 'w') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            for s in samples:
                val = int(max(-1, min(1, s)) * 32767)
                wf.writeframes(struct.pack('<h', val))
        winsound.PlaySound(tmp, winsound.SND_FILENAME | winsound.SND_ASYNC)


class TrogdorButton:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("TROGDOR!")
        self.root.attributes('-topmost', True)
        self.root.resizable(False, False)
        self.root.configure(bg='#1a0a00')

        # Remove title bar for compact look, keep draggable
        self.root.overrideredirect(True)

        # Window size
        self.w, self.h = 200, 80
        self.root.geometry(f'{self.w}x{self.h}')

        # Center on screen
        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        self.root.geometry(f'+{sw - self.w - 20}+{sh - self.h - 60}')

        # Make draggable
        self._drag_x = 0
        self._drag_y = 0

        # Main frame with border
        frame = tk.Frame(self.root, bg='#ff4400', padx=2, pady=2)
        frame.pack(fill='both', expand=True)

        inner = tk.Frame(frame, bg='#1a0a00')
        inner.pack(fill='both', expand=True)

        # Dragon emoji + button
        self.btn = tk.Button(
            inner,
            text="TROGDOR!",
            font=('Impact', 22, 'bold'),
            fg='#ff6600',
            bg='#2a0a00',
            activeforeground='#ffff00',
            activebackground='#441100',
            border=0,
            cursor='hand2',
            command=self.on_click
        )
        self.btn.pack(fill='both', expand=True, padx=4, pady=4)

        # Close on right-click
        self.btn.bind('<Button-3>', lambda e: self.root.destroy())

        # Drag bindings
        self.btn.bind('<Button-1>', self._start_drag, add='+')
        self.btn.bind('<B1-Motion>', self._do_drag)

        # Pulsing fire effect
        self.pulse_idx = 0
        self._pulse()

        # Pre-generate one scream for faster first play
        self._cached_scream = None
        threading.Thread(target=self._precache, daemon=True).start()

    def _precache(self):
        self._cached_scream = generate_trogdor_scream()

    def _start_drag(self, event):
        self._drag_x = event.x
        self._drag_y = event.y

    def _do_drag(self, event):
        x = self.root.winfo_x() + event.x - self._drag_x
        y = self.root.winfo_y() + event.y - self._drag_y
        self.root.geometry(f'+{x}+{y}')

    def _pulse(self):
        self.pulse_idx += 1
        # Cycle through fire colors
        intensity = int(80 + 30 * math.sin(self.pulse_idx * 0.15))
        r = min(255, intensity + 150)
        g = min(255, max(0, intensity - 30))
        color = f'#{r:02x}{g:02x}00'
        self.btn.configure(fg=color)

        border_r = min(255, 200 + int(55 * math.sin(self.pulse_idx * 0.1)))
        border_g = min(120, int(60 + 60 * math.sin(self.pulse_idx * 0.1)))
        border_color = f'#{border_r:02x}{border_g:02x}00'
        self.root.children['!frame'].configure(bg=border_color)

        self.root.after(50, self._pulse)

    def on_click(self):
        # Flash the button
        self.btn.configure(fg='#ffffff', bg='#ff4400')
        self.root.after(150, lambda: self.btn.configure(fg='#ff6600', bg='#2a0a00'))

        # Play scream in thread
        threading.Thread(target=self._play, daemon=True).start()

    def _play(self):
        if self._cached_scream:
            samples = self._cached_scream
        else:
            samples = generate_trogdor_scream()

        if HAS_SD:
            try:
                import numpy as np
                audio = np.array(samples, dtype=np.float32)
                sd.play(audio, SAMPLE_RATE)
            except:
                self._play_fallback(samples)
        else:
            self._play_fallback(samples)

        # Pre-generate next scream with slight variation
        self._cached_scream = generate_trogdor_scream()

    def _play_fallback(self, samples):
        import winsound
        tmp = os.path.join(tempfile.gettempdir(), "trogdor_scream.wav")
        with wave.open(tmp, 'w') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            for s in samples:
                val = int(max(-1, min(1, s)) * 32767)
                wf.writeframes(struct.pack('<h', val))
        winsound.PlaySound(tmp, winsound.SND_FILENAME | winsound.SND_ASYNC)

    def run(self):
        self.root.mainloop()


if __name__ == '__main__':
    app = TrogdorButton()
    app.run()
