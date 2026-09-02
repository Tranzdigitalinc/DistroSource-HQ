// Minimal dependency-free WAV generator for real, playable royalty-free sample audio.
import fs from "node:fs"
import path from "node:path"

export function writeWav(filePath, { durationSec = 3, sampleRate = 44100, freqs = [440] }) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const numSamples = Math.floor(durationSec * sampleRate)
  const bytesPerSample = 2
  const blockAlign = bytesPerSample
  const dataSize = numSamples * blockAlign

  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write("RIFF", 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write("WAVE", 8)
  buffer.write("fmt ", 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20) // PCM
  buffer.writeUInt16LE(1, 22) // mono
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * blockAlign, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write("data", 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    let sample = 0
    for (const f of freqs) sample += Math.sin(2 * Math.PI * f * t)
    sample /= freqs.length
    // fade in/out envelope to avoid clicks
    const fade = Math.min(1, i / (sampleRate * 0.05), (numSamples - i) / (sampleRate * 0.05))
    const value = Math.max(-1, Math.min(1, sample * 0.3 * fade))
    buffer.writeInt16LE(Math.floor(value * 32767), 44 + i * 2)
  }

  fs.writeFileSync(filePath, buffer)
  return filePath
}
