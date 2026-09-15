// Synthesised audio packs for catalogue batch 3. Every sound is generated
// here from oscillators, noise, filters, envelopes and a reverb — no
// samples, recordings or third-party audio. 44.1 kHz, 16-bit stereo WAV.
//
//   node scripts/catalog/batch3/audio/build_audio.mjs            # every pack
//   node scripts/catalog/batch3/audio/build_audio.mjs ui,arcade  # slugs containing these
//
// Output: .catalog-build/batch3/<slug>/files/<Pack>/...wav plus peaks.json
// (downsampled waveforms the cover renderer draws from).
import fs from "node:fs"
import path from "node:path"

const SR = 44100
const ROOT = path.resolve(import.meta.dirname, "../../../..")
const OUT = path.join(ROOT, ".catalog-build", "batch3")
const TAU = Math.PI * 2

/* ------------------------------------------------------------------ */
/* DSP                                                                  */
/* ------------------------------------------------------------------ */

function mulberry(seed) {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const N = (sec) => Math.max(1, Math.round(sec * SR))
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)
const fnOf = (f) => (typeof f === "function" ? f : () => f)

function blep(t, dt) {
  if (t < dt) {
    t /= dt
    return t + t - t * t - 1
  }
  if (t > 1 - dt) {
    t = (t - 1) / dt
    return t * t + t + t + 1
  }
  return 0
}

/** Band-limited oscillator; f is Hz or (sampleIndex) => Hz. */
function osc(n, f, type = "sine", { phase = 0, pw = 0.5 } = {}) {
  const out = new Float32Array(n)
  const hz = fnOf(f)
  let p = phase
  for (let i = 0; i < n; i++) {
    const dt = Math.min(0.45, Math.max(0, hz(i) / SR))
    let v
    if (type === "sine") v = Math.sin(TAU * p)
    else if (type === "tri") v = 1 - 4 * Math.abs(p - 0.5)
    else if (type === "saw") v = 2 * p - 1 - blep(p, dt)
    else v = (p < pw ? 1 : -1) + blep(p, dt) - blep((p + 1 - pw) % 1, dt)
    out[i] = v
    p += dt
    p -= Math.floor(p)
  }
  return out
}

/** Two-operator FM: carrier f, modulator f * ratio, index is a number or (i) => index. */
function fm(n, f, ratio, index, { phase = 0 } = {}) {
  const out = new Float32Array(n)
  const hz = fnOf(f)
  const idx = fnOf(index)
  let pc = phase, pm = 0
  for (let i = 0; i < n; i++) {
    const fc = hz(i)
    out[i] = Math.sin(TAU * pc + idx(i) * Math.sin(TAU * pm))
    pc += fc / SR
    pm += (fc * ratio) / SR
    pc -= Math.floor(pc)
    pm -= Math.floor(pm)
  }
  return out
}

function white(n, seed = 1) {
  const r = mulberry(seed)
  const o = new Float32Array(n)
  for (let i = 0; i < n; i++) o[i] = r() * 2 - 1
  return o
}

function pink(n, seed = 1) {
  const r = mulberry(seed)
  const o = new Float32Array(n)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < n; i++) {
    const w = r() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.969 * b2 + w * 0.153852
    b3 = 0.8665 * b3 + w * 0.3104856
    b4 = 0.55 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.016898
    o[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
  }
  return o
}

/** Piecewise envelope: points [[seconds, level], ...], linear, or exponential when curve > 0. */
function env(n, pts, curve = 0) {
  const o = new Float32Array(n)
  let k = 0
  for (let i = 0; i < n; i++) {
    const t = i / SR
    while (k < pts.length - 2 && t > pts[k + 1][0]) k++
    const [t0, v0] = pts[k]
    const [t1, v1] = pts[Math.min(k + 1, pts.length - 1)]
    let u = t1 > t0 ? Math.min(1, Math.max(0, (t - t0) / (t1 - t0))) : 1
    if (curve) u = 1 - Math.pow(1 - u, 1 + curve)
    o[i] = t > pts[pts.length - 1][0] ? pts[pts.length - 1][1] : v0 + (v1 - v0) * u
  }
  return o
}

/** Attack then exponential decay with time constant tau (seconds). */
function perc(n, attack, tau) {
  const o = new Float32Array(n)
  const a = Math.max(1, N(attack))
  for (let i = 0; i < n; i++) o[i] = i < a ? i / a : Math.exp(-(i - a) / (tau * SR))
  return o
}

function mul(a, b) {
  if (typeof b === "number") for (let i = 0; i < a.length; i++) a[i] *= b
  else for (let i = 0; i < a.length; i++) a[i] *= b[i] ?? 0
  return a
}

function mix(dst, src, gain = 1, at = 0) {
  const o = Math.round(at)
  for (let i = 0; i < src.length && i + o < dst.length; i++) if (i + o >= 0) dst[i + o] += src[i] * gain
  return dst
}

class Biquad {
  constructor(type, f, q = 0.707, gain = 0) {
    this.type = type
    this.q = q
    this.gain = gain
    this.x1 = this.x2 = this.y1 = this.y2 = 0
    this.set(f)
  }
  set(f) {
    const w0 = (TAU * Math.min(Math.max(f, 10), SR * 0.47)) / SR
    const cos = Math.cos(w0), alpha = Math.sin(w0) / (2 * this.q)
    let b0, b1, b2, a0, a1, a2
    if (this.type === "lp") [b0, b1, b2, a0, a1, a2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2, 1 + alpha, -2 * cos, 1 - alpha]
    else if (this.type === "hp") [b0, b1, b2, a0, a1, a2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2, 1 + alpha, -2 * cos, 1 - alpha]
    else if (this.type === "bp") [b0, b1, b2, a0, a1, a2] = [alpha, 0, -alpha, 1 + alpha, -2 * cos, 1 - alpha]
    else {
      const A = Math.pow(10, this.gain / 40)
      ;[b0, b1, b2, a0, a1, a2] = [1 + alpha * A, -2 * cos, 1 - alpha * A, 1 + alpha / A, -2 * cos, 1 - alpha / A]
    }
    this.b0 = b0 / a0
    this.b1 = b1 / a0
    this.b2 = b2 / a0
    this.a1 = a1 / a0
    this.a2 = a2 / a0
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2
    this.x2 = this.x1
    this.x1 = x
    this.y2 = this.y1
    this.y1 = y
    return y
  }
}

/** Filter in place; f is Hz or (i) => Hz (coefficients refreshed every 16 samples). */
function filt(buf, type, f, q = 0.707, gain = 0) {
  const hz = fnOf(f)
  const bq = new Biquad(type, hz(0), q, gain)
  for (let i = 0; i < buf.length; i++) {
    if (typeof f === "function" && (i & 15) === 0) bq.set(hz(i))
    buf[i] = bq.run(buf[i])
  }
  return buf
}

