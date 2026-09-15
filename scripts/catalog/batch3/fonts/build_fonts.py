#!/usr/bin/env python3
"""
Builds the three DistroSource Original typefaces of catalogue batch 3 with
fontTools. Every outline is constructed here from geometric primitives —
bars, slanted stems, elliptical rings, arcs and dots — so nothing is traced
from or derived from an existing font.

  Meridian Sans    geometric sans family, Light / Regular / Medium / Bold
  Rivet Mono       monospaced coding face with slab details, Regular / Bold
  Blockhaus Pixel  5 x 7 pixel display face, Regular

Each style is written as OTF (CFF outlines) and WOFF2 into
.catalog-build/batch3/<product-slug>/fonts/.

    python scripts/catalog/batch3/fonts/build_fonts.py
"""
import math
import os

from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.ttLib import TTFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
OUT = os.path.join(ROOT, ".catalog-build", "batch3")
VERSION = "1.000"
VENDOR = "DSRC"
COPYRIGHT = "Copyright 2026 DistroSource. All rights reserved."

UPM = 1000
CAP = 700
XH = 500
ASC = 740
DESC = -210
OS_ = 12  # overshoot for round shapes


# --------------------------------------------------------------------------
# Primitives. A glyph is a list of closed contours; a contour is a list of
# segments ('M', p) ('L', p) ('C', c1, c2, p). Fills run counter-clockwise
# and holes clockwise, so overlapping primitives unite under non-zero fill.
# --------------------------------------------------------------------------

def _area(pts):
    return sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts))) / 2


def poly(pts):
    pts = [(float(x), float(y)) for x, y in pts]
    if _area(pts) < 0:
        pts.reverse()
    return [[("M", pts[0])] + [("L", p) for p in pts[1:]]]


def rect(x0, y0, x1, y1):
    return poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])


def slant(xb, yb, xt, yt, w):
    """A stem from (xb, yb) up to (xt, yt) with horizontal ends and perpendicular thickness w."""
    phi = math.atan2(xt - xb, yt - yb)
    hw = (w / 2) / max(0.2, math.cos(phi))
    return poly([(xb - hw, yb), (xb + hw, yb), (xt + hw, yt), (xt - hw, yt)])


def slant_fit(xb, yb, xt, yt, w, align_b=None, align_t=None):
    """A slant whose outer corner lands exactly on a neighbouring edge.

    align_b=("l", x) puts the bottom-left corner at x, ("r", x) the
    bottom-right; align_t does the same at the top. Stops diagonals poking
    past the stem or bar they join."""
    for _ in range(4):
        hw = (w / 2) / max(0.2, math.cos(math.atan2(xt - xb, yt - yb)))
        if align_b:
            xb = align_b[1] + hw if align_b[0] == "l" else align_b[1] - hw
        if align_t:
            xt = align_t[1] + hw if align_t[0] == "l" else align_t[1] - hw
    return slant(xb, yb, xt, yt, w)


def flat(xl, yl, xr, yr, w):
    """A shallow stroke from (xl, yl) to (xr, yr) with vertical ends."""
    psi = math.atan2(yr - yl, xr - xl)
    hv = (w / 2) / max(0.2, math.cos(psi))
    return poly([(xl, yl - hv), (xr, yr - hv), (xr, yr + hv), (xl, yl + hv)])


def bar(cx, cy, length, w, angle):
    """A rectangle of the given length and thickness centred on (cx, cy), rotated by angle (degrees)."""
    a = math.radians(angle)
    dx, dy = math.cos(a) * length / 2, math.sin(a) * length / 2
    nx, ny = -math.sin(a) * w / 2, math.cos(a) * w / 2
    return poly([(cx - dx - nx, cy - dy - ny), (cx + dx - nx, cy + dy - ny), (cx + dx + nx, cy + dy + ny), (cx - dx + nx, cy - dy + ny)])


def _pt(cx, cy, rx, ry, a):
    t = math.radians(a)
    return (cx + rx * math.cos(t), cy + ry * math.sin(t))


def _arc(cx, cy, rx, ry, a0, a1):
    n = max(1, int(math.ceil(abs(a1 - a0) / 90.0 - 1e-9)))
    step = (a1 - a0) / n
    segs = []
    for i in range(n):
        t0 = math.radians(a0 + i * step)
        t1 = math.radians(a0 + (i + 1) * step)
        k = 4.0 / 3.0 * math.tan((t1 - t0) / 4.0)
        p0 = (cx + rx * math.cos(t0), cy + ry * math.sin(t0))
        p3 = (cx + rx * math.cos(t1), cy + ry * math.sin(t1))
        c1 = (p0[0] - k * rx * math.sin(t0), p0[1] + k * ry * math.cos(t0))
        c2 = (p3[0] + k * rx * math.sin(t1), p3[1] - k * ry * math.cos(t1))
        segs.append(("C", c1, c2, p3))
    return segs


def _ellipse(cx, cy, rx, ry, ccw):
    a0, a1 = (0, 360) if ccw else (360, 0)
    return [("M", _pt(cx, cy, rx, ry, a0))] + _arc(cx, cy, rx, ry, a0, a1)


def ring(cx, cy, rx, ry, t):
    return [_ellipse(cx, cy, rx, ry, True), _ellipse(cx, cy, rx - t, ry - t, False)]


def disc(cx, cy, r):
    return [_ellipse(cx, cy, r, r, True)]


def band(cx, cy, rx, ry, t, a0, a1, ext=2.5):
    """A thick elliptical arc swept counter-clockwise from a0 to a1 degrees, with radial ends.

    Both ends run `ext` degrees past the requested angles so an arc always
    overlaps the stem or bar it joins; edges that merely touch leave a
    visible anti-aliasing seam when the glyph is rasterised."""
    if a1 < a0:
        a0, a1 = a1, a0
    a0, a1 = a0 - ext, a1 + ext
    seg = [("M", _pt(cx, cy, rx, ry, a0))] + _arc(cx, cy, rx, ry, a0, a1)
    seg.append(("L", _pt(cx, cy, rx - t, ry - t, a1)))
    seg += _arc(cx, cy, rx - t, ry - t, a1, a0)
    return [seg]


