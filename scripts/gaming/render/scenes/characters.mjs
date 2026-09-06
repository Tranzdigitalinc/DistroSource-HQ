/**
 * Character, clothing and weapon scenes: a neutral studio with articulated
 * mannequins (clothing, peds, animation poses) and modelled weapons.
 *
 * The mannequin is deliberately a mannequin — a jointed grey figure that
 * wears the garment — because that is how clothing and animation products
 * are honestly shown: the garment, the pose, the silhouette, without
 * pretending to be a photograph of a person.
 *
 * NOTE: the CHAR runtime lives inside a String.raw literal — never put a
 * backtick in it, it terminates the literal and breaks the module.
 */
import { threeDoc } from "./three.mjs"

/* ------------------------------------------------------------- runtime */

const CHAR = String.raw`
import {box,cyl,group,mat,THREE} from "rt";

function capsule(r,len,m,seg=14){const g=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r*0.92,len,seg),m);c.castShadow=true;c.receiveShadow=true;g.add(c);
  const a=new THREE.Mesh(new THREE.SphereGeometry(r,seg,seg),m);a.position.y=len/2;a.castShadow=true;g.add(a);const b=new THREE.Mesh(new THREE.SphereGeometry(r*0.92,seg,seg),m);b.position.y=-len/2;b.castShadow=true;g.add(b);return g;}

/* Named poses: joint rotations in radians. sx = shoulder pitch (forward +),
   sz = shoulder roll (out +), e = elbow bend, hx = hip pitch, k = knee bend. */
export const POSES={
  idle:{},
  walk:{sxL:0.5,sxR:-0.5,hxL:-0.45,hxR:0.45,kL:0.6,kR:0.1,eL:0.4,eR:0.6},
  wave:{sxR:2.6,szR:0.35,eR:-0.9,sxL:0.1},
  point:{sxR:1.5,eR:0.05,sxL:0.15},
  salute:{sxR:2.2,szR:0.9,eR:-2.3,sxL:0.05},
  crossed:{sxL:0.9,sxR:0.9,eL:1.6,eR:1.6,szL:-0.5,szR:-0.5},
  hipsL:{szL:0.5,eL:1.4,szR:0.5,eR:1.4},
  sit:{hxL:-1.55,hxR:-1.55,kL:1.5,kR:1.5,sxL:0.6,sxR:0.6,eL:0.9,eR:0.9,y:-0.44},
  kneel:{hxL:-1.5,hxR:0.0,kL:1.5,kR:1.55,sxL:0.9,sxR:0.9,eL:0.9,eR:0.9,y:-0.42},
  crouch:{hxL:-1.6,hxR:-1.6,kL:2.3,kR:2.3,spine:0.5,sxL:0.6,sxR:0.6,eL:1.2,eR:1.2,y:-0.62},
  lean:{spine:-0.12,hxL:0.2,kL:0.35,sxL:0.3,szL:0.2,eL:1.2,szR:0.15},
  handshake:{sxR:1.1,eR:0.5,sxL:0.1},
  cuffed:{sxL:-0.6,sxR:-0.6,szL:-0.2,szR:-0.2,eL:1.2,eR:1.2},
  dance:{sxL:2.3,szL:0.6,eL:-0.6,sxR:0.7,szR:0.9,eR:1.5,hxL:0.0,hxR:-0.5,kR:0.9,spine:-0.08},
  carry:{sxL:1.3,sxR:1.3,eL:1.5,eR:1.5,szL:-0.15,szR:-0.15},
  inspect:{spine:0.5,sxL:1.4,sxR:1.6,eL:0.5,eR:0.4},
  treat:{hxL:-1.5,hxR:0.0,kL:1.5,kR:1.55,sxL:1.4,sxR:1.5,eL:0.4,eR:0.5,spine:0.35,y:-0.42},
  search:{sxL:1.0,sxR:1.3,eL:0.9,eR:0.6,spine:0.2},
  phone:{sxR:0.4,szR:0.35,eR:2.4},
  lookback:{head:0.9,spine:-0.05,szL:0.15,szR:0.15},
};

/* Neutral articulated mannequin, 1.8 m tall at scale 1. Clothing is applied
   as colours per body region; accessories are simple solids. */
export function mannequin(s,x,z,rot=0,o={}){
  const P=Object.assign({},POSES[o.pose]||{},o.poseOverride||{});
  const {skin=0xcfc9c1,top=0x8a8f96,sleeves="long",bottom=0x4a4f57,shorts=false,shoes=0x2a2d33,hair=null,hairStyle="short",hat=null,vest=null,belt=0x23262b,accent=null,patch=null,epaulettes=0,female=false,scale=1,build=1,tie=null,reflective=false,glove=null,helmet=null,gloss=false}=o;
  const g=group(x,(P.y||0)*scale,z,rot);g.scale.setScalar(scale);
  const skinM=mat.std(skin,{roughness:0.75});const topM=mat.std(top,{roughness:gloss?0.45:0.85});const botM=mat.std(bottom,{roughness:0.85});const shoeM=mat.std(shoes,{roughness:0.5});
  const shW=(female?0.36:0.44)*build,hipW=female?0.36:0.34,chestD=0.22*build;
  // pelvis + torso pivot
  const spine=group(0,0.92,0);spine.rotation.x=P.spine||0;g.add(spine);
  spine.add(box(hipW,0.2,0.22,botM,0,0.06,0));
  spine.add(box(hipW+0.02,0.05,0.24,mat.std(belt,{roughness:0.5}),0,0.17,0,false));
  const torso=box(shW,0.5,chestD,topM,0,0.42,0);spine.add(torso);
  if(female)spine.add(box(shW*0.9,0.2,chestD*1.1,topM,0,0.5,0.02));
  if(vest!==null){spine.add(box(shW+0.06,0.4,chestD+0.08,mat.std(vest,{roughness:0.8}),0,0.4,0));
    if(reflective){spine.add(box(shW+0.07,0.05,chestD+0.09,mat.std(0xdfe3e6,{roughness:0.3}),0,0.5,0,false));spine.add(box(shW+0.07,0.05,chestD+0.09,mat.std(0xdfe3e6,{roughness:0.3}),0,0.3,0,false));}}
  if(accent!==null)spine.add(box(shW+0.01,0.06,chestD+0.01,mat.std(accent,{roughness:0.7}),0,0.55,0,false));
  if(tie!==null)spine.add(box(0.05,0.3,0.02,mat.std(tie,{roughness:0.6}),0,0.45,chestD/2+0.01,false));
  if(patch!==null){spine.add(box(0.06,0.06,0.02,mat.std(patch,{roughness:0.6}),shW/2-0.02,0.58,chestD/2+0.005,false));}
  for(let i=0;i<epaulettes;i++)for(const sd of[-1,1])spine.add(box(0.03,0.012,0.08,mat.std(0xe8c46a,{roughness:0.35,metalness:0.2}),sd*(shW/2-0.06-i*0.045),0.675,0,false));
  // neck + head
  spine.add(cyl(0.055,0.06,0.1,skinM,0,0.72,0,12));
  const head=group(0,0.78,0);head.rotation.y=P.head||0;spine.add(head);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(0.115,20,18),skinM);hd.position.y=0.11;hd.scale.set(0.92,1.08,0.95);hd.castShadow=true;head.add(hd);
  // Hair is a cap over the crown only: the face stays open.
  if(hair!==null){const hm=mat.std(hair,{roughness:0.95});const cap=(r,th,sy)=>{const h=new THREE.Mesh(new THREE.SphereGeometry(r,18,16,0,Math.PI*2,0,Math.PI*th),hm);h.position.y=0.115;h.scale.set(0.95,sy,0.98);return h;};
    if(hairStyle==="short"){head.add(cap(0.121,0.42,1.08));}
    else if(hairStyle==="long"){head.add(cap(0.123,0.46,1.08));head.add(box(0.19,0.3,0.06,hm,0,0.0,-0.09,false));}
    else if(hairStyle==="bun"){head.add(cap(0.121,0.42,1.08));const b=new THREE.Mesh(new THREE.SphereGeometry(0.05,12,10),hm);b.position.set(0,0.17,-0.1);head.add(b);}
    else if(hairStyle==="buzz"){head.add(cap(0.118,0.38,1.06));}}
  if(hat==="cap"){head.add(cyl(0.125,0.125,0.07,mat.std(o.hatColor??0x23262b),0,0.2,0,20));head.add(box(0.2,0.015,0.12,mat.std(o.hatColor??0x23262b),0,0.175,0.13,false));}
  if(hat==="beanie"){head.add(cyl(0.125,0.12,0.12,mat.std(o.hatColor??0x3a3f46),0,0.19,0,20));}
  if(hat==="peaked"){head.add(cyl(0.13,0.125,0.08,mat.std(o.hatColor??0x1b1f2a),0,0.2,0,20));head.add(cyl(0.135,0.135,0.02,mat.std(0x101318),0,0.16,0,20));head.add(box(0.18,0.012,0.1,mat.std(0x101318),0,0.16,0.14,false));}
  if(helmet!==null){const hm=new THREE.Mesh(new THREE.SphereGeometry(0.14,20,16,0,Math.PI*2,0,Math.PI*0.62),mat.std(helmet,{roughness:0.35}));hm.position.y=0.12;head.add(hm);head.add(box(0.29,0.02,0.2,mat.std(helmet,{roughness:0.35}),0,0.06,0.03,false));}
  // arms
  const sleeveM=sleeves==="long"?topM:sleeves==="short"?skinM:topM;
  for(const sd of[-1,1]){const L=sd<0;const sh=group(sd*(shW/2+0.04),0.62,0);sh.rotation.x=-(L?P.sxL:P.sxR)||0;sh.rotation.z=sd*((L?P.szL:P.szR)||0);spine.add(sh);
    const ua=capsule(0.05*build,0.28,sleeves==="none"?skinM:topM);ua.position.y=-0.15;sh.add(ua);
    const el=group(0,-0.31,0);el.rotation.x=-((L?P.eL:P.eR)||0);sh.add(el);
    const fa=capsule(0.045*build,0.26,sleeveM);fa.position.y=-0.14;el.add(fa);
    const hand=box(0.07,0.09,0.04,glove!==null?mat.std(glove):skinM,0,-0.31,0);el.add(hand);}
  // legs
  for(const sd of[-1,1]){const L=sd<0;const hip=group(sd*0.1,0.0,0);hip.rotation.x=-((L?P.hxL:P.hxR)||0);spine.add(hip);
    const th=capsule(0.07*build,0.38,botM);th.position.y=-0.22;hip.add(th);
    const kn=group(0,-0.44,0);kn.rotation.x=(L?P.kL:P.kR)||0;hip.add(kn);
    const sh=capsule(0.055*build,0.36,shorts?skinM:botM);sh.position.y=-0.2;kn.add(sh);
    kn.add(box(0.09,0.06,0.24,shoeM,0,-0.41,0.05));}
  s.add(g);return g;
}

/* Studio props that poses interact with. */
export const studioProps={
  chair(s,x,z,rot=0,color=0x3a3f46){const g=group(x,0,z,rot);const m=mat.std(color,{roughness:0.7});g.add(box(0.46,0.05,0.46,m,0,0.45,0));g.add(box(0.46,0.5,0.05,m,0,0.72,-0.2));for(const[a,b]of[[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]])g.add(cyl(0.018,0.018,0.44,mat.std(0x8a8f96,{roughness:0.4,metalness:0.2}),a,0.22,b,8));s.add(g);},
  stretcher(s,x,z,rot=0){const g=group(x,0,z,rot);const fr=mat.std(0xd8dbe0,{roughness:0.4,metalness:0.2});g.add(box(0.6,0.05,1.9,fr,0,0.62,0));g.add(box(0.56,0.08,1.85,mat.std(0xd9a03a,{roughness:0.8}),0,0.68,0));
    for(const[a,b]of[[-0.26,-0.8],[0.26,-0.8],[-0.26,0.8],[0.26,0.8]]){g.add(cyl(0.015,0.015,0.55,fr,a,0.32,b,8));const w=cyl(0.06,0.06,0.04,mat.std(0x2a2d33),a,0.06,b,14);w.rotation.z=Math.PI/2;g.add(w);}s.add(g);},
  wheel(s,x,z){const w=cyl(0.33,0.33,0.24,mat.std(0x151719,{roughness:0.9}),x,0.33,z,28);w.rotation.z=Math.PI/2;s.add(w);const r=cyl(0.19,0.19,0.25,mat.std(0xc9ccd1,{roughness:0.35,metalness:0.2}),x,0.33,z,20);r.rotation.z=Math.PI/2;s.add(r);},
  toolbox(s,x,z,rot=0){const g=group(x,0,z,rot);g.add(box(0.5,0.22,0.24,mat.std(0xc8202a,{roughness:0.5}),0,0.11,0));g.add(box(0.3,0.03,0.03,mat.std(0x2a2d33),0,0.24,0,false));s.add(g);},
  crate(s,x,z,rot=0,y=0,size=0.5){const g=group(x,y,z,rot);g.add(box(size,size*0.8,size,mat.std(0x8a6a45,{roughness:0.9}),0,size*0.4,0));s.add(g);},
  cone(s,x,z){s.add(cyl(0.03,0.16,0.5,mat.std(0xff7a1a,{roughness:0.7}),x,0.25,z,12));s.add(box(0.36,0.02,0.36,mat.std(0xff7a1a),x,0.01,z,false));},
  bench(s,x,z,rot=0){const g=group(x,0,z,rot);g.add(box(1.6,0.06,0.42,mat.std(0x6f5a44,{roughness:0.9}),0,0.45,0));g.add(box(0.06,0.45,0.4,mat.std(0x3a3a3a),-0.7,0.22,0));g.add(box(0.06,0.45,0.4,mat.std(0x3a3a3a),0.7,0.22,0));s.add(g);},
  plinth(s,x,z,w=1.2,h=0.12){s.add(box(w,h,w,mat.std(0xe4e2dd,{roughness:0.5}),x,h/2,z));},
  wall(s,x,z,w=3,h=2.6,rot=0,color=0xd9d6d0){const b=box(w,h,0.12,mat.std(color,{roughness:0.9}),x,h/2,z);b.rotation.y=rot;s.add(b);},
};

/* Weapons: side-profile solids with attachment points. Kind sets the
   silhouette; attachments add an optic, suppressor, grip, light. */
export function weapon(s,kind,x,y,z,rot=0,o={}){
  const {body=0x2b2e33,furniture=0x3d3a35,optic=false,suppressor=false,grip=false,light=false,rail=true,finish=0.45}=o;
  const g=group(x,y,z,rot);const bm=mat.std(body,{roughness:finish,metalness:0.25});const fm=mat.std(furniture,{roughness:0.7});const am=mat.std(0x1c1e22,{roughness:0.4,metalness:0.3});
  let barrelEnd=0.3,railY=0.05,railX=0.0;
  if(kind==="rifle"){g.add(box(0.46,0.07,0.045,bm,0.05,0,0));g.add(box(0.28,0.05,0.04,fm,0.32,-0.005,0));const b=cyl(0.011,0.011,0.3,am,0.58,0.005,0,10);b.rotation.z=Math.PI/2;g.add(b);barrelEnd=0.73;
    g.add(box(0.24,0.055,0.04,fm,-0.34,0.0,0));g.add(box(0.05,0.08,0.035,fm,-0.44,-0.02,0));g.add(box(0.06,0.13,0.04,fm,-0.06,-0.09,0));const mg=box(0.05,0.17,0.035,am,0.08,-0.11,0);mg.rotation.z=0.15;g.add(mg);if(rail)g.add(box(0.4,0.012,0.03,am,0.08,0.042,0,false));railY=0.048;railX=0.04;}
  else if(kind==="pistol"){g.add(box(0.19,0.045,0.03,bm,0.02,0,0));g.add(box(0.06,0.11,0.028,fm,-0.05,-0.07,0));g.rotation.z+=0;const b=cyl(0.007,0.007,0.03,am,0.125,0.0,0,8);b.rotation.z=Math.PI/2;g.add(b);barrelEnd=0.14;railY=0.028;railX=0.02;g.add(box(0.03,0.02,0.02,am,0.0,-0.03,0,false));}
  else if(kind==="smg"){g.add(box(0.36,0.075,0.05,bm,0.0,0,0));g.add(box(0.05,0.15,0.04,fm,0.0,-0.1,0));g.add(box(0.05,0.12,0.04,fm,-0.11,-0.08,0));g.add(box(0.2,0.03,0.03,am,-0.28,0.02,0));const b=cyl(0.01,0.01,0.12,am,0.24,0.01,0,10);b.rotation.z=Math.PI/2;g.add(b);barrelEnd=0.3;if(rail)g.add(box(0.3,0.012,0.03,am,0.0,0.044,0,false));railY=0.05;railX=0.0;}
  else if(kind==="shotgun"){g.add(box(0.3,0.065,0.045,bm,-0.05,0,0));g.add(box(0.2,0.05,0.04,fm,0.28,-0.01,0));const b=cyl(0.013,0.013,0.5,am,0.42,0.012,0,10);b.rotation.z=Math.PI/2;g.add(b);const t=cyl(0.012,0.012,0.4,am,0.36,-0.02,0,10);t.rotation.z=Math.PI/2;g.add(t);barrelEnd=0.67;
    g.add(box(0.26,0.06,0.04,fm,-0.34,-0.005,0));g.add(box(0.05,0.1,0.035,fm,-0.44,-0.03,0));g.add(box(0.05,0.1,0.035,fm,-0.13,-0.07,0));railY=0.04;railX=-0.05;}
  else if(kind==="sniper"){g.add(box(0.5,0.07,0.045,bm,0.0,0,0));const b=cyl(0.012,0.012,0.5,am,0.5,0.01,0,10);b.rotation.z=Math.PI/2;g.add(b);barrelEnd=0.75;g.add(box(0.3,0.06,0.045,fm,-0.38,0.0,0));g.add(box(0.05,0.1,0.04,fm,-0.5,-0.02,0));g.add(box(0.06,0.12,0.04,fm,-0.08,-0.09,0));g.add(box(0.05,0.12,0.03,am,0.06,-0.09,0));
    for(const sd of[-1,1]){const l=box(0.012,0.14,0.012,am,0.42,-0.1,sd*0.035);l.rotation.z=sd*0.18;g.add(l);}if(rail)g.add(box(0.4,0.012,0.03,am,0.0,0.042,0,false));railY=0.048;railX=0.0;}
  if(optic){const om=mat.std(0x1a1c20,{roughness:0.35,metalness:0.3});if(kind==="sniper"){const sc=cyl(0.022,0.022,0.24,om,railX,railY+0.04,0,14);sc.rotation.z=Math.PI/2;g.add(sc);g.add(box(0.02,0.03,0.02,om,railX-0.06,railY+0.02,0,false));g.add(box(0.02,0.03,0.02,om,railX+0.06,railY+0.02,0,false));}
    else if(kind==="pistol"){g.add(box(0.03,0.02,0.024,om,railX-0.04,railY+0.012,0,false));g.add(box(0.005,0.024,0.026,mat.std(0x9fd3ff,{roughness:0.1,metalness:0.3}),railX-0.025,railY+0.02,0,false));}
    else{g.add(box(0.06,0.03,0.03,om,railX,railY+0.02,0,false));g.add(box(0.008,0.032,0.032,mat.std(0x9fd3ff,{roughness:0.1,metalness:0.3}),railX+0.02,railY+0.038,0,false));g.add(box(0.03,0.02,0.02,om,railX,railY+0.038,0,false));}}
  if(suppressor){const sp=cyl(0.017,0.017,0.16,mat.std(0x1a1c20,{roughness:0.5,metalness:0.3}),barrelEnd+0.07,kind==="pistol"?0.0:0.008,0,12);sp.rotation.z=Math.PI/2;g.add(sp);}
  if(grip&&kind!=="pistol"){g.add(box(0.03,0.07,0.028,fm,kind==="rifle"?0.34:0.16,-0.06,0));}
  if(light){const lm=mat.std(0x1a1c20,{roughness:0.4,metalness:0.3});const l=cyl(0.012,0.012,0.05,lm,kind==="pistol"?0.07:kind==="rifle"?0.42:0.2,kind==="pistol"?-0.03:-0.035,0,10);l.rotation.z=Math.PI/2;g.add(l);g.add(box(0.004,0.02,0.02,mat.emissive(0xfff2cc,0.6),(kind==="pistol"?0.07:kind==="rifle"?0.42:0.2)+0.026,kind==="pistol"?-0.03:-0.035,0,false));}
  s.add(g);return g;
}
`

