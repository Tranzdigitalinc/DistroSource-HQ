/**
 * 3D scenes, rendered in-browser with three.js and screenshotted.
 *
 * Each builder returns a self-contained HTML document. The browser-side
 * RUNTIME below carries what makes a scene read as a real environment rather
 * than a diagram: procedural material textures (tile grout, wall noise, wood
 * grain, asphalt), physically-based materials, shadow-casting daylight, panel
 * lighting, ACES tone mapping, and props built from primitives at true scale
 * (metres). No text, logos or branding are placed in any scene except plain
 * wayfinding signs that name real rooms of the product.
 */
import { doc, W, H } from "../lib.mjs"

/* ----------------------------------------------------------- RUNTIME (browser) */

const RUNTIME = String.raw`
import * as THREE from "three";
import {RoomEnvironment} from "http://localhost/jsm/environments/RoomEnvironment.js";
const W=${W},H=${H};

/* ---- image-based lighting: a neutral room, so paint, glass and metal
   reflect something instead of a black void ---- */
export function environment(r,scene,intensity=1){const pm=new THREE.PMREMGenerator(r);const env=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environment=env;scene.environmentIntensity=intensity;pm.dispose();return env;}
/* ---- gradient sky dome: horizon colour to zenith colour, unaffected by fog ---- */
export function skyDome(scene,horizon,zenith,r=230){const g=new THREE.SphereGeometry(r,32,18);const pos=g.attributes.position;const col=new Float32Array(pos.count*3);const h=new THREE.Color(horizon),z=new THREE.Color(zenith),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const t=Math.max(0,Math.min(1,pos.getY(i)/r));c.copy(h).lerp(z,Math.pow(t,0.42));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  g.setAttribute("color",new THREE.BufferAttribute(col,3));const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false}));scene.add(m);return m;}

/* ---- renderer ---- */
export function makeRenderer(){
  const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  r.setPixelRatio(1);r.setSize(W,H);
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
  r.outputColorSpace=THREE.SRGBColorSpace;
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  document.body.appendChild(r.domElement);return r;
}
export function finish(r,scene,cam){ r.render(scene,cam); window.__done=true; }

/* ---- procedural textures ---- */
function canvas(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c;}
function grain(ctx,w,h,amt,seed=1){
  const img=ctx.getImageData(0,0,w,h),d=img.data;let s=seed*9301+49297;
  const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};
  for(let i=0;i<d.length;i+=4){const n=(rnd()-0.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}
  ctx.putImageData(img,0,0);
}
function mk(c,rep=1,rep2=rep){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep2);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
export const tex={
  tile(color="#d9dbd6",grout="#b9bcb6",n=4,rep=6){const s=512,c=canvas(s,s),x=c.getContext("2d");x.fillStyle=color;x.fillRect(0,0,s,s);grain(x,s,s,14,3);
    x.strokeStyle=grout;x.lineWidth=3;const st=s/n;for(let i=0;i<=n;i++){x.beginPath();x.moveTo(i*st,0);x.lineTo(i*st,s);x.stroke();x.beginPath();x.moveTo(0,i*st);x.lineTo(s,i*st);x.stroke();}
    return mk(c,rep);},
  vinyl(color="#cfd3d8",rep=8){const s=256,c=canvas(s,s),x=c.getContext("2d");x.fillStyle=color;x.fillRect(0,0,s,s);grain(x,s,s,10,5);return mk(c,rep);},
  wall(color="#e8e6e1",rep=3){const s=256,c=canvas(s,s),x=c.getContext("2d");x.fillStyle=color;x.fillRect(0,0,s,s);grain(x,s,s,8,7);return mk(c,rep);},
  wood(rep=4){const s=512,c=canvas(s,s),x=c.getContext("2d");x.fillStyle="#8a6340";x.fillRect(0,0,s,s);
    for(let i=0;i<80;i++){x.strokeStyle="rgba(60,35,18,"+(0.08+Math.random()*0.18)+")";x.lineWidth=1+Math.random()*3;x.beginPath();const y=Math.random()*s;x.moveTo(0,y);x.bezierCurveTo(s*0.3,y+(Math.random()-0.5)*18,s*0.7,y+(Math.random()-0.5)*18,s,y);x.stroke();}
    grain(x,s,s,12,11);return mk(c,rep);},
  concrete(color="#9a9c9e",rep=4){const s=512,c=canvas(s,s),x=c.getContext("2d");x.fillStyle=color;x.fillRect(0,0,s,s);grain(x,s,s,22,13);
    x.strokeStyle="rgba(0,0,0,0.12)";x.lineWidth=2;x.beginPath();x.moveTo(0,s/2);x.lineTo(s,s/2);x.moveTo(s/2,0);x.lineTo(s/2,s);x.stroke();return mk(c,rep);},
  asphalt(rep=10){const s=512,c=canvas(s,s),x=c.getContext("2d");x.fillStyle="#3b3d40";x.fillRect(0,0,s,s);grain(x,s,s,26,17);return mk(c,rep,rep);},
  sign(text,bg="#1f4e79",fg="#ffffff",w=1024,h=256){const c=canvas(w,h),x=c.getContext("2d");x.fillStyle=bg;x.fillRect(0,0,w,h);
    x.fillStyle=fg;x.font="bold "+Math.floor(h*0.52)+"px Segoe UI, Arial, sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(text,w/2,h/2+4);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;},
  livery(base="#ffffff",stripe="#1f4e79",unit=""){const w=1024,h=256,c=canvas(w,h),x=c.getContext("2d");x.fillStyle=base;x.fillRect(0,0,w,h);
    x.fillStyle=stripe;x.fillRect(0,h*0.52,w,h*0.16);x.fillRect(0,h*0.72,w,h*0.05);
    if(unit){x.fillStyle="#111";x.font="bold 110px Segoe UI, Arial";x.textAlign="center";x.fillText(unit,w*0.5,h*0.44);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;},
};

/* ---- materials ---- */
export const mat={
  std(color,o={}){return new THREE.MeshStandardMaterial(Object.assign({color,roughness:0.85,metalness:0.0},o));},
  mapped(map,o={}){return new THREE.MeshStandardMaterial(Object.assign({map,roughness:0.8,metalness:0.0},o));},
  glass(){return new THREE.MeshPhysicalMaterial({color:0xbcd6e8,roughness:0.05,metalness:0,transmission:0.6,transparent:true,opacity:0.55});},
  // Moderate metalness: with no environment map, fully metallic surfaces
  // reflect a black void and render as near-black rails and rims.
  metal(color=0xb8bcc2){return new THREE.MeshStandardMaterial({color,roughness:0.4,metalness:0.38});},
  emissive(color,intensity=2){return new THREE.MeshStandardMaterial({color:0xffffff,emissive:color,emissiveIntensity:intensity,roughness:0.6});},
};

/* ---- helpers ---- */
export function box(w,h,d,m,x=0,y=0,z=0,shadow=true){const g=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);g.position.set(x,y,z);g.castShadow=shadow;g.receiveShadow=true;return g;}
export function cyl(rt,rb,h,m,x=0,y=0,z=0,seg=24){const g=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);g.position.set(x,y,z);g.castShadow=true;g.receiveShadow=true;return g;}
export function group(x=0,y=0,z=0,rot=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;return g;}

/* ---- lighting rigs ---- */
export function daylight(scene,{intensity=2.2,color=0xfff1dc,pos=[10,14,6],size=18,hemi=0.55}={}){
  scene.add(new THREE.HemisphereLight(0xdfe9f5,0x6b6156,hemi));
  const sun=new THREE.DirectionalLight(color,intensity);sun.position.set(...pos);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.02;
  const c=sun.shadow.camera;c.left=-size;c.right=size;c.top=size;c.bottom=-size;c.near=1;c.far=60;
  scene.add(sun);return sun;
}
export function panelLight(scene,x,y,z,{w=1.2,d=0.6,color=0xf4f7ff,intensity=6,dist=7}={}){
  const p=box(w,0.04,d,mat.emissive(color,1.6),x,y,z,false);p.receiveShadow=false;scene.add(p);
  const l=new THREE.PointLight(color,intensity,dist,1.6);l.position.set(x,y-0.15,z);l.castShadow=false;scene.add(l);
}

/* ---- room shell with door/window gaps ---- */
export function room(scene,{w=10,d=8,h=3.2,floor="tile",wallColor="#e6e4df",ceiling="#f2f1ee",doors=[],windows=[],skirting=true,panels=true}={}){
  const fmap={tile:tex.tile(),vinyl:tex.vinyl(),wood:tex.wood(),concrete:tex.concrete()}[floor]||tex.tile();
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat.mapped(fmap,{roughness:floor==="tile"?0.5:0.8}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;scene.add(fl);
  const ce=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat.std(ceiling,{roughness:0.95}));ce.rotation.x=Math.PI/2;ce.position.y=h;scene.add(ce);
  const wm=mat.mapped(tex.wall(wallColor),{roughness:0.92});
  // Each wall is built from segments so doors and windows are true openings.
  const walls=[{k:"n",len:w,at:[0,0,-d/2],rot:0},{k:"s",len:w,at:[0,0,d/2],rot:Math.PI},{k:"e",len:d,at:[w/2,0,0],rot:-Math.PI/2},{k:"w",len:d,at:[-w/2,0,0],rot:Math.PI/2}];
  for(const wl of walls){
    const g=group(...wl.at,wl.rot);
    const cuts=[...doors.filter(o=>o.wall===wl.k).map(o=>({x:o.x,w:o.w||1.1,y0:0,y1:o.h||2.1})),...windows.filter(o=>o.wall===wl.k).map(o=>({x:o.x,w:o.w||1.6,y0:o.y0??0.95,y1:o.y1??2.2}))];
    cuts.sort((a,b)=>a.x-b.x);
    let cursor=-wl.len/2;
    const seg=(x0,x1,y0,y1)=>{if(x1-x0<=0.001||y1-y0<=0.001)return;const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,0.14),wm);m.position.set((x0+x1)/2,(y0+y1)/2,0);m.receiveShadow=true;m.castShadow=true;g.add(m);};
    for(const c of cuts){seg(cursor,c.x-c.w/2,0,h);seg(c.x-c.w/2,c.x+c.w/2,0,c.y0);seg(c.x-c.w/2,c.x+c.w/2,c.y1,h);cursor=c.x+c.w/2;}
    seg(cursor,wl.len/2,0,h);
    for(const c of cuts){ if(c.y0>0.5){const gl=new THREE.Mesh(new THREE.BoxGeometry(c.w-0.08,c.y1-c.y0-0.08,0.02),mat.glass());gl.position.set(c.x,(c.y0+c.y1)/2,0);g.add(gl);
      const fr=mat.metal(0x8c9096);g.add(box(c.w,0.05,0.16,fr,c.x,c.y0,0,false));g.add(box(c.w,0.05,0.16,fr,c.x,c.y1,0,false));}
      else{const fr=mat.std(0x6f7378);g.add(box(0.06,c.y1,0.18,fr,c.x-c.w/2,c.y1/2,0,false));g.add(box(0.06,c.y1,0.18,fr,c.x+c.w/2,c.y1/2,0,false));g.add(box(c.w+0.06,0.06,0.18,fr,c.x,c.y1,0,false));} }
    if(skirting){const sk=box(wl.len,0.1,0.16,mat.std(0x5a5e63),0,0.05,0,false);g.add(sk);}
    scene.add(g);
  }
  if(panels){const nx=Math.max(1,Math.round(w/3)),nz=Math.max(1,Math.round(d/3));for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)panelLight(scene,-w/2+(i+0.5)*(w/nx),h-0.03,-d/2+(j+0.5)*(d/nz));}
  return {w,d,h};
}

/* ---- wayfinding sign on a wall ---- */
export function wallSign(scene,text,x,y,z,rotY=0,{w=1.4,h=0.35,bg="#1f4e79"}={}){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex.sign(text,bg),roughness:0.6}));
  m.position.set(x,y,z);m.rotation.y=rotY;scene.add(m);
}

/* ---- props (metres) ---- */
export const props={
  hospitalBed(s,x,z,rot=0){const g=group(x,0,z,rot);const frame=mat.metal(0xd8dbe0),matt=mat.std(0xeef0f2,{roughness:0.9}),sheet=mat.std(0x9fc4dd);
    g.add(box(0.95,0.12,2.05,frame,0,0.55,0));g.add(box(0.9,0.16,1.95,matt,0,0.69,0));g.add(box(0.9,0.03,1.2,sheet,0,0.78,0.25));
    g.add(box(0.5,0.1,0.35,mat.std(0xffffff),0,0.8,-0.75));
    for(const[a,b]of[[-0.42,-0.9],[0.42,-0.9],[-0.42,0.9],[0.42,0.9]])g.add(cyl(0.03,0.03,0.5,frame,a,0.25,b,10));
    g.add(box(0.06,0.5,0.9,frame,-0.5,0.95,0.2));g.add(box(0.06,0.5,0.9,frame,0.5,0.95,0.2));
    g.add(box(0.9,0.55,0.05,frame,0,0.9,-1.0));g.add(box(0.9,0.4,0.05,frame,0,0.82,1.0));s.add(g);},
  ivStand(s,x,z){const g=group(x,0,z);const m=mat.metal(0xc9ccd1);g.add(cyl(0.015,0.015,1.8,m,0,0.9,0,8));g.add(cyl(0.25,0.25,0.03,m,0,0.015,0,16));g.add(box(0.36,0.02,0.02,m,0,1.82,0));g.add(box(0.1,0.22,0.06,mat.std(0xd9ecf5,{transparent:true,opacity:0.8}),-0.15,1.62,0));s.add(g);},
  cabinet(s,x,z,rot=0,{w=1.0,h=0.9,d=0.5,color=0xf0f0ee}={}){const g=group(x,0,z,rot);g.add(box(w,h,d,mat.std(color,{roughness:0.5}),0,h/2,0));g.add(box(w+0.04,0.04,d+0.04,mat.std(0x7d8791),0,h+0.02,0));
    for(let i=0;i<Math.max(1,Math.round(w/0.5));i++)g.add(box(0.03,0.12,0.03,mat.metal(),-w/2+(i+0.5)*(w/Math.max(1,Math.round(w/0.5))),h*0.55,d/2+0.02,false));s.add(g);},
  counter(s,x,z,rot=0,{w=2.4,color=0xf2f2f0}={}){const g=group(x,0,z,rot);g.add(box(w,1.05,0.7,mat.std(color,{roughness:0.5}),0,0.525,0));g.add(box(w+0.06,0.05,0.8,mat.std(0x5d6670),0,1.08,0));g.add(box(w,0.3,0.05,mat.std(0x1f4e79),0,1.25,-0.3));s.add(g);},
  bar(s,x,z,rot=0,{w=3.6,color=0x2a2030}={}){const g=group(x,0,z,rot);const top=mat.mapped(tex.wood(3),{roughness:0.35});
    g.add(box(w,1.05,0.7,mat.std(color,{roughness:0.6}),0,0.525,0));g.add(box(w+0.1,0.06,0.85,top,0,1.08,0));g.add(box(w,0.04,0.1,mat.emissive(0xff5fb0,1.2),0,0.32,0.36,false));
    g.add(box(w,2.3,0.4,mat.std(0x1a1520,{roughness:0.7}),0,1.15,-1.1));for(let i=0;i<3;i++)g.add(box(w-0.2,0.03,0.36,mat.std(0x8a6a45),0,0.9+i*0.55,-1.1,false));
    const cols=[0x7ad3ff,0xffc857,0x9fe08a,0xff7a7a,0xd9a6ff,0xffffff];for(let i=0;i<Math.floor(w/0.28);i++){const bx=-w/2+0.2+i*0.28;g.add(cyl(0.04,0.045,0.3,new THREE.MeshStandardMaterial({color:cols[i%cols.length],roughness:0.1,metalness:0.1,transparent:true,opacity:0.85}),bx,0.9+(i%3)*0.55+0.17,-1.1,10));}
    g.add(box(w,0.05,0.4,mat.emissive(0xffd27a,1.5),0,2.32,-1.1,false));s.add(g);},
  desk(s,x,z,rot=0){const g=group(x,0,z,rot);g.add(box(1.5,0.04,0.75,mat.std(0xe8e5df,{roughness:0.4}),0,0.74,0));const leg=mat.metal(0x6c7077);g.add(box(0.04,0.72,0.7,leg,-0.7,0.36,0));g.add(box(0.04,0.72,0.7,leg,0.7,0.36,0));
    g.add(box(0.5,0.32,0.02,mat.std(0x111318),0,1.02,-0.2));g.add(box(0.5,0.3,0.005,mat.emissive(0x9fc7ff,0.9),0,1.02,-0.188,false));g.add(box(0.08,0.14,0.08,mat.std(0x2a2d33),0,0.81,-0.2));g.add(box(0.42,0.015,0.14,mat.std(0x2a2d33),0.02,0.755,0.12));s.add(g);},
  chair(s,x,z,rot=0,color=0x2b2f36){const g=group(x,0,z,rot);const m=mat.std(color,{roughness:0.7});g.add(box(0.45,0.06,0.45,m,0,0.46,0));g.add(box(0.45,0.5,0.06,m,0,0.74,-0.2));g.add(cyl(0.025,0.025,0.4,mat.metal(),0,0.24,0,8));g.add(cyl(0.28,0.28,0.03,mat.metal(),0,0.02,0,5));s.add(g);},
  surgeryTable(s,x,z,rot=0){const g=group(x,0,z,rot);g.add(box(0.6,0.08,2.0,mat.std(0x2f3a45,{roughness:0.6}),0,0.95,0));g.add(box(0.55,0.06,1.9,mat.std(0x8fb8d6),0,1.02,0));g.add(cyl(0.18,0.22,0.9,mat.metal(0xcfd3d8),0,0.45,0,20));g.add(cyl(0.45,0.45,0.05,mat.metal(0xcfd3d8),0,0.025,0,24));s.add(g);},
  surgeryLight(s,x,z){const g=group(x,0,z);const arm=mat.metal(0xd6d9de);g.add(cyl(0.03,0.03,0.6,arm,0,3.0,0,8));g.add(box(0.9,0.03,0.03,arm,0.4,2.7,0));
    const head=cyl(0.35,0.3,0.12,mat.std(0xf4f6f8,{roughness:0.3}),0.8,2.55,0,28);g.add(head);g.add(cyl(0.3,0.3,0.02,mat.emissive(0xffffff,3),0.8,2.48,0,28));
    const l=new THREE.SpotLight(0xffffff,40,7,0.55,0.5,1.4);l.position.set(x+0.8,2.45,z);l.target.position.set(x+0.8,0.9,z);l.castShadow=true;s.add(l);s.add(l.target);s.add(g);},
  curtainRail(s,x,z,len=2.2,rot=0){const g=group(x,0,z,rot);g.add(box(len,0.03,0.03,mat.metal(),0,2.3,0,false));g.add(box(len*0.55,1.7,0.04,mat.std(0xa8c8dd,{roughness:0.95}),-len*0.2,1.45,0,false));s.add(g);},
  locker(s,x,z,rot=0,n=4){const g=group(x,0,z,rot);for(let i=0;i<n;i++){g.add(box(0.38,1.8,0.45,mat.std(0x7d8794,{roughness:0.4,metalness:0.3}),(i-(n-1)/2)*0.4,0.9,0));g.add(box(0.03,0.12,0.02,mat.metal(),(i-(n-1)/2)*0.4+0.14,1.0,0.235,false));}s.add(g);},
  shelf(s,x,z,rot=0,{w=1.2,h=2.0}={}){const g=group(x,0,z,rot);const m=mat.std(0x9aa0a8,{roughness:0.5,metalness:0.3});g.add(box(0.04,h,0.45,m,-w/2,h/2,0));g.add(box(0.04,h,0.45,m,w/2,h/2,0));
    for(let i=0;i<5;i++){g.add(box(w,0.03,0.45,m,0,0.15+i*(h-0.3)/4,0));for(let k=0;k<3;k++)g.add(box(0.22,0.18,0.28,mat.std([0xe8e8e8,0xc7d8e8,0xf0d8c0][ (i+k)%3 ]),-w/2+0.25+k*(w-0.4)/2.4,0.15+i*(h-0.3)/4+0.1,0));}s.add(g);},
  sofa(s,x,z,rot=0,color=0x5f6c78){const g=group(x,0,z,rot);const m=mat.std(color,{roughness:0.95});g.add(box(1.9,0.42,0.85,m,0,0.21,0));g.add(box(1.9,0.5,0.22,m,0,0.66,-0.32));g.add(box(0.2,0.6,0.85,m,-0.85,0.5,0));g.add(box(0.2,0.6,0.85,m,0.85,0.5,0));s.add(g);},
  table(s,x,z,rot=0,{w=1.2,d=0.7,h=0.75,wood=true}={}){const g=group(x,0,z,rot);g.add(box(w,0.04,d,wood?mat.mapped(tex.wood(2),{roughness:0.5}):mat.std(0xe8e5df),0,h,0));for(const[a,b]of[[-w/2+0.05,-d/2+0.05],[w/2-0.05,-d/2+0.05],[-w/2+0.05,d/2-0.05],[w/2-0.05,d/2-0.05]])g.add(box(0.05,h,0.05,mat.std(0x3a3a3a),a,h/2,b));s.add(g);},
  plant(s,x,z){const g=group(x,0,z);g.add(cyl(0.2,0.16,0.35,mat.std(0x6d5a4a),0,0.175,0,14));for(let i=0;i<7;i++){const leaf=box(0.08,0.55,0.2,mat.std(0x3f7a3a,{roughness:0.8}),0,0.6,0);leaf.rotation.set(0.5,i*0.9,0.3);g.add(leaf);}s.add(g);},
  crate(s,x,z,rot=0,size=0.6){const g=group(x,0,z,rot);g.add(box(size,size*0.8,size,mat.mapped(tex.wood(1),{roughness:0.9}),0,size*0.4,0));s.add(g);},
  bollard(s,x,z){s.add(cyl(0.08,0.08,0.9,mat.std(0xd8a23a),x,0.45,z,12));},
  // Vehicles inside rooms: no light bar, no livery unless asked.
  car(s,x,z,rot=0,o={}){const g=vehicle(s,o.kind||"sedan",x,z,rot,Object.assign({lightbar:false,livery:false},o));g.position.y=o.y||0;return g;},
  // Raised floor with a railing and a stair, for a showroom mezzanine.
  mezzanine(s,x,z,rot=0,{w=8,d=6,h=3.2,stair="e"}={}){const g=group(x,0,z,rot);g.add(box(w,0.3,d,mat.std(0xd9d6cf,{roughness:0.6}),0,h-0.15,0));const rm=mat.metal(0x8c9096);for(const [len,px,pz,ry] of [[w,0,-d/2,0],[w,0,d/2,0],[d,-w/2,0,Math.PI/2],[d,w/2,0,Math.PI/2]]){const r=group(px,h,pz,ry);r.add(box(len,0.03,0.03,rm,0,1.05,0,false));r.add(box(len,0.02,0.02,rm,0,0.55,0,false));for(let i=0;i<=Math.round(len/1.2);i++)r.add(box(0.03,1.05,0.03,rm,-len/2+i*(len/Math.round(len/1.2)),0.525,0,false));g.add(r);}for(let i=0;i<Math.round(h/0.18);i++)g.add(box(1.2,0.06,0.3,mat.std(0xb9b4ac,{roughness:0.7}),w/2+0.6,0.09+i*0.18,d/2-0.15-i*0.3));for(const [cx,cz] of [[-w/2+0.3,-d/2+0.3],[w/2-0.3,-d/2+0.3],[-w/2+0.3,d/2-0.3],[w/2-0.3,d/2-0.3]])g.add(cyl(0.12,0.12,h-0.3,mat.std(0xc9c6bf),cx,(h-0.3)/2,cz,12));s.add(g);},
  // Two-post lift with the car raised on it.
  lift(s,x,z,rot=0,{raised=1.2,kind="sedan",color=0x8a8f96,car=true}={}){const g=group(x,0,z,rot);const pm=mat.std(0x2b4c8c,{roughness:0.5});for(const sd of[-1,1]){g.add(box(0.3,2.7,0.3,pm,0,1.35,sd*1.6));g.add(box(0.3,0.1,1.2,pm,0,0.05,sd*1.0));for(const a of[-1.2,1.2])g.add(box(1.1,0.08,0.18,pm,a,raised+0.02,sd*0.92));}g.add(box(0.3,0.12,3.5,pm,0,2.75,0));s.add(g);if(car){const c=vehicle(s,kind,x,z,rot,{lightbar:false,livery:false,color});c.position.y=raised+0.04;}},
  // Holding cell: barred front with a door panel, bunk inside.
  cell(s,x,z,rot=0,{w=2.4,d=2.6,h=2.6}={}){const g=group(x,0,z,rot);const bm=mat.std(0x8c9096,{roughness:0.4,metalness:0.3});const n=Math.floor(w/0.16);for(let i=0;i<=n;i++)g.add(cyl(0.018,0.018,h,bm,-w/2+i*(w/n),h/2,d/2,8));g.add(box(w,0.06,0.06,bm,0,h-0.03,d/2,false));g.add(box(w,0.06,0.06,bm,0,1.0,d/2,false));g.add(box(0.9,0.5,0.06,bm,-w/2+0.5,1.25,d/2+0.005,false));
    g.add(box(0.9,0.18,1.9,mat.std(0x6f7378),w/2-0.5,0.5,-0.1));g.add(box(0.85,0.08,1.8,mat.std(0xd8dde3),w/2-0.5,0.63,-0.1));g.add(box(0.4,0.02,0.6,mat.std(0xffffff),w/2-0.5,0.68,-0.85));s.add(g);},
  // Showroom display plinth with an under-lit edge.
  plinth(s,x,z,rot=0,{w=5.4,d=2.9,h=0.14,color=0xe8e6e1}={}){const g=group(x,0,z,rot);g.add(box(w,h,d,mat.std(color,{roughness:0.35}),0,h/2,0));g.add(box(w+0.06,0.02,d+0.06,mat.emissive(0xf4f7ff,0.8),0,0.015,0,false));s.add(g);},
  bench(s,x,z,rot=0,len=2.0){const g=group(x,0,z,rot);g.add(box(len,0.06,0.4,mat.std(0x6f7378,{roughness:0.5,metalness:0.2}),0,0.45,0));g.add(box(0.06,0.45,0.38,mat.std(0x4a4e55),-len/2+0.1,0.22,0));g.add(box(0.06,0.45,0.38,mat.std(0x4a4e55),len/2-0.1,0.22,0));s.add(g);},
  // Armoury wall rack: long guns on hooks, receiver-down.
  weaponRack(s,x,z,rot=0,n=5){const g=group(x,0,z,rot);g.add(box(0.3*n+0.2,2.0,0.06,mat.std(0x5a5e63,{roughness:0.6}),0,1.0,0));g.add(box(0.3*n+0.2,0.05,0.25,mat.std(0x4a4e55),0,0.6,0.1));const gm=mat.std(0x2b2e33,{roughness:0.45,metalness:0.25});for(let i=0;i<n;i++){const gx=-0.15*(n-1)+i*0.3;g.add(box(0.06,0.9,0.05,gm,gx,1.15,0.08));g.add(box(0.05,0.28,0.045,mat.std(0x3d3a35),gx,0.75,0.09));g.add(box(0.045,0.12,0.04,gm,gx+0.035,1.0,0.1));g.add(box(0.03,0.04,0.03,mat.std(0x8c9096),gx,1.5,0.1,false));}s.add(g);},
  rollerDoor(s,x,z,rot=0,{w=4.0,h=3.0,open=0.0}={}){const g=group(x,0,z,rot);const dm=mat.std(0x9aa0a6,{roughness:0.5,metalness:0.2});const vis=h*(1-open);for(let i=0;i<Math.floor(vis/0.3);i++)g.add(box(w,0.27,0.05,dm,0,h-0.15-i*0.3,0,false));const dr=cyl(0.18,0.18,w+0.2,mat.std(0x6f7378),0,h+0.1,0,14);dr.rotation.z=Math.PI/2;g.add(dr);s.add(g);},
  // Paint booth: white enclosure with wall light strips and a lit ceiling.
  paintBooth(s,x,z,rot=0){const g=group(x,0,z,rot);const wm=mat.std(0xf2f2f0,{roughness:0.4});g.add(box(0.12,3.0,6.0,wm,-2.6,1.5,0));g.add(box(0.12,3.0,6.0,wm,2.6,1.5,0));g.add(box(5.2,0.12,6.0,wm,0,3.0,0));g.add(box(5.2,3.0,0.12,wm,0,1.5,-3.0));for(let i=0;i<3;i++)for(const sd of[-1,1])g.add(box(0.06,1.2,0.3,mat.emissive(0xffffff,2.2),sd*2.5,1.6,-2+i*2,false));g.add(box(5.0,0.06,5.8,mat.emissive(0xffffff,1.6),0,2.93,0,false));s.add(g);const l=new THREE.PointLight(0xffffff,20,9,1.4);l.position.set(x,2.6,z);s.add(l);},
  toolCart(s,x,z,rot=0){const g=group(x,0,z,rot);g.add(box(0.7,0.9,0.45,mat.std(0xc8202a,{roughness:0.5}),0,0.5,0));for(let i=0;i<4;i++)g.add(box(0.5,0.03,0.03,mat.std(0x2a2d33),0,0.2+i*0.2,0.23,false));g.add(box(0.7,0.03,0.45,mat.std(0x2a2d33),0,0.97,0,false));s.add(g);},
  tyreStack(s,x,z,n=4){for(let i=0;i<n;i++)s.add(cyl(0.33,0.33,0.22,mat.std(0x151719,{roughness:0.9}),x,0.11+i*0.22,z,24));},
  partsShelf(s,x,z,rot=0,w=1.8){const g=group(x,0,z,rot);const m=mat.std(0x3b5c8f,{roughness:0.6,metalness:0.2});g.add(box(0.05,2.2,0.6,m,-w/2,1.1,0));g.add(box(0.05,2.2,0.6,m,w/2,1.1,0));for(let i=0;i<4;i++){g.add(box(w,0.04,0.6,mat.std(0xd9a03a),0,0.2+i*0.6,0));for(let k=0;k<4;k++)g.add(box(0.3,0.26,0.4,mat.std([0x8a6a45,0xc8c8c8,0x3a3f46,0xe8e8e8][(i+k)%4]),-w/2+0.3+k*(w-0.5)/3,0.35+i*0.6,0));}s.add(g);},
  screen(s,x,y,z,rot=0,{w=1.6,h=0.9}={}){const g=group(x,y,z,rot);g.add(box(w,h,0.05,mat.std(0x111318),0,0,0));g.add(box(w-0.06,h-0.06,0.01,mat.emissive(0x2c5aa0,0.9),0,0,0.03,false));s.add(g);},
  glassWall(s,x,z,rot=0,{w=6,h=3.2}={}){const g=group(x,0,z,rot);g.add(box(w,h,0.03,mat.glass(),0,h/2,0,false));const fm=mat.metal(0x8c9096);const n=Math.max(1,Math.round(w/2));for(let i=0;i<=n;i++)g.add(box(0.05,h,0.08,fm,-w/2+i*(w/n),h/2,0,false));g.add(box(w,0.06,0.08,fm,0,h-0.03,0,false));s.add(g);},
  whiteboard(s,x,y,z,rot=0,{w=2.4,h=1.2}={}){const g=group(x,y,z,rot);g.add(box(w,h,0.04,mat.std(0xf6f6f4,{roughness:0.3}),0,0,0));g.add(box(w+0.04,0.04,0.05,mat.metal(0x8c9096),0,-h/2,0.005,false));for(let i=0;i<4;i++)g.add(box(w*0.55-i*0.2,0.025,0.005,mat.std([0x2b4c8c,0xc8202a,0x2b4c8c,0x2a2d33][i]),-w*0.15,h*0.3-i*0.18,0.025,false));s.add(g);},
  tree(s,x,z,sc=1){const g=group(x,0,z);g.add(cyl(0.12*sc,0.16*sc,1.6*sc,mat.std(0x5b3f2a),0,0.8*sc,0,10));for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.SphereGeometry((0.9-i*0.15)*sc,14,10),mat.std([0x3f7a3a,0x4a8a41,0x2f6a2f][i],{roughness:0.9}));c.position.set((i-1)*0.35*sc,(1.9+i*0.45)*sc,(i%2?0.3:-0.3)*sc);c.castShadow=true;g.add(c);}s.add(g);},
};

/* ---- vehicles: side profile extruded to width, true scale ---- */
// Side profiles, rear (-x) to front (+x), metres. cabFrom limits the glass
// band to the cab: an ambulance box or a fire-engine body is not a window.
// NOTE: this whole runtime lives inside a String.raw literal — never put a
// backtick in a comment here, it terminates the literal and breaks the module.
const PROFILES={
  sedan:{pts:[[-2.3,0.35],[-2.25,0.7],[-1.5,0.8],[-1.0,1.35],[0.5,1.4],[1.4,0.85],[2.3,0.75],[2.35,0.35]],w:1.85,wheel:0.34,axle:[-1.45,1.45],cabFrom:-9,doors:[0.15,-1.0]},
  suv:{pts:[[-2.45,0.35],[-2.4,0.9],[-1.6,0.95],[-1.25,1.75],[1.2,1.78],[1.8,1.0],[2.45,0.9],[2.5,0.35]],w:1.95,wheel:0.38,axle:[-1.55,1.55],cabFrom:-9,doors:[0.2,-1.05]},
  // Tall patient box behind, lower cab with a raked windscreen in front.
  van:{pts:[[-2.9,0.38],[-2.88,2.4],[0.6,2.42],[0.65,2.0],[1.5,1.95],[2.3,1.15],[2.9,1.05],[2.92,0.38]],w:2.1,wheel:0.38,axle:[-1.8,1.7],cabFrom:0.62,doors:[1.15,-0.4]},
  // Long equipment body, slightly lower cab, raked windscreen, short hood.
  // Street cars: a low coupe and a short hatchback.
  coupe:{pts:[[-2.2,0.42],[-2.15,0.66],[-1.75,0.74],[-1.1,1.18],[0.15,1.24],[1.1,0.8],[2.2,0.7],[2.25,0.42]],w:1.9,wheel:0.35,axle:[-1.4,1.4],cabFrom:-9,doors:[0.0]},
  hatch:{pts:[[-1.9,0.42],[-1.85,0.8],[-1.6,1.44],[0.35,1.48],[1.15,0.88],[1.9,0.76],[1.95,0.42]],w:1.78,wheel:0.32,axle:[-1.25,1.25],cabFrom:-9,doors:[0.05,-0.9]},
  truck:{pts:[[-4.0,0.42],[-3.98,2.95],[-0.2,2.95],[-0.15,2.7],[2.4,2.7],[3.15,1.85],[3.9,1.35],[4.0,0.42]],w:2.45,wheel:0.5,axle:[-2.5,2.2],cabFrom:-0.16,doors:[2.0]},
};
export function vehicle(s,kind,x,z,rot=0,{color=0xffffff,stripe="#1f4e79",unit="",lightbar=true,type="police",livery=true,spoiler=false,kit=false,wheelColor=0xc9ccd1,tint=0x1b2530,gloss=0.28}={}){
  const P=PROFILES[kind]||PROFILES.sedan;const g=group(x,0,z,rot);
  const bottom=P.pts[0][1],front=P.pts[P.pts.length-1][0],rear=P.pts[0][0],len=front-rear,W=P.w,archR=P.wheel+0.06;
  // Side profile with wheel arches cut into the sill, extruded to width and
  // painted with a clear-coated physical material (reflects the environment).
  const shape=new THREE.Shape();P.pts.forEach((p,i)=>i?shape.lineTo(p[0],p[1]):shape.moveTo(p[0],p[1]));
  for(const ax of [...P.axle].sort((a,b)=>b-a)){shape.lineTo(ax+archR,bottom);shape.absarc(ax,bottom,archR,0,Math.PI,false);}
  shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:W,bevelEnabled:true,bevelThickness:0.07,bevelSize:0.07,bevelSegments:5});geo.translate(0,0,-W/2);
  const paint=new THREE.MeshPhysicalMaterial({color,roughness:gloss,metalness:0.3,clearcoat:1.0,clearcoatRoughness:0.06});
  const body=new THREE.Mesh(geo,paint);body.castShadow=true;body.receiveShadow=true;g.add(body);
  const dark=mat.std(0x17191c,{roughness:0.7});const trim=mat.std(0x2a2d31,{roughness:0.5,metalness:0.2});const chrome=new THREE.MeshStandardMaterial({color:0xb9bec6,roughness:0.25,metalness:0.9});
  // wheel wells (so the arches read as enclosed), sill trim, bumpers, grille, plates
  for(const ax of P.axle){const well=cyl(archR-0.02,archR-0.02,W-0.3,mat.std(0x0e0f11,{roughness:1}),ax,bottom,0,24);well.rotation.x=Math.PI/2;g.add(well);}
  for(const sd of[-1,1])g.add(box(len*0.96,0.05,0.04,dark,(front+rear)/2,bottom+0.04,sd*(W/2+0.06),false));
  g.add(box(0.14,0.18,W+0.06,trim,front-0.02,bottom+0.14,0));g.add(box(0.14,0.18,W+0.06,trim,rear+0.02,bottom+0.14,0));
  g.add(box(0.05,0.17,W*0.42,dark,front+0.045,bottom+0.34,0,false));for(let i=0;i<5;i++)g.add(box(0.06,0.014,W*0.4,chrome,front+0.05,bottom+0.28+i*0.032,0,false));
  g.add(box(0.02,0.11,0.5,mat.std(0xf4f4f0,{roughness:0.5}),front+0.075,bottom+0.13,0,false));g.add(box(0.02,0.11,0.5,mat.std(0xf4f4f0,{roughness:0.5}),rear-0.075,bottom+0.13,0,false));
  // glass band with pillars and mirrors
  const gb=P.pts.filter(p=>p[1]>1.0&&p[0]>P.cabFrom);
  if(gb.length>=2){const top=Math.max(...gb.map(p=>p[1]));const gs=new THREE.Shape();gb.forEach((p,i)=>i?gs.lineTo(p[0],p[1]-0.06):gs.moveTo(p[0],p[1]-0.06));const last=gb[gb.length-1],first=gb[0];gs.lineTo(last[0],top-0.55);gs.lineTo(first[0],top-0.55);gs.closePath();
    const gg=new THREE.ExtrudeGeometry(gs,{depth:W+0.02,bevelEnabled:false});gg.translate(0,0,-(W+0.02)/2);g.add(new THREE.Mesh(gg,new THREE.MeshPhysicalMaterial({color:tint,roughness:0.08,metalness:0.2,clearcoat:1.0})));
    const xs=gb.map(p=>p[0]);const mid=(xs[0]+xs[xs.length-1])/2;
    for(const px of [...xs.slice(1,-1),mid])for(const sd of[-1,1])g.add(box(0.06,0.5,0.03,dark,px,top-0.32,sd*(W/2+0.025),false));
    const mx=xs[xs.length-1]-0.12,my=top-0.5;for(const sd of[-1,1]){g.add(box(0.14,0.09,0.12,paint,mx,my,sd*(W/2+0.14),false));g.add(box(0.03,0.03,0.12,dark,mx,my,sd*(W/2+0.08),false));}
  }
  // door seams and handles
  for(const dx of (P.doors||[0.1,-1.0]))for(const sd of[-1,1]){g.add(box(0.012,0.36,0.006,dark,dx,bottom+0.25,sd*(W/2+0.075),false));g.add(box(0.11,0.028,0.014,chrome,dx-0.2,bottom+0.5,sd*(W/2+0.078),false));}
  // livery stripe panels on both sides
  if(livery){const lv=new THREE.MeshStandardMaterial({map:tex.livery("#ffffff",stripe,unit),roughness:0.4});for(const side of[-1,1]){const pl=new THREE.Mesh(new THREE.PlaneGeometry(len*0.86,0.42),lv);pl.position.set(0,0.78,side*(W/2+0.085));pl.rotation.y=side>0?0:Math.PI;g.add(pl);}}
  // wheels: tyre, alloy rim with five dark spoke gaps, hub
  for(const ax of P.axle)for(const sd of[-1,1]){const zc=sd*(W/2-0.02);
    const tyre=cyl(P.wheel,P.wheel,0.24,mat.std(0x141517,{roughness:0.95}),ax,P.wheel,zc,36);tyre.rotation.x=Math.PI/2;g.add(tyre);
    const rimR=P.wheel*0.64;const rim=cyl(rimR,rimR,0.25,new THREE.MeshStandardMaterial({color:wheelColor,roughness:0.25,metalness:0.85}),ax,P.wheel,zc,32);rim.rotation.x=Math.PI/2;g.add(rim);
    const hub=cyl(rimR*0.22,rimR*0.22,0.27,mat.std(0x3a3d42,{roughness:0.5,metalness:0.3}),ax,P.wheel,zc,16);hub.rotation.x=Math.PI/2;g.add(hub);
    for(let k=0;k<5;k++){const a=k*1.2566+0.3;const gap=box(rimR*0.5,rimR*0.3,0.012,mat.std(0x101214,{roughness:0.8}),0,0,0,false);gap.position.set(ax+Math.cos(a)*rimR*0.56,P.wheel+Math.sin(a)*rimR*0.56,zc+sd*0.128);gap.rotation.z=a;g.add(gap);}}
  // lights
  g.add(box(0.12,0.16,0.5,mat.emissive(0xfff2cc,1.4),P.pts[P.pts.length-1][0]-0.02,0.7,P.w/2-0.4,false));g.add(box(0.12,0.16,0.5,mat.emissive(0xfff2cc,1.4),P.pts[P.pts.length-1][0]-0.02,0.7,-P.w/2+0.4,false));
  g.add(box(0.1,0.14,0.4,mat.emissive(0xff3b30,1.2),P.pts[0][0]+0.02,0.7,P.w/2-0.35,false));g.add(box(0.1,0.14,0.4,mat.emissive(0xff3b30,1.2),P.pts[0][0]+0.02,0.7,-P.w/2+0.35,false));
  // Tuner options: a rear wing on stands, and a body kit (side skirts + front splitter).
  if(spoiler){const ry=P.pts.filter(p=>p[0]<P.pts[0][0]+0.9).reduce((m,p)=>Math.max(m,p[1]),0);const bm=mat.std(color,{roughness:gloss,metalness:0.15});g.add(box(0.3,0.04,P.w*0.92,bm,P.pts[0][0]+0.3,ry+0.24,0));for(const sd of[-1,1])g.add(box(0.22,0.22,0.05,mat.std(0x151719,{roughness:0.6}),P.pts[0][0]+0.3,ry+0.11,sd*P.w*0.36,false));}
  if(kit){const km=mat.std(0x151719,{roughness:0.6});const skL=P.axle[1]-P.axle[0]-2*archR-0.1,skX=(P.axle[0]+P.axle[1])/2;for(const sd of[-1,1])g.add(box(skL,0.09,0.1,km,skX,P.pts[0][1]-0.02,sd*(P.w/2+0.1)));g.add(box(0.22,0.08,P.w+0.12,km,P.pts[P.pts.length-1][0]-0.06,P.pts[0][1]-0.04,0));g.add(box(0.18,0.08,P.w+0.08,km,P.pts[0][0]+0.06,P.pts[0][1]-0.04,0));}
  if(lightbar){const topY=Math.max(...P.pts.map(p=>p[1]));const bar=group(kind==="truck"?1.4:kind==="van"?-1.0:-0.2,topY+0.12,0);bar.add(box(1.1,0.14,0.28,mat.std(0x22262b,{roughness:0.4}),0,0,0));
    const seg=type==="fire"?[0xff2a1f,0xff2a1f,0xffffff,0xff2a1f]:type==="ems"?[0xff2a1f,0xffffff,0xff2a1f,0xffffff]:[0xff2a1f,0x2a6dff,0xffffff,0x2a6dff];
    seg.forEach((c,i)=>bar.add(box(0.24,0.1,0.26,mat.emissive(c,2.4),-0.41+i*0.27,0.03,0,false)));g.add(bar);}
  // Fire apparatus: side compartment doors with handles and a roof ladder,
  // so the body reads as equipment storage rather than a plain red block.
  if(kind==="truck"){for(const side of[-1,1])for(let i=0;i<4;i++){g.add(box(0.75,1.45,0.03,mat.std(0xa81a22,{roughness:0.5}),-3.4+i*0.95,1.55,side*(P.w/2+0.095),false));g.add(box(0.5,0.04,0.04,mat.std(0xd8dbe0,{roughness:0.4,metalness:0.2}),-3.4+i*0.95,1.2,side*(P.w/2+0.12),false));}
    const lad=group(-2.1,3.05,0);const lm=mat.std(0xd8dbe0,{roughness:0.4,metalness:0.2});for(const z of[-0.3,0.3])lad.add(box(3.6,0.05,0.05,lm,0,0,z,false));for(let i=0;i<8;i++)lad.add(box(0.05,0.05,0.6,lm,-1.6+i*0.46,0,0,false));g.add(lad);}
  s.add(g);return g;
}

/* ---- exterior base: asphalt, kerbs, sky ---- */
export function exterior(scene,{size=60,sky=0xbfd6ea,fog=true,markings=true}={}){
  const sc=new THREE.Color(sky);scene.background=sc;if(fog)scene.fog=new THREE.Fog(sky,35,110);
  if(sc.r+sc.g+sc.b>1.2){skyDome(scene,sc.clone().lerp(new THREE.Color(0xffffff),0.1),sc.clone().lerp(new THREE.Color(0x4d8fd6),0.7));}
  const g=new THREE.Mesh(new THREE.PlaneGeometry(size,size),mat.mapped(tex.asphalt(size/5),{roughness:0.95}));g.rotation.x=-Math.PI/2;g.receiveShadow=true;scene.add(g);
  if(markings){const lm=mat.std(0xe9e6d8,{roughness:0.9});for(let i=-size/2;i<size/2;i+=3)scene.add(box(1.6,0.01,0.14,lm,i+0.8,0.006,0,false));}
}
export function buildingBlock(scene,x,z,{w=18,d=12,h=9,color=0xd9d3c8,rows=2,cols=6,canopy=false}={}){
  const g=group(x,0,z);g.add(box(w,h,d,mat.mapped(tex.concrete("#cfc9be",3),{roughness:0.9}),0,h/2,0));
  // Windows are recessed glazing in a light frame with a centre mullion, not
  // flat black rectangles: the frame catches light and the glass reflects sky.
  const gm=new THREE.MeshStandardMaterial({color:0x4a6a8a,roughness:0.06,metalness:0.75});
  const fm=mat.std(0xe9e5dd,{roughness:0.7});
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const ww=w/cols*0.55,wx=-w/2+(c+0.5)*(w/cols),wy=1.6+r*(h-2.2)/Math.max(1,rows-1||1);
    g.add(box(ww+0.16,1.66,0.1,fm,wx,wy,d/2+0.01,false));g.add(box(ww,1.5,0.06,gm,wx,wy,d/2+0.06,false));g.add(box(0.06,1.5,0.09,fm,wx,wy,d/2+0.07,false));g.add(box(ww+0.2,0.08,0.2,fm,wx,wy-0.83,d/2+0.08,false));}
  // Ground-floor entrance: a pair of glazed doors under a slim canopy.
  g.add(box(2.6,2.5,0.08,mat.std(0x3b4a5a,{roughness:0.2,metalness:0.5}),0,1.25,d/2+0.05,false));g.add(box(0.06,2.5,0.1,fm,0,1.25,d/2+0.07,false));g.add(box(3.2,0.12,1.2,mat.std(0x7c838b),0,2.7,d/2+0.6));
  if(canopy){g.add(box(w*0.5,0.25,4,mat.std(0x8a8f96),0,3.6,d/2+2));for(const cx of[-w*0.22,w*0.22])g.add(cyl(0.12,0.12,3.6,mat.metal(0x6f7378),cx,1.8,d/2+3.8,10));}
  scene.add(g);return g;
}
export function helipad(scene,x,y,z,r=4){const g=group(x,y,z);g.add(cyl(r,r,0.06,mat.std(0x4a4d52,{roughness:0.95}),0,0.03,0,48));
  const ring=new THREE.Mesh(new THREE.RingGeometry(r*0.78,r*0.86,48),mat.std(0xf2f2f2));ring.rotation.x=-Math.PI/2;ring.position.y=0.07;g.add(ring);
  g.add(box(0.5,0.02,r*0.9,mat.std(0xf2f2f2),-r*0.28,0.07,0,false));g.add(box(0.5,0.02,r*0.9,mat.std(0xf2f2f2),r*0.28,0.07,0,false));g.add(box(r*0.6,0.02,0.5,mat.std(0xf2f2f2),0,0.07,0,false));
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.add(box(0.14,0.12,0.14,mat.emissive(0x33ff77,1.5),Math.cos(a)*r*0.95,0.1,Math.sin(a)*r*0.95,false));}scene.add(g);}

/* ---- voxel world: unit cubes, 16px nearest-filtered pixel textures ---- */
const PX=16;
function pixTex(paint){const c=canvas(PX,PX),x=c.getContext("2d");paint(x);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;return t;}
function np(base,vary,seed){return x=>{let s=seed*7919+13;const r=()=>{s=(s*9301+49297)%233280;return s/233280;};for(let i=0;i<PX;i++)for(let j=0;j<PX;j++){const v=(r()-0.5)*vary;x.fillStyle="rgb("+(base[0]+v|0)+","+(base[1]+v|0)+","+(base[2]+v|0)+")";x.fillRect(i,j,1,1);}};}
const BLOCKS={
  grass:{top:np([98,158,62],36,3),side:x=>{np([134,96,67],28,4)(x);for(let i=0;i<PX;i++){x.fillStyle="rgb(98,158,62)";x.fillRect(i,0,1,2+((i*7)%3));}},bottom:np([134,96,67],28,4)},
  dirt:{all:np([134,96,67],28,5)},
  stone:{all:np([124,124,124],34,6)},
  cobble:{all:x=>{np([118,118,118],38,7)(x);x.fillStyle="rgba(0,0,0,.35)";for(let k=0;k<14;k++){x.fillRect((k*5)%PX,(k*7)%PX,3,1);x.fillRect((k*5)%PX,(k*7)%PX,1,3);}}},
  planks:{all:x=>{np([170,134,82],22,8)(x);x.fillStyle="rgba(60,35,10,.55)";for(let j=0;j<PX;j+=4)x.fillRect(0,j,PX,1);x.fillRect(8,0,1,4);x.fillRect(0,4,1,4);x.fillRect(8,8,1,4);x.fillRect(0,12,1,4);}},
  log:{top:x=>{np([172,136,84],18,9)(x);x.strokeStyle="rgba(90,60,30,.75)";for(let rr=2;rr<8;rr+=2){x.beginPath();x.arc(8,8,rr,0,7);x.stroke();}},side:x=>{np([98,72,42],24,10)(x);x.fillStyle="rgba(40,25,10,.5)";for(let i=0;i<PX;i+=3)x.fillRect(i,0,1,PX);}},
  leaves:{all:x=>{np([58,128,40],56,11)(x);for(let k=0;k<22;k++)x.clearRect((k*11)%PX,(k*13)%PX,1,1);},alphaTest:0.5},
  water:{all:np([52,92,196],26,12),transparent:0.72},
  sand:{all:np([218,206,162],20,13)},
  gravel:{all:np([128,124,120],46,14)},
  stonebrick:{all:x=>{np([118,118,118],22,15)(x);x.fillStyle="rgba(0,0,0,.45)";x.fillRect(0,7,PX,1);x.fillRect(0,15,PX,1);x.fillRect(7,0,1,8);x.fillRect(15,0,1,8);x.fillRect(3,8,1,8);x.fillRect(11,8,1,8);}},
  obsidian:{all:np([24,16,42],18,16)},
  portal:{all:np([150,64,224],56,17),transparent:0.85,emissive:0x7a2fd0},
  wool_red:{all:np([178,42,42],18,18)},wool_white:{all:np([226,226,226],12,19)},wool_blue:{all:np([44,66,182],18,20)},wool_yellow:{all:np([214,182,54],18,23)},
  glowstone:{all:np([240,202,112],36,21),emissive:0xffc857},
  glass:{all:x=>{x.clearRect(0,0,PX,PX);x.fillStyle="rgba(200,230,255,.32)";x.fillRect(0,0,PX,PX);x.fillStyle="rgba(255,255,255,.65)";x.fillRect(0,0,PX,1);x.fillRect(0,0,1,PX);},transparent:0.5},
  snow:{all:np([240,244,248],8,22)},
  darkstone:{all:np([70,70,74],30,24)},
  ice:{all:np([150,200,240],20,25),transparent:0.8},
  lava:{all:np([230,110,30],60,26),emissive:0xff6a00},
  fence:{all:x=>{x.clearRect(0,0,PX,PX);np([170,134,82],22,8)(x);}},
};
const matCache=new Map();
function blockMats(name){if(matCache.has(name))return matCache.get(name);const b=BLOCKS[name]||BLOCKS.stone;
  const mk=(paint)=>{const o={map:pixTex(paint),roughness:0.95,metalness:0};if(b.alphaTest){o.alphaTest=b.alphaTest;o.transparent=true;}if(b.transparent){o.transparent=true;o.opacity=b.transparent;}if(b.emissive){o.emissive=new THREE.Color(b.emissive);o.emissiveIntensity=1.2;o.emissiveMap=o.map;}return new THREE.MeshStandardMaterial(o);};
  const top=mk(b.top||b.all),side=mk(b.side||b.all),bottom=mk(b.bottom||b.top||b.all);const arr=[side,side,top,bottom,side,side];matCache.set(name,arr);return arr;}

export function voxel(scene){
  const cells=new Map();const key=(x,y,z)=>x+","+y+","+z;
  const V={
    set(x,y,z,t){cells.set(key(x|0,y|0,z|0),t);},get(x,y,z){return cells.get(key(x|0,y|0,z|0));},
    del(x,y,z){cells.delete(key(x|0,y|0,z|0));},
    fill(x1,y1,z1,x2,y2,z2,t){for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let z=Math.min(z1,z2);z<=Math.max(z1,z2);z++)V.set(x,y,z,t);},
    clear(x1,y1,z1,x2,y2,z2){for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let z=Math.min(z1,z2);z<=Math.max(z1,z2);z++)V.del(x,y,z);},
    walls(x1,y1,z1,x2,y2,z2,t){for(let h=y1;h<=y2;h++){for(let x=x1;x<=x2;x++){V.set(x,h,z1,t);V.set(x,h,z2,t);}for(let z=z1;z<=z2;z++){V.set(x1,h,z,t);V.set(x2,h,z,t);}}},
    terrain(size,{base=8,amp=3,water=null,seed=1}={}){let s=seed*1013;const r=()=>{s=(s*9301+49297)%233280;return s/233280;};const g=[];const n=Math.ceil(size/8)+2;for(let i=0;i<n;i++){g[i]=[];for(let j=0;j<n;j++)g[i][j]=r();}
      const lerp=(a,b,t)=>a+(b-a)*(t*t*(3-2*t));const nz=(x,z)=>{const fx=x/8,fz=z/8,i=Math.floor(fx),j=Math.floor(fz),tx=fx-i,tz=fz-j;return lerp(lerp(g[i][j],g[i+1][j],tx),lerp(g[i][j+1],g[i+1][j+1],tx),tz);};
      const half=size/2;V.height=(x,z)=>{const xx=x+half,zz=z+half;if(xx<0||zz<0||xx>=size||zz>=size)return base;return Math.round(base+(nz(xx,zz)-0.5)*2*amp);};
      for(let x=-half;x<half;x++)for(let z=-half;z<half;z++){const h=V.height(x,z);for(let y=0;y<=h;y++)V.set(x,y,z,y===h?(water!==null&&h<water?"sand":"grass"):y>h-3?"dirt":"stone");
        if(water!==null&&h<water)for(let y=h+1;y<=water;y++)V.set(x,y,z,"water");}
      return V;},
    flatten(x1,z1,x2,z2,h,t="grass"){for(let x=x1;x<=x2;x++)for(let z=z1;z<=z2;z++){for(let y=h+1;y<h+12;y++)V.del(x,y,z);for(let y=0;y<=h;y++)V.set(x,y,z,y===h?t:y>h-3?"dirt":"stone");}},
    tree(x,z,h=5){const y=V.height?V.height(x,z):0;for(let k=1;k<=h;k++)V.set(x,y+k,z,"log");for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=h-2;dy<=h+1;dy++){const d=Math.abs(dx)+Math.abs(dz)+Math.abs(dy-(h-0.5));if(d<=4&&!(dx===0&&dz===0&&dy<h))V.set(x+dx,y+dy,z+dz,"leaves");}},
    house(x,z,w,d,h,{wall="planks",frame="log",roof="cobble",door="s"}={}){const y=(V.height?V.height(x,z):0);V.flatten(x-1,z-1,x+w,z+d,y,"grass");
      V.fill(x,y+1,z,x+w-1,y+h,z+d-1,wall);V.clear(x+1,y+1,z+1,x+w-2,y+h,z+d-2);
      for(const[cx,cz]of[[x,z],[x+w-1,z],[x,z+d-1],[x+w-1,z+d-1]])V.fill(cx,y+1,cz,cx,y+h,cz,frame);
      for(let k=0;k<=Math.ceil(w/2);k++){V.fill(x-1+k,y+h+1+k,z-1,x+w-k,y+h+1+k,z+d,roof);if(k>0)V.clear(x+k,y+h+1+k,z,x+w-1-k,y+h+1+k,z+d-1);}
      const dz=door==="s"?z+d-1:z;V.del(x+Math.floor(w/2),y+1,dz);V.del(x+Math.floor(w/2),y+2,dz);
      V.set(x+1,y+2,dz,"glass");V.set(x+w-2,y+2,dz,"glass");},
    tower(x,z,r,h,t="stonebrick"){const y=V.height?V.height(x,z):0;for(let k=1;k<=h;k++)V.walls(x-r,y+k,z-r,x+r,y+k,z+r,t);V.fill(x-r,y+h+1,z-r,x+r,y+h+1,z,"stone");V.clear(x-r+1,y+h+1,z-r+1,x+r-1,y+h+1,z-1);
      for(let dx=-r;dx<=r;dx+=2){V.set(x+dx,y+h+2,z-r,t);V.set(x+dx,y+h+2,z+r,t);}for(let dz=-r;dz<=r;dz+=2){V.set(x-r,y+h+2,z+dz,t);V.set(x+r,y+h+2,z+dz,t);}},
    build(){const groups=new Map();for(const[k,t]of cells){if(!groups.has(t))groups.set(t,[]);groups.get(t).push(k.split(",").map(Number));}
      const geo=new THREE.BoxGeometry(1,1,1);const m4=new THREE.Matrix4();
      for(const[t,list]of groups){const im=new THREE.InstancedMesh(geo,blockMats(t),list.length);list.forEach((p,i)=>{m4.makeTranslation(p[0]+0.5,p[1]+0.5,p[2]+0.5);im.setMatrixAt(i,m4);});im.castShadow=!(BLOCKS[t]&&BLOCKS[t].transparent);im.receiveShadow=true;scene.add(im);}
      return cells.size;},
  };return V;
}
export function voxelSky(kind="day"){const s=new THREE.Scene();const col={day:0x8fbce8,dusk:0xe0956a,night:0x0b1224}[kind]||0x8fbce8;s.background=new THREE.Color(col);s.fog=new THREE.Fog(col,55,150);
  if(kind==="night"){s.add(new THREE.HemisphereLight(0x5a6d9c,0x1a1c24,0.65));const m=new THREE.DirectionalLight(0x8aa4d8,0.95);m.position.set(-20,30,10);m.castShadow=true;m.shadow.mapSize.set(2048,2048);const c=m.shadow.camera;c.left=-60;c.right=60;c.top=60;c.bottom=-60;c.far=140;s.add(m);}
  else{s.add(new THREE.HemisphereLight(kind==="dusk"?0xffc9a0:0xcfe0f5,0x5a6b45,kind==="dusk"?0.5:0.7));const d=new THREE.DirectionalLight(kind==="dusk"?0xffb070:0xfff4e0,kind==="dusk"?1.6:2.0);d.position.set(kind==="dusk"?-30:24,kind==="dusk"?14:38,18);d.castShadow=true;d.shadow.mapSize.set(2048,2048);d.shadow.bias=-0.0008;const c=d.shadow.camera;c.left=-60;c.right=60;c.top=60;c.bottom=-60;c.near=1;c.far=160;s.add(d);}
  return s;}
export function torch(scene,x,y,z,V){if(V)V.set(x,y,z,"glowstone");const l=new THREE.PointLight(0xffb454,18,12,1.5);l.position.set(x+0.5,y+1.2,z+0.5);scene.add(l);}

/* ---- world presets, each a real build of the product it stands for ---- */
export const presets={
  medievalTown(V,scene,night=false){V.terrain(110,{base:6,amp:2,seed:4});
    // level the town plateau, then the wall ring
    V.flatten(-26,-26,26,26,7,"grass");V.walls(-25,8,-25,25,12,25,"stonebrick");V.walls(-25,13,-25,25,13,25,"stonebrick");
    for(let i=-25;i<=25;i+=2){V.del(i,13,-25);V.del(i,13,25);V.del(-25,13,i);V.del(25,13,i);}
    for(const[x,z]of[[-25,-25],[25,-25],[-25,25],[25,25]])V.tower(x,z,2,9);
    V.clear(-2,8,25,2,11,25);V.clear(-2,8,-25,2,11,-25);// gates
    // cobble roads and market square
    V.fill(-1,7,-24,1,7,24,"cobble");V.fill(-24,7,-1,24,7,1,"cobble");V.fill(-8,7,-8,8,7,8,"cobble");V.fill(-2,7,-2,2,7,2,"stonebrick");
    for(const[sx,sz,c]of[[-6,-6,"wool_red"],[5,-6,"wool_blue"],[-6,5,"wool_yellow"],[5,5,"wool_white"]]){for(const[px,pz]of[[sx,sz],[sx+2,sz],[sx,sz+2],[sx+2,sz+2]])V.fill(px,8,pz,px,10,pz,"fence");V.fill(sx-1,11,sz-1,sx+3,11,sz+3,c);V.set(sx+1,8,sz+1,"planks");}
    // houses around the square and along the roads
    V.house(-18,-16,6,5,3);V.house(11,-17,7,5,3,{wall:"cobble"});V.house(-19,10,6,6,3,{wall:"stonebrick",roof:"planks"});V.house(12,11,6,5,3);V.house(-10,14,5,5,3,{roof:"planks"});V.house(6,-22,5,5,3);
    // portal hall on the north side: stonebrick hall with six portals
    V.fill(-9,8,-22,9,8,-14,"stonebrick");V.walls(-9,9,-22,9,12,-14,"stonebrick");V.clear(-9,9,-14,9,11,-14);V.fill(-9,13,-22,9,13,-14,"planks");
    for(let k=0;k<6;k++){const px=-7+k*3;V.fill(px,9,-21,px+1,12,-21,"obsidian");V.fill(px,10,-21,px+1,11,-21,"portal");V.del(px,10,-21);V.del(px+1,10,-21);V.del(px,11,-21);V.del(px+1,11,-21);V.fill(px,10,-21,px+1,11,-21,"portal");}
    for(const[x,z]of[[-34,-30],[36,-28],[-38,20],[40,26],[-30,38],[32,40],[0,-40],[-44,0],[44,-6]])V.tree(x,z,5+(Math.abs(x+z)%3));
    if(night){for(const[x,z]of[[-8,-8],[8,-8],[-8,8],[8,8],[-1,-23],[1,-23],[-1,23],[1,23],[-23,0],[23,0]])torch(scene,x,9,z,V);}
  },
};

/* ---- camera ---- */
export function camera(pos,look,fov=48){const c=new THREE.PerspectiveCamera(fov,W/H,0.1,300);c.position.set(...pos);c.lookAt(...look);return c;}
export function orthoTop(cx,cz,halfW){const c=new THREE.OrthographicCamera(-halfW,halfW,halfW*(H/W),-halfW*(H/W),0.1,100);c.position.set(cx,40,cz);c.lookAt(cx,0,cz);c.up.set(0,0,-1);return c;}
export function scene(bg=0x000000){const s=new THREE.Scene();s.background=new THREE.Color(bg);return s;}
export {THREE};
`