def _points(contours):
    for c in contours:
        for s in c:
            for p in s[1:]:
                yield p


def _shift(contours, dx):
    out = []
    for c in contours:
        out.append([(s[0],) + tuple((p[0] + dx, p[1]) for p in s[1:]) for s in c])
    return out


# --------------------------------------------------------------------------
# Meridian Sans / Rivet Mono glyph set. Every glyph is a function of the
# stroke weight w and, for Rivet Mono, a narrower body and slab details.
# Returns {char: (contours, left_side, right_side)} where the sides are
# "s" (straight), "r" (round) or "d" (diagonal) for spacing.
# --------------------------------------------------------------------------

def geo_glyphs(w, mono=False):
    G = {}
    hb = w * 0.9  # horizontal bars slightly lighter than stems
    wf = 0.8 if mono else 1.0

    def W(n):
        return n * wf if not mono else min(470, n * 0.78)

    def add(ch, parts, l="s", r="s"):
        contours = []
        for p in parts:
            contours.extend(p)
        G[ch] = (contours, l, r)

    slab = w * 0.9

    # ---- capitals --------------------------------------------------------
    Wd = W(700)
    rx, ry = Wd / 2, CAP / 2 + OS_
    add("O", [ring(rx, CAP / 2, rx, ry, w * 1.04)], "r", "r")
    add("C", [band(rx, CAP / 2, rx, ry, w * 1.04, 45, 315)], "r", "r")
    add("G", [band(rx, CAP / 2, rx, ry, w * 1.04, 38, 360), rect(rx, CAP / 2 - hb / 2, Wd, CAP / 2 + hb / 2), rect(Wd - w * 1.04, CAP / 2 - ry * 0.55, Wd, CAP / 2)], "r", "r")
    add("Q", [ring(rx, CAP / 2, rx, ry, w * 1.04), slant(Wd * 0.98, -70, Wd * 0.62, CAP * 0.28, w)], "r", "r")
    Wd = W(620)
    ryD = CAP / 2
    add("D", [rect(0, 0, w, CAP), rect(0, CAP - hb, Wd - ryD, CAP), rect(0, 0, Wd - ryD, hb), band(Wd - ryD, CAP / 2, ryD, ryD, w * 1.04, -90, 90)], "s", "r")
    Wd = W(560)
    ryt = CAP / 4 + w / 4
    ryb = CAP / 4 + w / 4
    xt = Wd * 0.9 - ryt
    xb = Wd - ryb * 1.08
    add("B", [rect(0, 0, w, CAP), rect(0, CAP - hb, xt, CAP), rect(0, CAP / 2 - hb / 2, max(xt, xb), CAP / 2 + hb / 2), rect(0, 0, xb, hb),
              band(xt, CAP - ryt, ryt, ryt, w, -90, 90), band(xb, ryb, ryb * 1.08, ryb, w, -90, 90)], "s", "r")
    ryp = (CAP - (CAP * 0.4 - hb / 2)) / 2
    xp = Wd - ryp
    add("P", [rect(0, 0, w, CAP), rect(0, CAP - hb, xp, CAP), rect(0, CAP - 2 * ryp, xp, CAP - 2 * ryp + hb), band(xp, CAP - ryp, ryp, ryp, w, -90, 90)], "s", "r")
    add("R", [rect(0, 0, w, CAP), rect(0, CAP - hb, xp, CAP), rect(0, CAP - 2 * ryp, xp, CAP - 2 * ryp + hb), band(xp, CAP - ryp, ryp, ryp, w, -90, 90),
              slant(Wd * 1.02 - w * 0.5, 0, xp * 0.92, CAP - 2 * ryp + hb * 0.5, w)], "s", "d")
    Wd = W(500)
    add("E", [rect(0, 0, w, CAP), rect(0, CAP - hb, Wd, CAP), rect(0, CAP / 2 - hb / 2, Wd * 0.88, CAP / 2 + hb / 2), rect(0, 0, Wd, hb)])
    add("F", [rect(0, 0, w, CAP), rect(0, CAP - hb, Wd, CAP), rect(0, CAP / 2 - hb / 2, Wd * 0.88, CAP / 2 + hb / 2)])
    add("L", [rect(0, 0, w, CAP), rect(0, 0, Wd * 0.94, hb)])
    Wd = W(640)
    add("H", [rect(0, 0, w, CAP), rect(Wd - w, 0, Wd, CAP), rect(0, CAP / 2 - hb / 2, Wd, CAP / 2 + hb / 2)])
    if mono:
        Wi = W(420)
        add("I", [rect(Wi / 2 - w / 2, 0, Wi / 2 + w / 2, CAP), rect(0, CAP - hb, Wi, CAP), rect(0, 0, Wi, hb)])
    else:
        add("I", [rect(0, 0, w, CAP)])
    Wd = W(470)
    rj = Wd / 2
    yj = rj * 0.95 - OS_
    add("J", [rect(Wd - w, yj, Wd, CAP), band(Wd - rj, yj, rj, rj * 0.95, w, -170, 0)], "r", "s")
    Wd = W(600)
    add("K", [rect(0, 0, w, CAP), slant(w * 0.7, CAP * 0.28, Wd - w * 0.45, CAP, w), slant(Wd - w * 0.4, 0, Wd * 0.34, CAP * 0.56, w)], "s", "d")
    Wd = W(800)
    add("M", [rect(0, 0, w, CAP), rect(Wd - w, 0, Wd, CAP), slant_fit(Wd / 2, 0, w * 0.5, CAP, w, align_t=("l", 0)), slant_fit(Wd / 2, 0, Wd - w * 0.5, CAP, w, align_t=("r", Wd))])
    Wd = W(660)
    add("N", [rect(0, 0, w, CAP), rect(Wd - w, 0, Wd, CAP), slant_fit(Wd - w * 0.5, 0, w * 0.5, CAP, w, align_b=("r", Wd), align_t=("l", 0))])
    Wd = W(560)
    rs = Wd / 2
    rys = (CAP + 2 * OS_ + w) / 4
    add("S", [band(rs, CAP + OS_ - rys, rs * 0.94, rys, w, 22, 270), band(rs, rys - OS_, rs, rys, w, -158, 90)], "r", "r")
    add("T", [rect(0, CAP - hb, Wd, CAP), rect(Wd / 2 - w / 2, 0, Wd / 2 + w / 2, CAP)], "d", "d")
    Wd = W(640)
    ru = Wd / 2
    yu = ru * 0.92 - OS_
    add("U", [rect(0, yu, w, CAP), rect(Wd - w, yu, Wd, CAP), band(ru, yu, ru, ru * 0.92, w, 180, 360)])
    Wd = W(660)
    add("V", [slant(Wd / 2, 0, w * 0.55, CAP, w), slant(Wd / 2, 0, Wd - w * 0.55, CAP, w)], "d", "d")
    Wd = W(960)
    add("W", [slant(Wd * 0.28, 0, w * 0.55, CAP, w), slant(Wd * 0.28, 0, Wd / 2, CAP, w), slant(Wd * 0.72, 0, Wd / 2, CAP, w), slant(Wd * 0.72, 0, Wd - w * 0.55, CAP, w)], "d", "d")
    Wd = W(640)
    add("X", [slant(w * 0.5, 0, Wd - w * 0.5, CAP, w), slant(Wd - w * 0.5, 0, w * 0.5, CAP, w)], "d", "d")
    add("Y", [slant(Wd / 2, CAP * 0.44, w * 0.55, CAP, w), slant(Wd / 2, CAP * 0.44, Wd - w * 0.55, CAP, w), rect(Wd / 2 - w / 2, 0, Wd / 2 + w / 2, CAP * 0.46)], "d", "d")
    Wd = W(580)
    add("Z", [rect(0, CAP - hb, Wd, CAP), rect(0, 0, Wd, hb), slant_fit(w * 0.55, hb * 0.5, Wd - w * 0.55, CAP - hb * 0.5, w, align_b=("l", 0), align_t=("r", Wd))], "d", "d")
    Wd = W(700)
    yA = CAP * 0.3
    fr = yA / CAP
    lx = Wd / 2 * fr + w * 0.45
    add("A", [slant(w * 0.45, 0, Wd / 2, CAP, w), slant(Wd - w * 0.45, 0, Wd / 2, CAP, w), rect(lx + w * 0.2, yA - hb / 2, Wd - lx - w * 0.2, yA + hb / 2)], "d", "d")

    # ---- lowercase -------------------------------------------------------
    Wd = W(540)
    ro = Wd / 2
    ryo = XH / 2 + OS_ * 0.8
    t = w * 1.02
    add("o", [ring(ro, XH / 2, ro, ryo, t)], "r", "r")
    add("c", [band(ro, XH / 2, ro, ryo, t, 48, 312)], "r", "r")
    add("e", [band(ro, XH / 2, ro, ryo, t, 0, 322), rect(t * 0.6, XH / 2 - hb * 0.45, Wd, XH / 2 + hb * 0.45)], "r", "r")
    add("a", [ring(ro, XH / 2, ro, ryo, t), rect(Wd - w, 0, Wd, XH)], "r", "s")
    add("d", [ring(ro, XH / 2, ro, ryo, t), rect(Wd - w, 0, Wd, ASC)], "r", "s")
    add("b", [ring(ro, XH / 2, ro, ryo, t), rect(0, 0, w, ASC)], "s", "r")
    add("p", [ring(ro, XH / 2, ro, ryo, t), rect(0, DESC, w, XH)], "s", "r")
    add("q", [ring(ro, XH / 2, ro, ryo, t), rect(Wd - w, DESC, Wd, XH)], "r", "s")
    ryg = ro * 0.62
    yg = DESC - OS_ + ryg
    add("g", [ring(ro, XH / 2, ro, ryo, t), rect(Wd - w, yg, Wd, XH), band(ro, yg, ro, ryg, w, -168, 0)], "r", "s")
    Wd = W(500)
    rn = Wd / 2
    ryn = min(rn, XH * 0.46)
    yn = XH + OS_ * 0.6 - ryn
    arch = [band(rn, yn, rn, ryn, w, 0, 180), rect(Wd - w, 0, Wd, yn)]
    add("n", [rect(0, 0, w, XH)] + arch)
    add("h", [rect(0, 0, w, ASC)] + arch)
    add("u", [rect(0, XH - yn if False else ryn - OS_ * 0.6, w, XH), band(rn, ryn - OS_ * 0.6, rn, ryn, w, 180, 360), rect(Wd - w, 0, Wd, XH)])
    Wd = W(800)
    rm = (Wd / 2 + w / 2) / 2
    rym = min(rm, XH * 0.46)
    ym = XH + OS_ * 0.6 - rym
    add("m", [rect(0, 0, w, XH), band(rm, ym, rm, rym, w, 0, 180), rect(Wd / 2 - w / 2, 0, Wd / 2 + w / 2, ym), band(Wd - rm, ym, rm, rym, w, 0, 180), rect(Wd - w, 0, Wd, ym)])
    Wd = W(330)
    rr = Wd * 0.82
    if mono:
        add("r", [rect(W(420) * 0.25 - w / 2, 0, W(420) * 0.25 + w / 2, XH), band(W(420) * 0.25 - w / 2 + rr, yn, rr, ryn, w, 62, 180), rect(0, 0, W(420) * 0.62, slab * 0.9)], "s", "r")
    else:
        add("r", [rect(0, 0, w, XH), band(rr, yn, rr, ryn, w, 64, 180)], "s", "r")
    dot_r = w * 0.64
    if mono:
        Wi = W(420)
        cx = Wi * 0.55
        add("i", [rect(cx - w / 2, 0, cx + w / 2, XH), rect(Wi * 0.12, XH - slab * 0.9, cx, XH), rect(0, 0, Wi, slab * 0.9), disc(cx, XH + 160, dot_r)])
        add("l", [rect(cx - w / 2, 0, cx + w / 2, ASC), rect(Wi * 0.12, ASC - slab * 0.9, cx, ASC), rect(0, 0, Wi, slab * 0.9)])
        rjl = Wi * 0.34
        yjl = DESC - OS_ + rjl
        add("j", [rect(cx - w / 2, yjl, cx + w / 2, XH), rect(Wi * 0.08, XH - slab * 0.9, cx, XH), band(cx + w / 2 - rjl, yjl, rjl, rjl, w, -170, 0), disc(cx, XH + 160, dot_r)])
    else:
        add("i", [rect(0, 0, w, XH), disc(w / 2, XH + 160, dot_r)])
        add("l", [rect(0, 0, w, ASC)])
        rjl = 150
        yjl = DESC - OS_ + rjl
        add("j", [rect(0, yjl, w, XH), band(w - rjl, yjl, rjl, rjl, w, -170, 0), disc(w / 2, XH + 160, dot_r)], "d", "s")
    Wd = W(320)
    rf = Wd * 0.62
    add("f", [rect(0, 0, w, ASC + OS_ - rf), band(rf, ASC + OS_ - rf, rf, rf, w, 32, 180), rect(-w * 0.8 if not mono else 0, XH - hb, rf * 1.45, XH)], "s", "r")
    add("t", [rect(Wd * 0.34 - w / 2, 0, Wd * 0.34 + w / 2, ASC * 0.86), rect(0, XH - hb, Wd, XH)] + ([rect(Wd * 0.34, 0, Wd * 1.05, slab * 0.9)] if mono else []), "d", "d")
    Wd = W(480)
    add("k", [rect(0, 0, w, ASC), slant(w * 0.7, XH * 0.22, Wd - w * 0.45, XH, w), slant(Wd - w * 0.4, 0, Wd * 0.36, XH * 0.56, w)], "s", "d")
    Wd = W(520)
    add("v", [slant(Wd / 2, 0, w * 0.55, XH, w), slant(Wd / 2, 0, Wd - w * 0.55, XH, w)], "d", "d")
    add("x", [slant(w * 0.5, 0, Wd - w * 0.5, XH, w), slant(Wd - w * 0.5, 0, w * 0.5, XH, w)], "d", "d")
    add("y", [slant(Wd * 0.53, 0, w * 0.55, XH, w), slant(Wd * 0.2, DESC, Wd - w * 0.55, XH, w)], "d", "d")
    Wd = W(780)
    add("w", [slant(Wd * 0.28, 0, w * 0.55, XH, w), slant(Wd * 0.28, 0, Wd / 2, XH, w), slant(Wd * 0.72, 0, Wd / 2, XH, w), slant(Wd * 0.72, 0, Wd - w * 0.55, XH, w)], "d", "d")
    Wd = W(460)
    add("z", [rect(0, XH - hb, Wd, XH), rect(0, 0, Wd, hb), slant_fit(w * 0.55, hb * 0.5, Wd - w * 0.55, XH - hb * 0.5, w, align_b=("l", 0), align_t=("r", Wd))], "d", "d")
    Wd = W(430)
    rsx = Wd / 2
    rsy = (XH + 2 * OS_ * 0.8 + w) / 4
    add("s", [band(rsx, XH + OS_ * 0.8 - rsy, rsx * 0.94, rsy, w, 22, 270), band(rsx, rsy - OS_ * 0.8, rsx, rsy, w, -158, 90)], "r", "r")

    # ---- figures ---------------------------------------------------------
    Wd = W(580)
    add("zero", [ring(Wd / 2, CAP / 2, Wd / 2, CAP / 2 + OS_, w * 1.04)] + ([slant(Wd * 0.34, CAP * 0.3, Wd * 0.66, CAP * 0.7, w * 0.8)] if mono else []), "r", "r")
    Wd = W(420)
    one = [rect(Wd * 0.58 - w / 2, 0, Wd * 0.58 + w / 2, CAP), flat(Wd * 0.08, CAP * 0.74, Wd * 0.58, CAP - w * 0.3, w * 0.9)]
    if mono:
        one.append(rect(Wd * 0.18, 0, Wd * 0.98, slab * 0.9))
    add("one", one, "d", "s")
    Wd = W(540)
    r2 = Wd / 2
    ry2 = CAP * 0.27
    c2 = CAP + OS_ - ry2
    ex, ey = _pt(r2, c2, r2 - w / 2, ry2 - w / 2, -30)
    add("two", [band(r2, c2, r2, ry2, w, -40, 158), slant_fit(w * 0.55, hb * 0.5, ex, ey, w, align_b=("l", 0)), rect(0, 0, Wd, hb)], "r", "s")
    ryu = (CAP + 2 * OS_ + w) / 4 - 8
    ryl = (CAP + 2 * OS_ + w) / 4 + 8
    add("three", [band(Wd / 2, CAP + OS_ - ryu, Wd / 2 * 0.92, ryu, w, -90, 150), band(Wd / 2, ryl - OS_, Wd / 2, ryl, w, -150, 90)], "r", "r")
    Wd = W(600)
    add("four", [slant_fit(w * 0.35, CAP * 0.25 + hb * 0.5, Wd * 0.7, CAP, w, align_b=("l", 0)), rect(0, CAP * 0.25, Wd, CAP * 0.25 + hb), rect(Wd * 0.7 - w / 2, 0, Wd * 0.7 + w / 2, CAP)], "d", "s")
    Wd = W(540)
    ry5 = CAP * 0.33
    add("five", [rect(Wd * 0.1, CAP - hb, Wd * 0.95, CAP), rect(Wd * 0.1, ry5 * 1.5 - OS_ - w * 0.3, Wd * 0.1 + w, CAP), band(Wd / 2, ry5 - OS_, Wd / 2, ry5, w, -150, 150)], "s", "r")
    ry6 = CAP * 0.3
    add("six", [ring(Wd / 2, ry6 - OS_ * 0.5, Wd / 2, ry6, w), band(Wd * 0.6, ry6, Wd * 0.6, CAP - ry6 + OS_, w, 78, 180)], "r", "r")
    add("nine", [ring(Wd / 2, CAP - ry6 + OS_ * 0.5, Wd / 2, ry6, w), band(Wd * 0.4, CAP - ry6, Wd * 0.6, CAP - ry6 + OS_, w, -102, 0)], "r", "r")
    add("seven", [rect(0, CAP - hb, Wd, CAP), slant_fit(Wd * 0.32, 0, Wd - w * 0.55, CAP - hb * 0.5, w, align_t=("r", Wd))], "d", "d")
    ry8t = CAP * 0.23
    ry8b = CAP * 0.29 + w * 0.25
    add("eight", [ring(Wd / 2, CAP + OS_ - ry8t, Wd * 0.42, ry8t, w), ring(Wd / 2, ry8b - OS_, Wd / 2, ry8b, w)], "r", "r")

    # ---- punctuation and symbols ----------------------------------------
    pr = w * 0.64
    add("period", [disc(pr, pr, pr)], "r", "r")
    add("comma", [disc(pr, pr, pr), slant(pr * 0.4, -150, pr * 1.3, pr * 0.8, w * 0.72)], "r", "r")
    add("colon", [disc(pr, pr, pr), disc(pr, XH - pr, pr)], "r", "r")
    add("semicolon", [disc(pr, XH - pr, pr), disc(pr, pr, pr), slant(pr * 0.4, -150, pr * 1.3, pr * 0.8, w * 0.72)], "r", "r")
    add("exclam", [rect(pr - w / 2, CAP * 0.3, pr + w / 2, CAP), disc(pr, pr, pr)], "r", "r")
    Wd = W(480)
    rq = Wd / 2
    ryq = CAP * 0.26
    cq = CAP + OS_ - ryq
    add("question", [band(rq, cq, rq, ryq, w, -60, 162), rect(rq - w / 2, CAP * 0.3, rq + w / 2, cq - ryq + w * 0.6), disc(rq, pr, pr)], "r", "r")
    add("quotesingle", [rect(0, CAP * 0.72, w, CAP)])
    add("quotedbl", [rect(0, CAP * 0.72, w, CAP), rect(w * 2.4, CAP * 0.72, w * 3.4, CAP)])
    add("quoteright", [disc(pr, CAP - pr, pr), slant(pr * 0.4, CAP - 150 - pr * 2 + pr * 0.8, pr * 1.3, CAP - pr * 1.2, w * 0.72)], "r", "r")
    add("quoteleft", [disc(pr, CAP - pr * 2.2, pr), slant(pr * 0.7, CAP - pr * 1.4, pr * 1.6, CAP + 60, w * 0.72)], "r", "r")
    add("quotedblright", [disc(pr, CAP - pr, pr), slant(pr * 0.4, CAP - 150 - pr * 1.2, pr * 1.3, CAP - pr * 1.2, w * 0.72), disc(pr * 3.4, CAP - pr, pr), slant(pr * 2.8, CAP - 150 - pr * 1.2, pr * 3.7, CAP - pr * 1.2, w * 0.72)], "r", "r")
    add("quotedblleft", [disc(pr, CAP - pr * 2.2, pr), slant(pr * 0.7, CAP - pr * 1.4, pr * 1.6, CAP + 60, w * 0.72), disc(pr * 3.4, CAP - pr * 2.2, pr), slant(pr * 3.1, CAP - pr * 1.4, pr * 4.0, CAP + 60, w * 0.72)], "r", "r")
    add("hyphen", [rect(0, XH * 0.5 - hb * 0.45, W(300), XH * 0.5 + hb * 0.45)])
    add("endash", [rect(0, XH * 0.5 - hb * 0.45, W(500), XH * 0.5 + hb * 0.45)])
    add("emdash", [rect(0, XH * 0.5 - hb * 0.45, 1000 - 60 if not mono else W(600), XH * 0.5 + hb * 0.45)])
    add("underscore", [rect(0, -140, W(520), -140 + hb)])
    Wd = W(280)
    add("parenleft", [band(Wd * 1.05, CAP * 0.36, Wd * 1.05, CAP * 0.66, w, 118, 242)], "r", "s")
    add("parenright", [band(-Wd * 0.05, CAP * 0.36, Wd * 1.05, CAP * 0.66, w, -62, 62)], "s", "r")
    add("bracketleft", [rect(0, DESC * 0.6, w, CAP + 40), rect(0, CAP + 40 - hb, Wd, CAP + 40), rect(0, DESC * 0.6, Wd, DESC * 0.6 + hb)])
    add("bracketright", [rect(Wd - w, DESC * 0.6, Wd, CAP + 40), rect(0, CAP + 40 - hb, Wd, CAP + 40), rect(0, DESC * 0.6, Wd, DESC * 0.6 + hb)])
    Wd = W(320)
    mid = CAP * 0.36
    add("braceleft", [rect(Wd * 0.32, mid + w * 0.6, Wd * 0.32 + w, CAP + 20), rect(Wd * 0.32, CAP + 20 - hb, Wd, CAP + 20), rect(Wd * 0.32, DESC * 0.5, Wd * 0.32 + w, mid - w * 0.6), rect(Wd * 0.32, DESC * 0.5, Wd, DESC * 0.5 + hb), flat(0, mid, Wd * 0.32 + w, mid + w * 0.8, w * 0.9), flat(0, mid, Wd * 0.32 + w, mid - w * 0.8, w * 0.9)])
    add("braceright", [rect(Wd * 0.68 - w, mid + w * 0.6, Wd * 0.68, CAP + 20), rect(0, CAP + 20 - hb, Wd * 0.68, CAP + 20), rect(Wd * 0.68 - w, DESC * 0.5, Wd * 0.68, mid - w * 0.6), rect(0, DESC * 0.5, Wd * 0.68, DESC * 0.5 + hb), flat(Wd * 0.68 - w, mid + w * 0.8, Wd, mid, w * 0.9), flat(Wd * 0.68 - w, mid - w * 0.8, Wd, mid, w * 0.9)])
    add("bar", [rect(0, DESC, w, ASC)])
    Wd = W(400)
    add("slash", [slant(0, DESC * 0.5, Wd, CAP + 30, w)], "d", "d")
    add("backslash", [slant(Wd, DESC * 0.5, 0, CAP + 30, w)], "d", "d")
    Wd = W(500)
    cyp = XH * 0.5 + 20
    add("plus", [rect(0, cyp - hb / 2, Wd, cyp + hb / 2), rect(Wd / 2 - w / 2, cyp - Wd / 2, Wd / 2 + w / 2, cyp + Wd / 2)])
    add("equal", [rect(0, cyp + 70, Wd, cyp + 70 + hb), rect(0, cyp - 70 - hb, Wd, cyp - 70)])
    add("less", [flat(0, cyp, Wd, cyp + 190, w * 0.95), flat(0, cyp, Wd, cyp - 190, w * 0.95)], "d", "d")
    add("greater", [flat(0, cyp + 190, Wd, cyp, w * 0.95), flat(0, cyp - 190, Wd, cyp, w * 0.95)], "d", "d")
    add("asciicircum", [slant(0, CAP * 0.5, Wd / 2, CAP, w * 0.9), slant(Wd, CAP * 0.5, Wd / 2, CAP, w * 0.9)], "d", "d")
    add("asciitilde", [band(Wd * 0.27, cyp - 10, Wd * 0.27, 70, w * 0.9, 20, 180), band(Wd * 0.73, cyp + 10, Wd * 0.27, 70, w * 0.9, 200, 360)], "r", "r")
    add("grave", [slant(W(260) * 0.8, CAP * 0.78, W(260) * 0.2, CAP + 40, w * 0.85)], "d", "d")
    Wd = W(760)
    add("percent", [ring(Wd * 0.2, CAP * 0.78, Wd * 0.2, CAP * 0.22, w * 0.85), ring(Wd * 0.8, CAP * 0.22, Wd * 0.2, CAP * 0.22, w * 0.85), slant(Wd * 0.22, 0, Wd * 0.78, CAP, w * 0.85)], "r", "r")
    Wd = W(620)
    add("numbersign", [slant(Wd * 0.28, 0, Wd * 0.42, CAP, w * 0.9), slant(Wd * 0.62, 0, Wd * 0.76, CAP, w * 0.9), rect(0, CAP * 0.32, Wd * 0.94, CAP * 0.32 + hb), rect(Wd * 0.06, CAP * 0.64, Wd, CAP * 0.64 + hb)], "d", "d")
    Wd = W(560)
    add("dollar", [band(Wd / 2, CAP + OS_ - rys, Wd / 2 * 0.94, rys, w, 22, 270), band(Wd / 2, rys - OS_, Wd / 2, rys, w, -158, 90), rect(Wd / 2 - w * 0.4, -90, Wd / 2 + w * 0.4, CAP + 90)], "r", "r")
    Wd = W(380)
    cxa, cya, la = Wd / 2, CAP * 0.72, Wd * 0.95
    add("asterisk", [bar(cxa, cya, la, w * 0.85, 90), bar(cxa, cya, la, w * 0.85, 30), bar(cxa, cya, la, w * 0.85, 150)], "d", "d")
    Wd = W(700)
    add("ampersand", [ring(Wd * 0.36, CAP * 0.76, Wd * 0.2, CAP * 0.22, w * 0.95), band(Wd * 0.4, CAP * 0.28, Wd * 0.4, CAP * 0.28 + OS_, w, 60, 330), slant(Wd * 0.98, 0, Wd * 0.24, CAP * 0.6, w)], "r", "d")
    Wd = W(860)
    ca = CAP * 0.36
    add("at", [band(Wd / 2, ca, Wd / 2, CAP * 0.62, w * 0.8, -40, 332), ring(Wd * 0.47, ca, Wd * 0.17, CAP * 0.2, w * 0.85), rect(Wd * 0.64 - w * 0.85, ca - CAP * 0.2, Wd * 0.64, ca + CAP * 0.2)], "r", "r")
    G[" "] = ([], "s", "s")
    return G