/* ------------------------------------------------------------- builders */

/**
 * Neutral studio: a cyclorama floor sweeping into a back wall, soft key +
 * fill, optional floor grid. `items` are runtime calls with s in scope
 * (mannequin, studioProps.*, weapon, box, ...).
 */
export function studio({ items, view, tone = "light", grid = false, floorColor, wallColor, keyPos = [4, 7, 5], exposure = 1.0, extra = "" }) {
  const dark = tone === "dark"
  const fc = floorColor ?? (dark ? 0x2a2d33 : 0xdedbd5)
  const wc = wallColor ?? (dark ? 0x22252a : 0xe9e6e0)
  const charUrl = `data:text/javascript;base64,${Buffer.from(CHAR).toString("base64")}`
  return threeDoc(`
import {makeRenderer,finish,camera,scene as mkScene,box,cyl,group,mat,THREE} from "rt";
import {mannequin,studioProps,weapon,POSES} from "${charUrl}";
const r=makeRenderer();r.toneMappingExposure=${exposure};const s=mkScene(${wc});
s.fog=new THREE.Fog(${wc},18,40);
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(60,60),mat.std(${fc},{roughness:0.9}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;s.add(fl);
 const bk=new THREE.Mesh(new THREE.PlaneGeometry(80,30),mat.std(${wc},{roughness:0.95}));bk.position.set(0,15,-14);bk.receiveShadow=true;s.add(bk);}
${grid ? `{const gh=new THREE.GridHelper(20,20,${dark ? 0x3a3f46 : 0xc8c4bd},${dark ? 0x33373d : 0xd2cec7});gh.position.y=0.005;s.add(gh);}` : ""}
s.add(new THREE.HemisphereLight(${dark ? 0x9aa4b4 : 0xffffff},${dark ? 0x1c1f24 : 0xb9b4ac},${dark ? 0.7 : 0.85}));
{const k=new THREE.DirectionalLight(0xfff4e6,${dark ? 2.2 : 2.6});k.position.set(${keyPos.join(",")});k.castShadow=true;k.shadow.mapSize.set(2048,2048);k.shadow.camera.left=-8;k.shadow.camera.right=8;k.shadow.camera.top=8;k.shadow.camera.bottom=-8;k.shadow.bias=-0.0008;k.shadow.radius=4;s.add(k);
 const f=new THREE.DirectionalLight(0xdde8ff,${dark ? 0.8 : 1.0});f.position.set(-6,4,3);s.add(f);
 const rim=new THREE.DirectionalLight(0xffffff,${dark ? 1.4 : 0.9});rim.position.set(0,5,-6);s.add(rim);}
${items.join("\n")}
${extra}
const cam=camera(${JSON.stringify(view.pos)},${JSON.stringify(view.look)},${view.fov ?? 40});
finish(r,s,cam);`)
}