/* ------------------------------------------------------------- builders (node) */

/** Wrap scene code (which may `import` from the runtime) into a document. */
export function threeDoc(sceneCode) {
  // The runtime is inlined as a data-URL module so the scene can import it
  // by name without another routed file.
  const runtimeUrl = `data:text/javascript;base64,${Buffer.from(RUNTIME).toString("base64")}`
  const head = `<script type="importmap">{"imports":{"three":"/three.module.js","rt":"${runtimeUrl}"}}</script>`
  return `<!doctype html><html><head><meta charset="utf-8">${head}
<style>html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#000}canvas{display:block}</style>
</head><body><script type="module">${sceneCode}</script></body></html>`
}

/**
 * Interior view of a room. `spec` describes the room and its furnishings in
 * metres; `view` positions the camera. Everything the buyer sees corresponds
 * to a real feature of the product it is rendered for.
 */
export function interior({ spec, view, sign }) {
  return threeDoc(`
import {makeRenderer,finish,room,props,wallSign,camera,scene as mkScene,daylight,environment,mat,THREE} from "rt";
const r=makeRenderer();const s=mkScene(${spec.bg ?? 0x000000});
${spec.env ? `environment(r,s,${spec.env});` : ""}
const R=room(s,${JSON.stringify(spec.room)});
${spec.daylight ? `daylight(s,{intensity:${spec.daylight.intensity ?? 1.4},pos:${JSON.stringify(spec.daylight.pos ?? [6, 9, 4])},size:14,hemi:${spec.daylight.hemi ?? 0.5}});` : `s.add(new THREE.HemisphereLight(0xe9eef5,0x5a5650,0.5));`}
${spec.club ? `{s.add(new THREE.HemisphereLight(0x4a2a6a,0x120a18,0.3));
  for(const [x,z,c] of [[-3,-2,0xff2fa0],[3,-2,0x2f8fff],[0,2,0xa03fff],[-4,3,0xff9f2f]]){const l=new THREE.SpotLight(c,90,16,0.6,0.6,1.2);l.position.set(x,R.h-0.1,z);l.target.position.set(x*0.4,0,z*0.4);s.add(l);s.add(l.target);}
  for(let i=0;i<6;i++)for(let j=0;j<4;j++){const t=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.95),mat.emissive([0xff2fa0,0x2f8fff,0xa03fff,0x2fd3ff][(i+j)%4],0.9));t.rotation.x=-Math.PI/2;t.position.set(-4.5+i*1.0,0.012,-1.5+j*1.0);s.add(t);}
  const pl=new THREE.PointLight(0xff5fb0,30,8,1.5);pl.position.set(0,1.6,0);s.add(pl);}` : ""}
${spec.room.panels === false && !spec.club ? `{const f=new THREE.PointLight(0xfff0dc,14,11,1.2);f.position.set(0,R.h-0.3,0);s.add(f);}` : ""}
${(spec.items || []).map((it) => `props.${it.type}(s,${JSON.stringify(it.args).slice(1, -1)});`).join("\n")}
${sign ? `wallSign(s,${JSON.stringify(sign.text)},${sign.at.join(",")},${sign.rot ?? 0},${JSON.stringify(sign.opts || {})});` : ""}
const cam=camera(${JSON.stringify(view.pos)},${JSON.stringify(view.look)},${view.fov ?? 48});
finish(r,s,cam);`)
}