NAMES = {" ": "space", ".": "period", ",": "comma", ":": "colon", ";": "semicolon", "!": "exclam", "?": "question", "'": "quotesingle", '"': "quotedbl",
         "-": "hyphen", "(": "parenleft", ")": "parenright", "[": "bracketleft", "]": "bracketright", "{": "braceleft", "}": "braceright", "|": "bar",
         "/": "slash", "\\": "backslash", "+": "plus", "=": "equal", "<": "less", ">": "greater", "^": "asciicircum", "~": "asciitilde", "`": "grave",
         "%": "percent", "#": "numbersign", "$": "dollar", "*": "asterisk", "&": "ampersand", "@": "at", "_": "underscore",
         "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine"}
UNI = {"endash": 0x2013, "emdash": 0x2014, "quoteleft": 0x2018, "quoteright": 0x2019, "quotedblleft": 0x201C, "quotedblright": 0x201D}


def glyph_name(key):
    if len(key) == 1:
        return NAMES.get(key, key)
    return key


def unicode_of(key):
    if len(key) == 1:
        return ord(key)
    if key in UNI:
        return UNI[key]
    rev = {v: k for k, v in NAMES.items()}
    return ord(rev[key]) if key in rev else None


# --------------------------------------------------------------------------
# Blockhaus Pixel: a 5 x 7 grid, pixels merged into horizontal runs.
# Rows run top to bottom; DESCENDERS adds two rows below the baseline.
# --------------------------------------------------------------------------