/** LOD comparison: the same figure at three mesh densities, labelled by distance. */
export function lodStrip({ view, tone = "light" }) {
  // Segment counts are set on the geometry directly so the reduction is real.
  return studio({
    tone, grid: true, view,
    items: [
      `mannequin(s,-1.8,0,0.3,{pose:"idle",top:0x4a6fa5,bottom:0x2b2f36,hair:0x2a211c,skin:0xc9a27e});`,
      `{const m=mannequin(s,0,0,0.3,{pose:"idle",top:0x4a6fa5,bottom:0x2b2f36,hair:0x2a211c,skin:0xc9a27e});m.traverse(o=>{if(o.isMesh&&o.geometry.type==="SphereGeometry"){const p=o.geometry.parameters;o.geometry=new THREE.SphereGeometry(p.radius,7,6,p.phiStart,p.phiLength,p.thetaStart,p.thetaLength);}if(o.isMesh&&o.geometry.type==="CylinderGeometry"){const p=o.geometry.parameters;o.geometry=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,6);}});}`,
      `{const m=mannequin(s,1.8,0,0.3,{pose:"idle",top:0x4a6fa5,bottom:0x2b2f36,hair:0x2a211c,skin:0xc9a27e});m.traverse(o=>{if(o.isMesh&&o.geometry.type==="SphereGeometry"){const p=o.geometry.parameters;o.geometry=new THREE.SphereGeometry(p.radius,4,3,p.phiStart,p.phiLength,p.thetaStart,p.thetaLength);}if(o.isMesh&&o.geometry.type==="CylinderGeometry"){const p=o.geometry.parameters;o.geometry=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,4);}o.material&&(o.material=o.material.clone(),o.material.flatShading=true,o.material.needsUpdate=true);});}`,
    ],
  })
}