const drive = (buf, amount) => {
  const k = Math.tanh(amount)
  for (let i = 0; i < buf.length; i++) buf[i] = Math.tanh(buf[i] * amount) / k
  return buf
}

function crush(buf, bits = 10, hold = 2) {
  const q = Math.pow(2, bits - 1)
  let h = 0
  for (let i = 0; i < buf.length; i++) {
    if (i % hold === 0) h = Math.round(buf[i] * q) / q
    buf[i] = h
  }
  return buf
}

/** Stereo Freeverb-style reverb. Returns new [L, R]; pad inputs for the tail. */
function reverb(L, R, { room = 0.84, damp = 0.28, wet = 0.3, dry = 1, width = 1 } = {}) {
  const sc = SR / 44100
  const comb = (size) => {
    const b = new Float32Array(Math.round(size * sc))
    let i = 0, store = 0
    return (x) => {
      const y = b[i]
      store = y * (1 - damp) + store * damp
      b[i] = x + store * room
      i = (i + 1) % b.length
      return y
    }
  }
  const ap = (size) => {
    const b = new Float32Array(Math.round(size * sc))
    let i = 0
    return (x) => {
      const bo = b[i]
      b[i] = x + bo * 0.5
      i = (i + 1) % b.length
      return bo - x
    }
  }
  const CL = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617]
  const cl = CL.map(comb), cr = CL.map((s) => comb(s + 23))
  const al = [556, 441, 341, 225].map(ap), ar = [579, 464, 364, 248].map(ap)
  const oL = new Float32Array(L.length), oR = new Float32Array(R.length)
  const w1 = wet * (width / 2 + 0.5), w2 = wet * ((1 - width) / 2)
  for (let i = 0; i < L.length; i++) {
    const x = (L[i] + R[i]) * 0.015
    let a = 0, b = 0
    for (let k = 0; k < 8; k++) {
      a += cl[k](x)
      b += cr[k](x)
    }
    for (let k = 0; k < 4; k++) {
      a = al[k](a)
      b = ar[k](b)
    }
    oL[i] = L[i] * dry + a * w1 + b * w2
    oR[i] = R[i] * dry + b * w1 + a * w2
  }
  return [oL, oR]
}

/** Tempo delay (ping-pong). */
function echo(L, R, time, fb = 0.35, wet = 0.3) {
  const d = N(time)
  const bl = new Float32Array(d), br = new Float32Array(d)
  let i = 0
  for (let n = 0; n < L.length; n++) {
    const yl = bl[i], yr = br[i]
    bl[i] = L[n] + yr * fb
    br[i] = R[n] + yl * fb
    L[n] += yl * wet
    R[n] += yr * wet
    i = (i + 1) % d
  }
  return [L, R]
}

function pan(mono, p = 0) {
  const a = ((p + 1) / 2) * (Math.PI / 2)
  return [Float32Array.from(mono, (v) => v * Math.cos(a)), Float32Array.from(mono, (v) => v * Math.sin(a))]
}

function reverse(buf) {
  return Float32Array.from(buf).reverse()
}

function pad(buf, sec) {
  const o = new Float32Array(buf.length + N(sec))
  o.set(buf)
  return o
}

/** Loopable: overlap the last `xf` seconds into the start with an equal-power fade. */
function seamless(buf, loopSec, xf) {
  const n = N(loopSec), x = N(xf)
  const o = buf.slice(0, n)
  for (let i = 0; i < x; i++) {
    const u = i / x
    o[i] = o[i] * Math.sin((u * Math.PI) / 2) + buf[n + i] * Math.cos((u * Math.PI) / 2)
  }
  return o
}

/** One-pole DC blocker (about 20 Hz): pulse waves with a duty cycle other than 50% carry DC. */
function dcBlock(buf) {
  let x1 = 0, y1 = 0
  for (let i = 0; i < buf.length; i++) {
    const y = buf[i] - x1 + 0.9972 * y1
    x1 = buf[i]
    y1 = y
    buf[i] = y
  }
  return buf
}

function finish(L, R, { peakDb = -1, fadeIn = 0.001, fadeOut = 0.02, trim = true } = {}) {
  // Seamless loops (trim: false) skip the blocker so their loop point stays untouched.
  if (trim) {
    dcBlock(L)
    dcBlock(R)
  }
  let end = L.length
  if (trim) {
    const floor = 0.0004
    while (end > N(0.05) && Math.abs(L[end - 1]) < floor && Math.abs(R[end - 1]) < floor) end--
    end = Math.min(L.length, end + N(0.02))
  }
  L = L.slice(0, end)
  R = R.slice(0, end)
  let peak = 0
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
  const g = peak > 0 ? Math.pow(10, peakDb / 20) / peak : 1
  const fi = N(fadeIn), fo = N(fadeOut)
  for (let i = 0; i < L.length; i++) {
    let e = g
    if (i < fi) e *= i / fi
    if (i > L.length - fo) e *= (L.length - i) / fo
    L[i] *= e
    R[i] *= e
  }
  return [L, R]
}

function writeWav(file, L, R) {
  const n = L.length
  const buf = Buffer.alloc(44 + n * 4)
  buf.write("RIFF", 0)
  buf.writeUInt32LE(36 + n * 4, 4)
  buf.write("WAVEfmt ", 8)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(2, 22)
  buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * 4, 28)
  buf.writeUInt16LE(4, 32)
  buf.writeUInt16LE(16, 34)
  buf.write("data", 36)
  buf.writeUInt32LE(n * 4, 40)
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4)
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4)
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, buf)
}

