let ctx: AudioContext | null = null

export function soundEnabled() {
  return localStorage.getItem('sound') !== 'off'
}

export function setSoundEnabled(on: boolean) {
  localStorage.setItem('sound', on ? 'on' : 'off')
}

export function playChime(level: string) {
  if (!soundEnabled()) return
  try {
    ctx ??= new AudioContext()
    const notes = level === 'danger' || level === 'warning' ? [660, 520] : [740, 990]
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = ctx!.currentTime + i * 0.16
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3)
      osc.connect(gain).connect(ctx!.destination)
      osc.start(start)
      osc.stop(start + 0.32)
    })
  } catch {
    /* audio not available */
  }
}