PIXELS = {
    "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
    '"': [".#.#.", ".#.#.", ".....", ".....", ".....", ".....", "....."],
    "#": [".#.#.", ".#.#.", "#####", ".#.#.", "#####", ".#.#.", ".#.#."],
    "$": ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."],
    "%": ["##...", "##..#", "...#.", "..#..", ".#...", "#..##", "...##"],
    "&": [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
    "'": ["..#..", "..#..", ".....", ".....", ".....", ".....", "....."],
    "(": ["...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#."],
    ")": [".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#..."],
    "*": [".....", "..#..", "#.#.#", ".###.", "#.#.#", "..#..", "....."],
    "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
    ",": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
    "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
    ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
    "/": [".....", "....#", "...#.", "..#..", ".#...", "#....", "....."],
    "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    "1": ["..#..", ".##..", "#.#..", "..#..", "..#..", "..#..", "#####"],
    "2": [".###.", "#...#", "....#", "..##.", ".#...", "#....", "#####"],
    "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
    "4": ["#..#.", "#..#.", "#..#.", "#####", "...#.", "...#.", "...#."],
    "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
    "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
    "7": ["#####", "....#", "...#.", "..#..", "..#..", "..#..", "..#.."],
    "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
    "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
    ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
    ";": [".....", ".##..", ".##..", ".....", ".....", ".##..", ".##.."],
    "<": ["...#.", "..#..", ".#...", "#....", ".#...", "..#..", "...#."],
    "=": [".....", ".....", "#####", ".....", "#####", ".....", "....."],
    ">": [".#...", "..#..", "...#.", "....#", "...#.", "..#..", ".#..."],
    "?": [".###.", "#...#", "....#", "..##.", "..#..", ".....", "..#.."],
    "@": [".###.", "#...#", "#.###", "#.#.#", "#.###", "#....", ".####"],
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
    "C": [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
    "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
    "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
    "G": [".####", "#....", "#....", "#..##", "#...#", "#...#", ".###."],
    "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "I": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
    "J": ["....#", "....#", "....#", "....#", "....#", "#...#", ".###."],
    "K": ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
    "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
    "N": ["#...#", "##..#", "##..#", "#.#.#", "#..##", "#..##", "#...#"],
    "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    "Q": [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
    "R": ["####.", "#...#", "#...#", "####.", "#..#.", "#...#", "#...#"],
    "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "V": ["#...#", "#...#", "#...#", ".#.#.", ".#.#.", ".#.#.", "..#.."],
    "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
    "X": ["#...#", ".#.#.", ".#.#.", "..#..", ".#.#.", ".#.#.", "#...#"],
    "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
    "Z": ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
    "[": [".###.", ".#...", ".#...", ".#...", ".#...", ".#...", ".###."],
    "\\": [".....", "#....", ".#...", "..#..", "...#.", "....#", "....."],
    "]": [".###.", "...#.", "...#.", "...#.", "...#.", "...#.", ".###."],
    "^": ["..#..", ".#.#.", "#...#", ".....", ".....", ".....", "....."],
    "_": [".....", ".....", ".....", ".....", ".....", ".....", "#####"],
    "`": [".#...", "..#..", ".....", ".....", ".....", ".....", "....."],
    "a": [".....", ".....", ".###.", "....#", ".####", "#...#", ".####"],
    "b": ["#....", "#....", "####.", "#...#", "#...#", "#...#", "####."],
    "c": [".....", ".....", ".####", "#....", "#....", "#....", ".####"],
    "d": ["....#", "....#", ".####", "#...#", "#...#", "#...#", ".####"],
    "e": [".....", ".....", ".###.", "#...#", "#####", "#....", ".####"],
    "f": ["..##.", ".#...", "####.", ".#...", ".#...", ".#...", ".#..."],
    "g": [".....", ".....", ".####", "#...#", "#...#", "#...#", ".####"],
    "h": ["#....", "#....", "####.", "#...#", "#...#", "#...#", "#...#"],
    "i": ["..#..", ".....", ".##..", "..#..", "..#..", "..#..", ".###."],
    "j": ["...#.", ".....", "..##.", "...#.", "...#.", "...#.", "...#."],
    "k": ["#....", "#....", "#..#.", "#.#..", "##...", "#.#..", "#..#."],
    "l": [".##..", "..#..", "..#..", "..#..", "..#..", "..#..", "..##."],
    "m": [".....", ".....", "##.#.", "#.#.#", "#.#.#", "#.#.#", "#.#.#"],
    "n": [".....", ".....", "####.", "#...#", "#...#", "#...#", "#...#"],
    "o": [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
    "p": [".....", ".....", "####.", "#...#", "#...#", "#...#", "####."],
    "q": [".....", ".....", ".####", "#...#", "#...#", "#...#", ".####"],
    "r": [".....", ".....", "#.##.", "##...", "#....", "#....", "#...."],
    "s": [".....", ".....", ".####", "#....", ".###.", "....#", "####."],
    "t": [".#...", ".#...", "####.", ".#...", ".#...", ".#...", "..##."],
    "u": [".....", ".....", "#...#", "#...#", "#...#", "#...#", ".####"],
    "v": [".....", ".....", "#...#", "#...#", ".#.#.", ".#.#.", "..#.."],
    "w": [".....", ".....", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
    "x": [".....", ".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    "y": [".....", ".....", "#...#", "#...#", "#...#", "#...#", ".####"],
    "z": [".....", ".....", "#####", "...#.", "..#..", ".#...", "#####"],
    "{": ["..##.", ".#...", ".#...", "#....", ".#...", ".#...", "..##."],
    "|": ["..#..", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "}": [".##..", "...#.", "...#.", "....#", "...#.", "...#.", ".##.."],
    "~": [".....", ".....", ".#...", "#.#.#", "...#.", ".....", "....."],
}
DESCENDERS = {
    ",": [".#...", "....."], ";": [".#...", "....."],
    "g": ["....#", ".###."], "j": ["#..#.", ".##.."], "p": ["#....", "#...."], "q": ["....#", "....#"], "y": ["....#", ".###."],
}


def pixel_glyphs():
    P = 100
    G = {}
    for ch, rows in PIXELS.items():
        rows = rows + DESCENDERS.get(ch, [])
        contours = []
        for i, row in enumerate(rows):
            y = (6 - i) * P
            x = 0
            while x < 5:
                if row[x] == "#":
                    start = x
                    while x < 5 and row[x] == "#":
                        x += 1
                    contours.extend(rect(start * P, y, x * P, y + P))
                else:
                    x += 1
        G[ch] = contours
    G[" "] = []
    return G


# --------------------------------------------------------------------------
# Font assembly
# --------------------------------------------------------------------------

def draw_charstring(contours, advance):
    pen = T2CharStringPen(advance, None)
    for c in contours:
        for s in c:
            if s[0] == "M":
                pen.moveTo(s[1])
            elif s[0] == "L":
                pen.lineTo(s[1])
            else:
                pen.curveTo(s[1], s[2], s[3])
        pen.closePath()
    return pen.getCharString()


def notdef(advance):
    return [rect(60, 0, advance - 60, CAP)[0], [("M", (advance - 110, 50)), ("L", (110, 50)), ("L", (110, CAP - 50)), ("L", (advance - 110, CAP - 50))]]


def build_font(path_stem, family, style, weight_class, glyphs, spacing, mono_advance=None, kern=None, is_bold=False):
    order = [".notdef"]
    cmap = {}
    charstrings = {}
    metrics = {}
    adv_nd = mono_advance or 600
    charstrings[".notdef"] = draw_charstring(notdef(adv_nd), adv_nd)
    metrics[".notdef"] = (adv_nd, 60)
    extra_space = {}
    for key, entry in glyphs.items():
        name = glyph_name(key)
        contours, lside, rside = entry
        pts = list(_points(contours))
        if pts:
            xmin = min(p[0] for p in pts)
            xmax = max(p[0] for p in pts)
        else:
            xmin = xmax = 0
        if mono_advance:
            body = xmax - xmin
            lsb = (mono_advance - body) / 2
            contours = _shift(contours, lsb - xmin)
            advance = mono_advance
        else:
            lsb = spacing[lside]
            contours = _shift(contours, lsb - xmin)
            advance = round(lsb + (xmax - xmin) + spacing[rside]) if pts else spacing["space"]
        charstrings[name] = draw_charstring(contours, advance)
        metrics[name] = (int(advance), int(round(lsb)) if pts else 0)
        order.append(name)
        u = unicode_of(key)
        if u is not None:
            cmap[u] = name
    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    ps_family = family.replace(" ", "")
    ps_name = f"{ps_family}-{style.replace(' ', '')}"
    ribbi = style in ("Regular", "Bold")
    legacy_family = family if ribbi else f"{family} {style}"
    legacy_style = style if ribbi else "Regular"
    fb.setupCFF(ps_name, {"FullName": f"{family} {style}", "FamilyName": family, "Weight": style}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASC + 60, descent=DESC - 40)
    names = {
        "copyright": COPYRIGHT,
        "familyName": legacy_family,
        "styleName": legacy_style,
        "uniqueFontIdentifier": f"{VERSION};{VENDOR};{ps_name}",
        "fullName": f"{family} {style}",
        "version": f"Version {VERSION}",
        "psName": ps_name,
        "manufacturer": "DistroSource",
        "designer": "DistroSource Type",
        "description": f"{family} {style}, a DistroSource Original typeface.",
        "vendorURL": "https://www.distrosource.com",
        "licenseDescription": "Licensed under the DistroSource font licence included with your download (Personal, Commercial or Agency).",
    }
    if not ribbi:
        names["typographicFamily"] = family
        names["typographicSubfamily"] = style
    fb.setupNameTable(names)
    fs_selection = 0x20 if style == "Bold" else 0x40
    fb.setupOS2(
        version=4,
        sTypoAscender=ASC, sTypoDescender=DESC, sTypoLineGap=200, usWinAscent=ASC + 80, usWinDescent=-DESC + 60,
        sxHeight=XH, sCapHeight=CAP, achVendID=VENDOR, usWeightClass=weight_class, fsSelection=fs_selection | 0x80, fsType=0,
        ulUnicodeRange1=1, ulCodePageRange1=1,
    )
    fb.setupPost(isFixedPitch=1 if mono_advance else 0)
    if is_bold:
        fb.font["head"].macStyle = 1
    if kern:
        addOpenTypeFeaturesFromString(fb.font, kern)
    os.makedirs(os.path.dirname(path_stem), exist_ok=True)
    fb.save(path_stem + ".otf")
    woff = TTFont(path_stem + ".otf")
    woff.flavor = "woff2"
    woff.save(path_stem + ".woff2")
    return len(order)


KERN = """
languagesystem DFLT dflt;
languagesystem latn dflt;
feature kern {
  pos A V -70; pos A W -45; pos A Y -70; pos A T -55; pos A v -40; pos A y -40;
  pos L T -70; pos L V -70; pos L Y -70; pos L W -45;
  pos T A -55; pos T o -70; pos T a -70; pos T e -70; pos T comma -80; pos T period -80; pos T r -40; pos T u -40;
  pos V A -70; pos V o -45; pos V a -45; pos V e -45; pos V comma -70; pos V period -70;
  pos W A -45; pos W o -30; pos W a -30; pos W period -50;
  pos Y A -70; pos Y o -70; pos Y a -70; pos Y e -70; pos Y period -80; pos Y comma -80;
  pos F A -45; pos F period -80; pos F comma -80; pos P A -45; pos P period -90; pos P comma -90;
  pos r period -50; pos r comma -50; pos v period -40; pos y period -40; pos w period -30;
  pos f o -15; pos o v -10; pos o y -10;
} kern;
"""


def main():
    results = []
    meridian = os.path.join(OUT, "meridian-sans-geometric-typeface-family", "fonts")
    for style, weight, w in [("Light", 300, 48), ("Regular", 400, 80), ("Medium", 500, 104), ("Bold", 700, 134)]:
        g = geo_glyphs(w)
        sb = 30 + w * 0.55
        spacing = {"s": sb + 22, "r": sb - 4, "d": 14 + w * 0.12, "space": 250}
        n = build_font(os.path.join(meridian, f"MeridianSans-{style}"), "Meridian Sans", style, weight, g, spacing, kern=KERN, is_bold=style == "Bold")
        results.append(f"Meridian Sans {style}: {n} glyphs")

    rivet = os.path.join(OUT, "rivet-mono-coding-typeface", "fonts")
    for style, weight, w in [("Regular", 400, 74), ("Bold", 700, 118)]:
        g = geo_glyphs(w, mono=True)
        n = build_font(os.path.join(rivet, f"RivetMono-{style}"), "Rivet Mono", style, weight, g, None, mono_advance=600, is_bold=style == "Bold")
        results.append(f"Rivet Mono {style}: {n} glyphs")

    pixel = os.path.join(OUT, "blockhaus-pixel-display-font", "fonts")
    pg = {k: (v, "s", "s") for k, v in pixel_glyphs().items()}
    n = build_font(os.path.join(pixel, "BlockhausPixel-Regular"), "Blockhaus Pixel", "Regular", 400, pg, None, mono_advance=600)
    results.append(f"Blockhaus Pixel Regular: {n} glyphs")
    print("\n".join(results))


if __name__ == "__main__":
    main()