function peaks(L, R, bins = 400) {
  const out = []
  const step = Math.max(1, Math.floor(L.length / bins))
  for (let b = 0; b < bins; b++) {
    let m = 0
    for (let i = b * step; i < Math.min(L.length, (b + 1) * step); i++) m = Math.max(m, Math.abs(L[i]), Math.abs(R[i]))
    out.push(Math.round(m * 1000) / 1000)
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Instruments                                                          */
/* ------------------------------------------------------------------ */

function kick(seed, { f0 = 150, f1 = 45, bend = 0.035, decay = 0.35, click = 0.6, sat = 1.6 } = {}) {
  const n = N(decay * 3)
  const body = osc(n, (i) => f1 + (f0 - f1) * Math.exp(-i / (bend * SR)))
  mul(body, perc(n, 0.001, decay))
  const c = filt(mul(white(N(0.012), seed), perc(N(0.012), 0.0002, 0.003)), "hp", 1800)
  mix(body, c, click)
  return drive(body, sat)
}

function snare(seed, { tone = 190, decay = 0.18, noiseDecay = 0.2, bright = 5500, snap = 1 } = {}) {
  const n = N(noiseDecay * 4 + 0.05)
  const t = mul(osc(n, (i) => tone * (1 + 0.5 * Math.exp(-i / (0.01 * SR))), "tri"), perc(n, 0.001, decay * 0.5))
  const nz = filt(filt(mul(white(n, seed), perc(n, 0.001, noiseDecay)), "bp", bright, 0.8), "hp", 900)
  mix(t, nz, 1.4 * snap)
  return drive(t, 1.3)
}

function hat(seed, { decay = 0.045, cutoff = 8000 } = {}) {
  const n = N(decay * 6 + 0.02)
  let m = new Float32Array(n)
  for (const r of [1, 1.342, 1.2312, 1.6532, 1.9523, 2.1523]) mix(m, osc(n, 320 * r, "square"), 0.25)
  mix(m, white(n, seed), 0.8)
  filt(m, "hp", cutoff)
  filt(m, "hp", cutoff * 0.9)
  return mul(m, perc(n, 0.0005, decay))
}

function clap(seed, { decay = 0.16 } = {}) {
  const n = N(decay * 4 + 0.05)
  const o = new Float32Array(n)
  const nz = filt(white(n, seed), "bp", 1300, 1.2)
  for (const [at, g] of [[0, 1], [0.011, 0.9], [0.022, 0.85], [0.034, 1]]) {
    const burst = mul(nz.slice(0, N(at === 0.034 ? decay * 3 : 0.012)), perc(N(at === 0.034 ? decay * 3 : 0.012), 0.0005, at === 0.034 ? decay : 0.004))
    mix(o, burst, g, N(at))
  }
  return o
}

function tom(seed, { f = 110, decay = 0.35 } = {}) {
  const n = N(decay * 3)
  const b = osc(n, (i) => f * (1 + 0.6 * Math.exp(-i / (0.03 * SR))))
  mul(b, perc(n, 0.001, decay))
  mix(b, filt(mul(white(N(0.02), seed), perc(N(0.02), 0.0003, 0.006)), "bp", 3000), 0.3)
  return drive(b, 1.4)
}

function cymbal(seed, { decay = 1.4, cutoff = 5200 } = {}) {
  const n = N(decay * 3.5)
  const m = new Float32Array(n)
  const r = mulberry(seed)
  for (let k = 0; k < 9; k++) mix(m, osc(n, 300 + r() * 600, "square"), 0.12)
  mix(m, white(n, seed), 0.9)
  filt(m, "hp", cutoff)
  filt(m, "peak", 9000, 1, 6)
  return mul(m, perc(n, 0.002, decay))
}

/** Electric-piano voice (FM), with a touch of tine bark and a gentle tremolo. */
function ep(n, f, vel = 0.8) {
  const index = (i) => (1.8 * vel + 0.2) * Math.exp(-i / (0.35 * SR)) + 0.25
  const v = fm(n, f, 1, index)
  mix(v, fm(n, f * 2, 7, (i) => 0.8 * vel * Math.exp(-i / (0.03 * SR))), 0.12)
  mul(v, perc(n, 0.004, 1.6))
  for (let i = 0; i < n; i++) v[i] *= 1 - 0.12 * (0.5 + 0.5 * Math.sin((TAU * 4.5 * i) / SR))
  return v
}

function bell(n, f, { decay = 1.8, index = 3, ratio = 3.5 } = {}) {
  const v = fm(n, f, ratio, (i) => index * Math.exp(-i / (decay * 0.3 * SR)))
  mix(v, osc(n, f * 2.76), 0.18)
  return mul(v, perc(n, 0.002, decay))
}

/** Detuned supersaw pad voice. */
function pad3(n, f, detune = 0.12, voices = 5, seed = 1) {
  const o = new Float32Array(n)
  const r = mulberry(seed)
  for (let k = 0; k < voices; k++) {
    const d = 1 + ((k - (voices - 1) / 2) / voices) * detune * 0.1
    mix(o, osc(n, f * d, "saw", { phase: r() }), 1 / voices)
  }
  return o
}

function crackle(n, seed, density = 12) {
  const r = mulberry(seed)
  const o = mul(pink(n, seed + 7), 0.02)
  for (let i = 0; i < n; i++) if (r() < density / SR) o[i] += (r() - 0.5) * (0.4 + r() * 0.6)
  return filt(filt(o, "hp", 900), "lp", 7000)
}

/* ------------------------------------------------------------------ */
/* Packs                                                                */
/* ------------------------------------------------------------------ */

const PACKS = []
const pack = (slug, folder, build) => PACKS.push({ slug, folder, build })

// Interface UI Sound Pack — 60 files
pack("interface-ui-sound-pack", "Interface UI Sound Pack", function* () {
  for (let k = 0; k < 10; k++) {
    const n = N(0.06)
    const s = mul(filt(white(n, 100 + k), "bp", 2500 + k * 380, 1.4), perc(n, 0.0003, 0.004 + k * 0.0006))
    mix(s, mul(osc(n, 1400 + k * 140), perc(n, 0.0005, 0.008)), 0.5)
    yield [`UI_Click_${String(k + 1).padStart(2, "0")}`, ...pan(s, 0)]
  }
  for (let k = 0; k < 8; k++) {
    const n = N(0.12)
    const f = 520 + k * 70
    const s = mul(osc(n, (i) => f * (0.72 + 0.28 * Math.exp(-i / (0.02 * SR)))), perc(n, 0.001, 0.03 + k * 0.003))
    mix(s, mul(filt(white(n, 200 + k), "hp", 4000), perc(n, 0.0003, 0.003)), 0.3)
    yield [`UI_Tap_${String(k + 1).padStart(2, "0")}`, ...pan(s, 0)]
  }
  for (let k = 0; k < 4; k++) {
    for (const dir of ["On", "Off"]) {
      const n = N(0.22)
      const base = 660 + k * 110
      const [a, b] = dir === "On" ? [base, base * 1.5] : [base * 1.5, base]
      const s = new Float32Array(n)
      mix(s, mul(osc(N(0.1), a, "tri"), perc(N(0.1), 0.001, 0.03)), 0.8)
      mix(s, mul(osc(N(0.12), b, "tri"), perc(N(0.12), 0.001, 0.04)), 0.8, N(0.06))
      yield [`UI_Toggle_${String(k + 1).padStart(2, "0")}_${dir}`, ...pan(s, 0)]
    }
  }
  const chords = [[72, 76, 79], [74, 78, 81, 86], [76, 79, 84], [72, 79, 84, 88], [77, 81, 84], [79, 83, 86, 91], [71, 74, 79], [74, 79, 83]]
  for (const [k, ch] of chords.entries()) {
    const n = N(1.2)
    const s = new Float32Array(n)
    ch.forEach((m, j) => mix(s, bell(N(1.1), mtof(m), { decay: 0.5, index: 1.5, ratio: 2 }), 0.5, N(j * 0.06)))
    const [L, R] = reverb(...pan(s, 0), { wet: 0.18, room: 0.7 })
    yield [`UI_Confirm_${String(k + 1).padStart(2, "0")}`, L, R]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(0.45)
    const s = new Float32Array(n)
    const f = 220 - k * 14
    for (const [j, m] of [[0, 1], [1, 0.84]].entries()) mix(s, mul(filt(osc(N(0.14), f * m[1] * (j ? 1 : 1), k % 2 ? "square" : "saw"), "lp", 1400), perc(N(0.14), 0.002, 0.06)), 0.6, N(m[0] * 0.13))
    yield [`UI_Error_${String(k + 1).padStart(2, "0")}`, ...pan(drive(s, 1.5), 0)]
  }
  const notes = [84, 79, 88, 81, 86, 76, 91, 83, 89, 78]
  for (const [k, m] of notes.entries()) {
    const n = N(2)
    const s = bell(n, mtof(m), { decay: 0.7 + (k % 3) * 0.15, index: 2 + (k % 4) * 0.6, ratio: [3.5, 1.4, 2.01, 4.0][k % 4] })
    if (k % 2) mix(s, bell(n, mtof(m + 7), { decay: 0.6, index: 1.5, ratio: 2 }), 0.35, N(0.09))
    const [L, R] = reverb(...pan(s, 0), { wet: 0.22, room: 0.78 })
    yield [`UI_Notification_${String(k + 1).padStart(2, "0")}`, L, R]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(0.35)
    const up = k % 2 === 0
    const s = mul(filt(white(n, 300 + k), "bp", (i) => (up ? 700 + (i / n) * 5000 : 5700 - (i / n) * 5000), 2.2), env(n, [[0, 0], [0.12, 1], [0.35, 0]]))
    const L = new Float32Array(n), R = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const p = up ? i / n : 1 - i / n
      L[i] = s[i] * Math.cos((p * Math.PI) / 2)
      R[i] = s[i] * Math.sin((p * Math.PI) / 2)
    }
    yield [`UI_Swipe_${String(k + 1).padStart(2, "0")}`, L, R]
  }
  for (let k = 0; k < 4; k++) {
    const n = N(0.09)
    const s = mul(filt(white(n, 400 + k), "bp", 1800 + k * 500, 2), perc(n, 0.0003, 0.012))
    mix(s, mul(filt(white(n, 410 + k), "lp", 600), perc(n, 0.0005, 0.02)), 0.5, N(0.004))
    yield [`UI_Keypress_${String(k + 1).padStart(2, "0")}`, ...pan(s, 0)]
  }
})

// Arcade Game SFX Pack — 60 files
pack("arcade-game-sfx-pack", "Arcade Game SFX Pack", function* () {
  const sq = (n, f, pw = 0.5) => osc(n, f, "square", { pw })
  for (let k = 0; k < 6; k++) {
    const n = N(0.35)
    const s = new Float32Array(n)
    const a = 988 + k * 60
    mix(s, mul(sq(N(0.06), a, 0.25), 0.5), 1)
    mix(s, mul(sq(N(0.26), a * 1.335, 0.25), perc(N(0.26), 0.001, 0.08)), 0.5, N(0.06))
    yield [`Game_Coin_${String(k + 1).padStart(2, "0")}`, ...pan(s, 0)]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(0.3)
    const s = mul(sq(n, (i) => 180 + k * 30 + (i / n) * (500 + k * 60), 0.5), env(n, [[0, 0.6], [0.25, 0.5], [0.3, 0]]))
    yield [`Game_Jump_${String(k + 1).padStart(2, "0")}`, ...pan(filt(s, "lp", 6000), 0)]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(0.8)
    const s = new Float32Array(n)
    const root = 60 + k * 2
    ;[0, 4, 7, 12, 16, 19, 24].forEach((st, j) => mix(s, mul(sq(N(0.11), mtof(root + st), 0.25), perc(N(0.11), 0.001, 0.05)), 0.45, N(j * 0.08)))
    yield [`Game_PowerUp_${String(k + 1).padStart(2, "0")}`, ...pan(s, 0)]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(0.25)
    const s = mul(osc(n, (i) => (1800 - k * 150) * Math.exp(-i / ((0.05 + k * 0.01) * SR)) + 90, "saw"), perc(n, 0.001, 0.08))
    yield [`Game_Laser_${String(k + 1).padStart(2, "0")}`, ...pan(filt(s, "lp", 7000), (k - 2.5) / 6)]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(1.6)
    const s = mul(filt(white(n, 500 + k), "lp", (i) => 3000 * Math.exp(-i / (0.25 * SR)) + 120), perc(n, 0.001, 0.35 + k * 0.05))
    mix(s, mul(osc(n, (i) => 70 * Math.exp(-i / (0.3 * SR)) + 30), perc(n, 0.001, 0.25)), 0.8)
    crush(s, 8, 3)
    yield [`Game_Explosion_${String(k + 1).padStart(2, "0")}`, ...pan(drive(s, 2), 0)]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(0.18)
    const s = mul(sq(n, (i) => 300 - (i / n) * 200 + k * 20, 0.5), perc(n, 0.001, 0.04))
    mix(s, mul(white(n, 600 + k), perc(n, 0.0005, 0.015)), 0.4)
    yield [`Game_Hit_${String(k + 1).padStart(2, "0")}`, ...pan(crush(s, 7, 2), 0)]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(0.2)
    const s = mul(osc(n, (i) => 600 + k * 80 + (i / n) * 900, "tri"), perc(n, 0.001, 0.07))
    yield [`Game_Pickup_${String(k + 1).padStart(2, "0")}`, ...pan(s, 0)]
  }
  for (let k = 0; k < 6; k++) {
    const n = N(0.08)
    const s = mul(sq(n, 880 + k * 110, 0.125), perc(n, 0.0005, 0.03))
    yield [`Game_MenuBlip_${String(k + 1).padStart(2, "0")}`, ...pan(s, 0)]
  }
  const jingles = [["Win", [72, 76, 79, 84, 79, 84]], ["LevelUp", [67, 71, 74, 79, 83, 86]], ["Lose", [72, 71, 70, 69, 65]], ["GameOver", [67, 66, 65, 64, 60, 55]], ["Checkpoint", [76, 79, 84]], ["Secret", [79, 78, 75, 69, 68, 76, 80, 84]]]
  for (const [name, seq] of jingles) {
    const n = N(seq.length * 0.13 + 0.6)
    const s = new Float32Array(n)
    seq.forEach((m, j) => {
      mix(s, mul(sq(N(0.16), mtof(m), 0.25), perc(N(0.16), 0.002, 0.09)), 0.45, N(j * 0.13))
      mix(s, mul(osc(N(0.16), mtof(m - 12), "tri"), perc(N(0.16), 0.002, 0.1)), 0.4, N(j * 0.13))
    })
    yield [`Game_Jingle_${name}`, ...pan(s, 0)]
  }
  const misc = [
    ["Teleport", () => fm(N(0.7), (i) => 200 + (i / N(0.7)) * 1600, 1.5, 4)],
    ["Shield", () => mul(filt(pad3(N(0.8), 220, 0.6, 4, 7), "bp", 1200, 3), env(N(0.8), [[0, 0], [0.1, 1], [0.8, 0]]))],
    ["Dash", () => mul(filt(white(N(0.3), 77), "bp", (i) => 2000 + 3000 * Math.sin((Math.PI * i) / N(0.3)), 3), perc(N(0.3), 0.01, 0.1))],
    ["Heal", () => { const n = N(1); const s = new Float32Array(n); [72, 79, 84, 88].forEach((m, j) => mix(s, bell(N(0.7), mtof(m), { decay: 0.4, index: 1, ratio: 2 }), 0.4, N(j * 0.1))); return s }],
    ["DoorOpen", () => mul(sq(N(0.5), (i) => 90 + 40 * Math.floor((i / N(0.5)) * 8) , 0.5), env(N(0.5), [[0, 0.5], [0.45, 0.5], [0.5, 0]]))],
    ["Step", () => mul(filt(white(N(0.07), 88), "lp", 1200), perc(N(0.07), 0.0005, 0.015))],
  ]
  for (const [name, fn] of misc) yield [`Game_${name}`, ...pan(fn(), 0)]
})

// Neon Drive Drum Kit — 80 one-shots
pack("neon-drive-drum-kit", "Neon Drive Drum Kit", function* () {
  for (let k = 0; k < 14; k++) {
    const s = kick(700 + k, { f0: 120 + k * 9, f1: 38 + (k % 5) * 4, bend: 0.025 + (k % 4) * 0.008, decay: 0.22 + (k % 6) * 0.06, click: 0.3 + (k % 3) * 0.25, sat: 1.2 + (k % 4) * 0.4 })
    yield [`Kick_${String(k + 1).padStart(2, "0")}`, ...pan(s, 0)]
  }
  for (let k = 0; k < 14; k++) {
    const s = pad(snare(800 + k, { tone: 170 + k * 8, decay: 0.12 + (k % 4) * 0.04, noiseDecay: 0.12 + (k % 5) * 0.05, bright: 3500 + k * 300 }), 1.2)
    let [L, R] = pan(s, 0)
    if (k >= 7) {
      ;[L, R] = reverb(L, R, { wet: 0.9, room: 0.9, damp: 0.2 })
      const g = env(L.length, [[0, 1], [0.28, 1], [0.34, 0]])
      mul(L, g)
      mul(R, g)
    }
    yield [`Snare_${String(k + 1).padStart(2, "0")}${k >= 7 ? "_Gated" : ""}`, L, R]
  }
  for (let k = 0; k < 8; k++) {
    const [L, R] = reverb(...pan(pad(clap(900 + k, { decay: 0.1 + k * 0.02 }), 0.6), 0), { wet: 0.25 + k * 0.03, room: 0.75 })
    yield [`Clap_${String(k + 1).padStart(2, "0")}`, L, R]
  }
  for (let k = 0; k < 10; k++) yield [`HiHat_Closed_${String(k + 1).padStart(2, "0")}`, ...pan(hat(1000 + k, { decay: 0.025 + k * 0.006, cutoff: 6500 + k * 300 }), 0)]
  for (let k = 0; k < 8; k++) yield [`HiHat_Open_${String(k + 1).padStart(2, "0")}`, ...pan(hat(1100 + k, { decay: 0.18 + k * 0.05, cutoff: 6000 + k * 250 }), 0)]
  const tomF = { High: 190, Mid: 130, Low: 88 }
  for (const [name, f] of Object.entries(tomF)) {
    for (let k = 0; k < 4; k++) {
      const [L, R] = reverb(...pan(pad(tom(1200 + k, { f: f * (1 + k * 0.06), decay: 0.3 + k * 0.08 }), 0.8), name === "High" ? -0.3 : name === "Low" ? 0.3 : 0), { wet: 0.2 + k * 0.1, room: 0.8 })
      yield [`Tom_${name}_${String(k + 1).padStart(2, "0")}`, L, R]
    }
  }
  for (let k = 0; k < 6; k++) {
    const s = cymbal(1300 + k, { decay: k < 3 ? 1.2 + k * 0.4 : 0.6 + (k - 3) * 0.2, cutoff: k < 3 ? 4500 : 7000 })
    yield [`Cymbal_${k < 3 ? "Crash" : "Ride"}_${String((k % 3) + 1).padStart(2, "0")}`, ...pan(s, k % 2 ? 0.25 : -0.25)]
  }
  const perc8 = [
    ["Rim", () => mul(filt(osc(N(0.08), 1700, "tri"), "bp", 1700, 4), perc(N(0.08), 0.0003, 0.012))],
    ["Cowbell", () => mul(filt(mix(osc(N(0.5), 560, "square"), osc(N(0.5), 845, "square"), 0.8), "bp", 800, 2), perc(N(0.5), 0.001, 0.12))],
    ["Clave", () => mul(osc(N(0.1), 2500), perc(N(0.1), 0.0003, 0.02))],
    ["Shaker", () => mul(filt(white(N(0.2), 1400), "hp", 6000), env(N(0.2), [[0, 0], [0.06, 1], [0.2, 0]]))],
    ["Tambourine", () => mix(hat(1401, { decay: 0.12, cutoff: 7000 }), filt(osc(N(0.3), 4200, "square"), "bp", 6000, 5), 0.2)],
    ["Snap", () => mul(filt(white(N(0.08), 1402), "bp", 2800, 3), perc(N(0.08), 0.0003, 0.008))],
    ["Zap", () => mul(osc(N(0.2), (i) => 2400 * Math.exp(-i / (0.02 * SR)) + 100, "square"), perc(N(0.2), 0.0005, 0.05))],
    ["Woodblock", () => mul(filt(osc(N(0.12), 900, "tri"), "bp", 900, 6), perc(N(0.12), 0.0003, 0.02))],
  ]
  for (const [name, fn] of perc8) yield [`Perc_${name}`, ...pan(fn(), 0)]
})

// Late Night Lo-Fi Loop Kit — 32 loops
pack("late-night-lofi-loop-kit", "Late Night Lo-Fi Loop Kit", function* () {
  const PROGS = [
    ["Dm", 82, [[62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 71], [57, 61, 64, 67]]],
    ["Fmaj", 90, [[65, 69, 72, 76], [64, 67, 71, 74], [62, 65, 69, 72], [60, 64, 67, 70]]],
    ["Am", 82, [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 56, 59, 62]]],
    ["Ebmaj", 90, [[63, 67, 70, 74], [60, 63, 67, 70], [65, 68, 72, 75], [58, 62, 65, 68]]],
    ["Gm", 82, [[55, 58, 62, 65], [60, 63, 67, 70], [53, 57, 60, 63], [58, 62, 65, 69]]],
    ["Cmaj", 90, [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65]]],
  ]
  const loopLen = (bpm) => (60 / bpm) * 16
  const wow = (i) => 1 + 0.0025 * Math.sin((TAU * 0.55 * i) / SR) + 0.001 * Math.sin((TAU * 3.1 * i) / SR)
  let seed = 2000
  for (const [key, bpm, prog] of PROGS) {
    for (const variant of [1, 2]) {
      const len = loopLen(bpm)
      const n = N(len + 3)
      const L = new Float32Array(n), R = new Float32Array(n)
      const beat = 60 / bpm
      prog.forEach((chord, bar) => {
        const hits = variant === 1 ? [0] : [0, 2.5]
        for (const h of hits) {
          const t = bar * 4 * beat + h * beat
          const dur = N((variant === 1 ? 4 : h === 0 ? 2.5 : 1.5) * beat + 0.6)
          chord.forEach((m, j) => {
            const v = ep(dur, mtof(m) * (variant === 2 ? 1 : 1), 0.55 + j * 0.05)
            for (let i = 0; i < v.length; i++) v[i] *= 1
            const p = (j - 1.5) / 4
            mix(L, v, 0.22 * Math.cos(((p + 1) / 2) * (Math.PI / 2)), N(t + j * 0.012))
            mix(R, v, 0.22 * Math.sin(((p + 1) / 2) * (Math.PI / 2)), N(t + j * 0.012))
          })
        }
      })
      for (const b of [L, R]) {
        const stretched = new Float32Array(b.length)
        let pos = 0
        for (let i = 0; i < b.length; i++) {
          const k = Math.floor(pos), fr = pos - k
          stretched[i] = (b[k] ?? 0) * (1 - fr) + (b[k + 1] ?? 0) * fr
          pos += wow(i)
        }
        b.set(stretched)
        filt(b, "lp", 3200)
        drive(b, 1.4)
      }
      const [rl, rr] = reverb(L, R, { wet: 0.25, room: 0.82, damp: 0.45 })
      const outL = seamless(rl, len, 0.05), outR = seamless(rr, len, 0.05)
      yield [`LoFi_Chords_${key}_${bpm}bpm_${String(variant).padStart(2, "0")}`, outL, outR, { trim: false, fadeOut: 0.004 }]
      seed++
    }
  }
  const drumPatterns = [
    { k: [0, 2.5, 8, 10.5], s: [4, 12], h: 8 },
    { k: [0, 3, 8, 11], s: [4, 12, 15.5], h: 16 },
    { k: [0, 6, 8, 14], s: [4, 12], h: 8 },
    { k: [0, 2.75, 7, 8, 10.5], s: [4, 12], h: 16 },
    { k: [0, 8, 9.5], s: [4, 12.5], h: 8 },
  ]
  for (const bpm of [82, 90]) {
    for (const [pi, pat] of drumPatterns.entries()) {
      const beat = 60 / bpm
      const bars = 4
      const len = beat * 4 * bars
      const n = N(len + 1)
      const L = new Float32Array(n), R = new Float32Array(n)
      const sw = (step) => (step % 2 === 1 ? 0.17 : 0) * (beat / 4)
      for (let bar = 0; bar < bars; bar++) {
        const b0 = bar * 4 * beat
        const kk = kick(3000 + pi, { f0: 110, f1: 46, decay: 0.28, click: 0.2, sat: 1.3 })
        for (const st of pat.k) mix(L, kk, 0.9, N(b0 + (st / 4) * beat)), mix(R, kk, 0.9, N(b0 + (st / 4) * beat))
        const sn = snare(3100 + pi, { tone: 180, decay: 0.12, noiseDecay: 0.15, bright: 3000 })
        for (const st of pat.s) mix(L, sn, 0.55, N(b0 + (st / 4) * beat + 0.012)), mix(R, sn, 0.6, N(b0 + (st / 4) * beat + 0.012))
        const steps = pat.h
        for (let st = 0; st < steps; st++) {
          const pos = st * (16 / steps)
          const hh = hat(3200 + st, { decay: st % 4 === 2 ? 0.07 : 0.03, cutoff: 7000 })
          const at = N(b0 + (pos / 4) * beat + sw(pos))
          mix(L, hh, (st % 2 ? 0.18 : 0.26) * 0.9, at)
          mix(R, hh, (st % 2 ? 0.18 : 0.26) * 1.1, at)
        }
      }
      const cr = crackle(n, 3300 + pi, 9)
      mix(L, cr, 0.6)
      mix(R, cr, 0.6)
      for (const b of [L, R]) {
        filt(b, "lp", 6500)
        crush(b, 12, 2)
      }
      yield [`LoFi_Drums_${bpm}bpm_${String(pi + 1).padStart(2, "0")}`, L.slice(0, N(len)), R.slice(0, N(len)), { trim: false, fadeOut: 0.003 }]
    }
  }
  const bassLines = [["Dm", 82, [38, 43, 36, 45]], ["Fmaj", 90, [41, 40, 38, 36]], ["Am", 82, [45, 41, 43, 40]], ["Gm", 82, [43, 36, 41, 46]], ["Ebmaj", 90, [39, 36, 41, 46]], ["Cmaj", 90, [36, 45, 38, 43]]]
  for (const [key, bpm, roots] of bassLines) {
    const beat = 60 / bpm
    const len = beat * 16
    const n = N(len + 1)
    const s = new Float32Array(n)
    roots.forEach((m, bar) => {
      for (const [st, d, o] of [[0, 1.5, 0], [2, 0.5, 7], [2.5, 1.5, 0]]) {
        const dur = N(d * beat)
        const v = mul(mix(osc(dur, mtof(m + o), "sine"), osc(dur, mtof(m + o) * 2, "tri"), 0.15), env(dur, [[0, 0], [0.01, 1], [d * beat - 0.05, 0.8], [d * beat, 0]]))
        mix(s, v, 0.8, N(bar * 4 * beat + st * beat))
      }
    })
    filt(s, "lp", 900)
    drive(s, 1.5)
    yield [`LoFi_Bass_${key}_${bpm}bpm`, ...pan(s.slice(0, N(len)), 0), { trim: false, fadeOut: 0.003 }]
  }
  const textures = [["Vinyl", (n) => crackle(n, 4000, 20)], ["TapeHiss", (n) => filt(mul(pink(n, 4001), 0.3), "bp", 5000, 0.5)], ["RainOnGlass", (n) => { const o = filt(mul(pink(n, 4002), 0.5), "hp", 1500); const r = mulberry(4003); for (let i = 0; i < n; i++) if (r() < 30 / SR) o[i] += (r() - 0.5) * 0.8; return filt(o, "lp", 9000) }], ["RoomTone", (n) => filt(mul(pink(n, 4004), 0.6), "lp", 400)]]
  for (const [name, fn] of textures) {
    const n = N(24)
    const a = fn(n), b = fn(n).reverse()
    yield [`LoFi_Texture_${name}`, seamless(a, 20, 2), seamless(b, 20, 2), { trim: false, fadeOut: 0.003, peakDb: -6 }]
  }
})