/** Exterior scene: ground, sky, buildings, vehicles, props. */
export function exteriorScene({ items, view, sky, fog = true, daylight: dl }) {
  return threeDoc(`
import {makeRenderer,finish,exterior,buildingBlock,helipad,vehicle,props,camera,scene as mkScene,daylight,environment,box,cyl,group,mat,tex,wallSign,THREE} from "rt";
const r=makeRenderer();const s=mkScene();
environment(r,s,${dl && dl.intensity < 1 ? 0.18 : 0.45});
exterior(s,{sky:${sky ?? 0xbfd6ea},fog:${fog}});
daylight(s,${JSON.stringify(dl || { intensity: 2.4, pos: [14, 18, 8], size: 26, hemi: 0.6 })});
${items.map((it) => it).join("\n")}
const cam=camera(${JSON.stringify(view.pos)},${JSON.stringify(view.look)},${view.fov ?? 46});
finish(r,s,cam);`)
}

/**
 * A Minecraft-style block world. `preset` names a real build; `view` sets the
 * camera. Everything is unit cubes with 16 px nearest-filtered textures, so
 * the result keeps the block-world logic the brief asks for.
 */
export function world({ preset, build, view, sky = "day", night = false, exposure = 1.0 }) {
  // Either a named preset from the runtime, or inline build code (from
  // worlds.mjs) run with V, s and torch in scope.
  return threeDoc(`
import {makeRenderer,finish,camera,voxel,voxelSky,presets,torch,THREE} from "rt";
const r=makeRenderer();r.toneMappingExposure=${exposure};
const s=voxelSky(${JSON.stringify(sky)});const V=voxel(s);
${build ? build : `presets.${preset}(V,s,${night});`}
V.build();
const cam=camera(${JSON.stringify(view.pos)},${JSON.stringify(view.look)},${view.fov ?? 60});
finish(r,s,cam);`)
}