// Driftfield Ambient Textures — 12 seamless 32 s loops
pack("driftfield-ambient-textures", "Driftfield Ambient Textures", function* () {
  const LOOP = 32, XF = 4
  const defs = [
    ["Pad_Glass_Cm", "pad", [48, 55, 60, 63, 67]], ["Pad_Warm_Fmaj", "pad", [41, 48, 53, 57, 60, 64]], ["Pad_Night_Am", "pad", [45, 52, 57, 60, 64]],
    ["Drone_Low_D", "drone", [38]], ["Drone_Iron_E", "drone", [40]], ["Drone_Choir_G", "drone", [43]],
    ["Shimmer_Ebmaj", "shimmer", [63, 70, 75, 79, 82]], ["Shimmer_Dmaj", "shimmer", [62, 69, 74, 78, 81]],
    ["Wind_Plains", "wind", []], ["Wind_Canyon", "wind", []],
    ["Bells_Cloud_Bbmaj", "bells", [70, 74, 77, 81, 82, 86, 89]], ["Bells_Cloud_Gm", "bells", [67, 70, 74, 77, 79, 82, 86]],
  ]
  for (const [k, [name, kind, notes]] of defs.entries()) {
    const n = N(LOOP + XF + 6)
    const L = new Float32Array(n), R = new Float32Array(n)
    const r = mulberry(5000 + k)
    if (kind === "pad") {
      notes.forEach((m, j) => {
        const v = pad3(n, mtof(m), 0.16, 5, 5100 + k * 10 + j)
        filt(v, "lp", (i) => 700 + 900 * (0.5 + 0.5 * Math.sin((TAU * (0.03 + j * 0.007) * i) / SR + j)))
        const p = (j / (notes.length - 1)) * 1.4 - 0.7
        mix(L, v, 0.25 * Math.cos(((p + 1) / 2) * (Math.PI / 2)))
        mix(R, v, 0.25 * Math.sin(((p + 1) / 2) * (Math.PI / 2)))
      })
    } else if (kind === "drone") {
      const f = mtof(notes[0])
      for (let h = 1; h <= 12; h++) {
        const amp = 0.5 / h
        const beat = 1 + (r() - 0.5) * 0.004
        const v = mul(osc(n, f * h * beat, "sine", { phase: r() }), (i) => 0)
        const lfo = (i) => 0.55 + 0.45 * Math.sin((TAU * (0.02 + h * 0.011) * i) / SR + r() * 6)
        for (let i = 0; i < n; i++) v[i] = Math.sin(TAU * f * h * beat * (i / SR) + h) * amp * lfo(i)
        mix(L, v, h % 2 ? 1 : 0.7)
        mix(R, v, h % 2 ? 0.7 : 1)
      }
      if (name.includes("Choir")) for (const b of [L, R]) filt(b, "peak", 700, 2, 8)
      if (name.includes("Iron")) for (const b of [L, R]) drive(b, 2)
    } else if (kind === "shimmer") {
      notes.forEach((m, j) => {
        for (const oct of [1, 2]) {
          const v = osc(n, mtof(m) * oct * (1 + (r() - 0.5) * 0.002), "sine", { phase: r() })
          const lfo = env(n, [[0, 0.3], [LOOP / 2, 1], [LOOP + XF + 6, 0.3]])
          mul(v, lfo)
          mix(j % 2 ? L : R, v, 0.14 / oct)
          mix(j % 2 ? R : L, v, 0.06 / oct)
        }
      })
    } else if (kind === "wind") {
      for (const [b, s] of [[L, 5200 + k], [R, 5300 + k]]) {
        const w = pink(n, s)
        const base = name.includes("Canyon") ? 380 : 900
        filt(w, "bp", (i) => base + base * 1.2 * (0.5 + 0.5 * Math.sin((TAU * 0.05 * i) / SR + s)) * (0.6 + 0.4 * Math.sin((TAU * 0.013 * i) / SR)), 1.6)
        mix(b, w, 1.2)
      }
    } else if (kind === "bells") {
      let t = 0
      while (t < LOOP + XF) {
        const m = notes[Math.floor(r() * notes.length)]
        const v = bell(N(5), mtof(m), { decay: 2.5, index: 1.2 + r() * 1.5, ratio: [3.5, 2.01, 1.4][Math.floor(r() * 3)] })
        const p = r() * 1.6 - 0.8
        mix(L, v, 0.25 * Math.cos(((p + 1) / 2) * (Math.PI / 2)), N(t))
        mix(R, v, 0.25 * Math.sin(((p + 1) / 2) * (Math.PI / 2)), N(t))
        t += 0.35 + r() * 1.4
      }
    }
    const [rl, rr] = reverb(L, R, { wet: kind === "wind" ? 0.25 : 0.6, room: 0.93, damp: 0.35, dry: kind === "bells" ? 0.6 : 0.9 })
    const a = rl.subarray(N(3)), b = rr.subarray(N(3))
    yield [`Ambient_${name}`, seamless(a, LOOP, XF), seamless(b, LOOP, XF), { trim: false, fadeIn: 0, fadeOut: 0, peakDb: -3 }]
  }
})

// Monolith Cinematic Toolkit — 40 files
pack("monolith-cinematic-toolkit", "Monolith Cinematic Toolkit", function* () {
  for (let k = 0; k < 8; k++) {
    const len = [4, 6, 8][k % 3]
    const n = N(len + 2)
    const up = (i) => Math.min(1, i / N(len))
    const nz = filt(white(n, 6000 + k), "bp", (i) => 400 + 7000 * Math.pow(up(i), 2), 1.2)
    const saw = filt(pad3(n, mtof(36 + k), 0.4, 4, 6100 + k), "lp", (i) => 200 + 5000 * Math.pow(up(i), 2.2))
    for (let i = 0; i < n; i++) {
      const e = i < N(len) ? Math.pow(up(i), 2.4) : Math.exp(-(i - N(len)) / (0.05 * SR))
      nz[i] *= e
      saw[i] *= e * (1 + 0.3 * Math.sin((TAU * (4 + 12 * up(i)) * i) / SR))
    }
    const s = mix(nz, saw, 0.8)
    const [L, R] = reverb(...pan(s, 0), { wet: 0.35, room: 0.9 })
    yield [`Riser_${String(k + 1).padStart(2, "0")}_${len}s`, L, R]
  }
  const impact = (k) => {
    const n = N(6)
    const sub = mul(osc(n, (i) => 32 + 60 * Math.exp(-i / (0.08 * SR))), perc(n, 0.001, 0.9 + (k % 3) * 0.3))
    const body = mul(filt(white(n, 6200 + k), "lp", (i) => 4000 * Math.exp(-i / (0.1 * SR)) + 200), perc(n, 0.0005, 0.25))
    const metal = mul(filt(pad3(n, 110 + k * 13, 2, 6, 6300 + k), "bp", 1800, 3), perc(n, 0.001, 0.6))
    mix(sub, body, 1.1)
    mix(sub, metal, 0.35)
    return drive(sub, 2.2)
  }
  for (let k = 0; k < 8; k++) {
    const [L, R] = reverb(...pan(impact(k), 0), { wet: 0.45, room: 0.92, damp: 0.4 })
    yield [`Impact_${String(k + 1).padStart(2, "0")}`, L, R]
  }
  for (let k = 0; k < 8; k++) {
    const len = 0.8 + (k % 4) * 0.35
    const n = N(len + 1)
    const s = filt(pink(n, 6400 + k), "bp", (i) => 300 + 5000 * Math.sin((Math.PI * Math.min(1, i / N(len)))), 2.5)
    mul(s, env(n, [[0, 0], [len * 0.55, 1], [len, 0]], 0))
    const L = new Float32Array(n), R = new Float32Array(n)
    const dir = k % 2 ? 1 : -1
    for (let i = 0; i < n; i++) {
      const p = Math.min(1, i / N(len))
      const a = ((dir * (p * 2 - 1) + 1) / 2) * (Math.PI / 2)
      L[i] = s[i] * Math.cos(a)
      R[i] = s[i] * Math.sin(a)
    }
    const [rl, rr] = reverb(L, R, { wet: 0.25, room: 0.8 })
    yield [`Whoosh_${String(k + 1).padStart(2, "0")}`, rl, rr]
  }
  const braamChords = [[36, 43, 48], [34, 41, 46], [38, 45, 50], [33, 40, 45], [31, 38, 43], [35, 42, 47]]
  for (const [k, ch] of braamChords.entries()) {
    const n = N(7)
    const s = new Float32Array(n)
    for (const m of ch) mix(s, pad3(n, mtof(m), 0.5, 7, 6500 + k * 7 + m), 0.4)
    filt(s, "lp", (i) => 180 + 2600 * Math.exp(-i / (0.6 * SR)) + 300 * Math.exp(-i / (3 * SR)))
    mul(s, env(n, [[0, 0], [0.05, 1], [2.5, 0.7], [6.5, 0]], 1))
    drive(s, 3)
    const [L, R] = reverb(...pan(s, 0), { wet: 0.4, room: 0.9 })
    yield [`Braam_${String(k + 1).padStart(2, "0")}`, L, R]
  }
  for (let k = 0; k < 4; k++) {
    const n = N(3)
    const s = mul(osc(n, (i) => 90 * Math.exp(-i / ((0.4 + k * 0.25) * SR)) + 22), env(n, [[0, 0], [0.01, 1], [2.9, 0]], 1))
    yield [`SubDrop_${String(k + 1).padStart(2, "0")}`, ...pan(drive(s, 1.4), 0)]
  }
  for (let k = 0; k < 3; k++) {
    const [L, R] = reverb(...pan(impact(10 + k), 0), { wet: 0.55, room: 0.94 })
    yield [`ReverseHit_${String(k + 1).padStart(2, "0")}`, reverse(L).slice(N(1.5)), reverse(R).slice(N(1.5))]
  }
  for (let k = 0; k < 3; k++) {
    const n = N(16)
    const s = new Float32Array(n)
    const f = mtof([33, 35, 30][k])
    for (let h = 1; h <= 8; h++) mix(s, osc(n, f * h * (1 + h * 0.0015)), 0.4 / h)
    const nz = filt(pink(n, 6600 + k), "bp", 180, 2)
    mix(s, nz, 0.4)
    for (let i = 0; i < n; i++) s[i] *= 0.6 + 0.4 * Math.sin((TAU * (0.2 + k * 0.1) * i) / SR)
    mul(s, env(n, [[0, 0], [2, 1], [14, 1], [16, 0]]))
    const [L, R] = reverb(...pan(drive(s, 1.6), 0), { wet: 0.4, room: 0.9 })
    yield [`TensionDrone_${String(k + 1).padStart(2, "0")}`, L, R]
  }
})

/* ------------------------------------------------------------------ */

const filters = process.argv[2]?.split(",").filter(Boolean)
for (const p of PACKS) {
  if (filters && !filters.some((f) => p.slug.includes(f))) continue
  const dir = path.join(OUT, p.slug, "files", p.folder)
  fs.rmSync(dir, { recursive: true, force: true })
  const meta = []
  let bytes = 0
  for (const [name, L0, R0, opts] of p.build()) {
    const [L, R] = finish(L0, R0, opts ?? {})
    const file = path.join(dir, `${name}.wav`)
    writeWav(file, L, R)
    bytes += 44 + L.length * 4
    meta.push({ name, seconds: Math.round((L.length / SR) * 100) / 100, peaks: peaks(L, R, 160) })
  }
  fs.writeFileSync(path.join(OUT, p.slug, "peaks.json"), JSON.stringify({ pack: p.folder, files: meta }))
  console.log(`${p.slug}: ${meta.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB, ${Math.round(meta.reduce((s, m) => s + m.seconds, 0))} s`)
}