/** Top-down orthographic layout of a multi-room plan (a real "layout overview"). */
export function layoutOverview({ rooms, labels, half = 14, center = [0, 0] }) {
  return threeDoc(`
import {makeRenderer,finish,room,props,camera,orthoTop,scene as mkScene,mat,box,tex,THREE} from "rt";
const r=makeRenderer();const s=mkScene(0xf4f2ee);
s.add(new THREE.HemisphereLight(0xffffff,0xbbbbbb,1.1));const d=new THREE.DirectionalLight(0xffffff,0.9);d.position.set(6,20,4);s.add(d);
const wm=mat.std(0x3a3f47);const fm=(c)=>mat.std(c,{roughness:0.9});
${rooms.map((rm) => `{const g=new THREE.Group();g.position.set(${rm.x},0,${rm.z});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(${rm.w},${rm.d}),fm(${rm.color ?? 0xe4e7ec}));f.rotation.x=-Math.PI/2;f.position.y=0.01;g.add(f);
  g.add(box(${rm.w},0.5,0.16,wm,0,0.25,-${rm.d}/2));g.add(box(${rm.w},0.5,0.16,wm,0,0.25,${rm.d}/2));g.add(box(0.16,0.5,${rm.d},wm,-${rm.w}/2,0.25,0));g.add(box(0.16,0.5,${rm.d},wm,${rm.w}/2,0.25,0));
  ${(rm.doors || []).map((dr) => `g.add(box(${dr.w ?? 1.1},0.52,0.2,mat.std(0xf4f2ee),${dr.x},0.26,${dr.z}));`).join("")}
  ${(rm.furniture || []).map((f) => `g.add(box(${f.w},0.3,${f.d},mat.std(${f.color ?? 0x9aa5b1}),${f.x},0.16,${f.z}));`).join("")}
  s.add(g);}`).join("\n")}
${(labels || []).map((lb) => `{const m=new THREE.Mesh(new THREE.PlaneGeometry(${lb.w ?? 3.2},${(lb.w ?? 3.2) / 4}),new THREE.MeshBasicMaterial({map:tex.sign(${JSON.stringify(lb.text)},"#f4f2ee","#2b3138"),transparent:true}));m.rotation.x=-Math.PI/2;m.position.set(${lb.x},0.6,${lb.z});s.add(m);}`).join("\n")}
const cam=orthoTop(${center[0]},${center[1]},${half});
finish(r,s,cam);`)
}
