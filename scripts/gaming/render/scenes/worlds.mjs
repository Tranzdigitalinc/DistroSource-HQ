/**
 * Minecraft world builds, one per map product, as browser-side build code
 * run against the voxel API in three.mjs (V.terrain / fill / walls / house /
 * tower / tree, and torch). Each is a real build of the product it stands
 * for — the survival hub has its shop row and warp board, the prison has its
 * numbered blocks and tiered mines — so screenshots match the listing.
 *
 * These are plain strings spliced into a template literal: no backticks and
 * no dollar-brace sequences anywhere in them.
 */

export const WORLDS = {
  /* Premium Survival Spawn: compact hub, shop row, warp board, marked
     protection boundary, spawn platform facing the exit, fully lit. */
  survivalHub: `
    V.terrain(96,{base:6,amp:2,water:5,seed:9});
    V.flatten(-14,-14,14,14,7,"grass");
    V.fill(-5,7,-5,5,7,5,"stone");V.fill(-3,7,-3,3,7,3,"stonebrick");V.fill(-1,8,-1,1,8,1,"glowstone");
    // shop row along the west side
    for(let i=0;i<4;i++){const z=-9+i*5;V.house(-13,z,4,4,3,{wall:"planks",roof:"cobble",door:"s"});V.set(-9,9,z+2,"wool_red");}
    // warp board: a signed wall on the north side
    V.fill(-6,8,-13,6,10,-13,"planks");for(let x=-5;x<=5;x+=2){V.set(x,9,-12,"wool_white");}V.fill(-6,11,-13,6,11,-13,"glowstone");
    // exit path east, out through the boundary
    V.fill(3,7,-1,30,7,1,"cobble");
    // protection boundary marked with a fence ring
    for(let i=-14;i<=14;i++){V.set(i,8,-14,"fence");V.set(i,8,14,"fence");V.set(-14,8,i,"fence");if(i<-1||i>1)V.set(14,8,i,"fence");}
    for(const [x,z] of [[-22,-20],[20,-24],[-26,18],[24,22],[-4,30],[8,-32],[-32,-2]])V.tree(x,z,5+(Math.abs(x+z)%3));
    for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5],[-13,-13],[13,-13],[-13,13],[13,13]])torch(s,x,9,z,V);
  `,

  /* Modern Lobby Map: circular walkway with eight portal pads, leaderboard
     walls, a separate cosmetics area, neutral palette, barrier edges. */
  lobby: `
    // floating platform, no terrain
    V.fill(-22,4,-22,22,4,22,"stone");V.fill(-20,5,-20,20,5,20,"snow");
    // central hub and circular walkway
    V.fill(-4,6,-4,4,6,4,"stonebrick");V.set(0,7,0,"glowstone");
    for(let a=0;a<360;a+=4){const r=13,x=Math.round(Math.cos(a*Math.PI/180)*r),z=Math.round(Math.sin(a*Math.PI/180)*r);V.set(x,6,z,"stonebrick");V.set(Math.round(Math.cos(a*Math.PI/180)*(r-1)),6,Math.round(Math.sin(a*Math.PI/180)*(r-1)),"stonebrick");}
    // eight portal pads on the walkway
    for(let k=0;k<8;k++){const a=k*45*Math.PI/180,x=Math.round(Math.cos(a)*13),z=Math.round(Math.sin(a)*13);V.fill(x-1,7,z-1,x+1,10,z+1,"obsidian");V.clear(x,7,z,x,9,z);V.fill(x,7,z,x,9,z,"portal");V.set(x,11,z,"glowstone");}
    // leaderboard walls on the south edge
    V.fill(-12,6,18,-2,11,18,"darkstone");V.fill(2,6,18,12,11,18,"darkstone");for(let x=-11;x<=-3;x++)V.set(x,8,17,"wool_white");for(let x=3;x<=11;x++)V.set(x,8,17,"wool_white");V.fill(-12,12,18,12,12,18,"glowstone");
    // cosmetics area, a small enclosed zone in the north-east
    V.walls(12,6,-20,20,8,-12,"glass");V.fill(13,5,-19,19,5,-13,"wool_blue");V.set(16,6,-16,"glowstone");
    // barrier edge
    for(let i=-20;i<=20;i++){V.set(i,6,-20,"glass");V.set(i,6,20,"glass");V.set(-20,6,i,"glass");V.set(20,6,i,"glass");}
    for(const [x,z] of [[-4,-4],[4,-4],[-4,4],[4,4]])torch(s,x,7,z,V);
  `,

  /* Adventure Map 01, Highlands: an objective path with checkpoints that
     climbs to a boss arena. */
  adventureHighlands: `
    V.terrain(110,{base:6,amp:6,seed:21});
    // winding cobble path from the start to the arena
    const path=[[-40,30],[-30,22],[-22,14],[-12,10],[-2,4],[8,-4],[16,-12],[22,-22]];
    for(let i=0;i<path.length-1;i++){const [x1,z1]=path[i],[x2,z2]=path[i+1];const n=Math.max(Math.abs(x2-x1),Math.abs(z2-z1));for(let k=0;k<=n;k++){const x=Math.round(x1+(x2-x1)*k/n),z=Math.round(z1+(z2-z1)*k/n);const h=V.height(x,z);V.fill(x-1,h,z-1,x+1,h,z+1,"cobble");for(let y=h+1;y<h+6;y++)V.clear(x-1,y,z-1,x+1,y,z+1);}}
    // start platform
    {const h=V.height(-40,30);V.fill(-43,h,27,-37,h,33,"stonebrick");V.set(-40,h+1,30,"glowstone");}
    // three checkpoint pillars
    for(const [x,z] of [[-22,14],[-2,4],[16,-12]]){const h=V.height(x,z);V.fill(x,h+1,z,x,h+4,z,"stonebrick");V.set(x,h+5,z,"glowstone");V.fill(x-1,h,z-1,x+1,h,z+1,"stonebrick");}
    // boss arena on the far hill: a ring with a lava core
    {const cx=22,cz=-22,h=V.height(cx,cz)+1;V.flatten(cx-9,cz-9,cx+9,cz+9,h-1,"stone");for(let a=0;a<360;a+=3){const x=cx+Math.round(Math.cos(a*Math.PI/180)*8),z=cz+Math.round(Math.sin(a*Math.PI/180)*8);V.fill(x,h,z,x,h+2,z,"darkstone");}V.fill(cx-2,h-1,cz-2,cx+2,h-1,cz+2,"lava");for(const [dx,dz] of [[-8,-8],[8,-8],[-8,8],[8,8]])V.fill(cx+dx,h,cz+dz,cx+dx,h+5,cz+dz,"stonebrick");for(const [dx,dz] of [[-8,-8],[8,-8],[-8,8],[8,8]])V.set(cx+dx,h+6,cz+dz,"glowstone");}
    for(const [x,z] of [[-30,-20],[-14,-26],[-36,8],[30,10],[36,-4],[-8,-38],[10,30],[28,28]])V.tree(x,z,6);
  `,

  /* Adventure Map 03, Cavern: an enclosed descent with lava pools and a vault. */
  adventureCavern: `
    V.terrain(80,{base:12,amp:1,seed:33});
    // hollow out the cavern under the surface
    V.clear(-30,3,-30,30,11,30);V.fill(-30,2,-30,30,2,30,"darkstone");
    // stalactites and pillars
    for(const [x,z,h] of [[-18,-12,6],[12,-20,5],[20,14,7],[-10,18,5],[0,0,4],[-24,8,6],[24,-4,5]]){V.fill(x,3,z,x,2+h,z,"stone");V.fill(x,12-h,z,x,11,z,"stone");}
    // lava pools
    V.fill(-22,2,-24,-14,2,-18,"lava");V.fill(14,2,6,22,2,12,"lava");V.fill(-6,2,20,2,2,26,"lava");
    // descent ramp from the surface
    for(let i=0;i<9;i++){V.clear(-30+i*2,3+i,-2,-29+i*2,12,2);V.fill(-30+i*2,2+i,-2,-29+i*2,2+i,2,"cobble");}
    // vault: obsidian box with a glowstone core
    V.fill(8,3,-12,16,7,-4,"obsidian");V.clear(9,3,-11,15,6,-5);V.set(12,4,-8,"glowstone");V.clear(12,3,-4,12,4,-4);
    // checkpoint
    V.fill(-6,3,-6,-4,3,-4,"stonebrick");V.set(-5,4,-5,"glowstone");
    for(const [x,z] of [[-20,-6],[6,-16],[18,0],[-4,12],[10,18],[-26,-2]])torch(s,x,3,z,V);
  `,

  /* Skyblock starter island: a small floating dirt-and-grass island with a
     tree, a sand spit and a stone outcrop, and a nether companion nearby. */
  skyblockStarter: `
    V.fill(-4,5,-4,4,8,4,"dirt");V.fill(-4,9,-4,4,9,4,"grass");V.fill(-3,4,-3,3,4,3,"dirt");V.fill(-2,3,-2,2,3,2,"stone");V.fill(-1,2,-1,1,2,1,"stone");
    V.height=(x,z)=>9;
    V.tree(2,-2,5);V.set(-3,10,3,"planks");V.set(-2,10,3,"planks");
    // sand spit
    V.fill(6,7,-2,10,8,2,"sand");V.fill(7,6,-1,9,6,1,"sand");
    // stone outcrop with a bit of ore
    V.fill(-10,4,6,-6,8,10,"stone");V.set(-8,8,8,"darkstone");V.set(-9,6,7,"darkstone");V.set(-7,7,9,"gravel");
    // nether companion island, further off and lower
    V.fill(14,-2,-16,22,2,-8,"darkstone");V.fill(16,3,-14,20,3,-10,"lava");V.fill(18,3,-12,18,7,-12,"obsidian");V.fill(15,4,-15,15,4,-15,"glowstone");
  `,

  /* Skyblock advanced island: a grown island with a house, farm and bridge. */
  skyblockAdvanced: `
    V.fill(-12,3,-10,12,8,10,"dirt");V.fill(-12,9,-10,12,9,10,"grass");V.fill(-10,2,-8,10,2,8,"stone");V.fill(-7,1,-5,7,1,5,"stone");
    V.height=(x,z)=>9;
    V.house(-8,-6,6,5,3,{wall:"planks",roof:"cobble"});
    // farm plots
    for(let x=2;x<=10;x+=2)for(let z=-8;z<=-2;z+=2){V.set(x,9,z,"dirt");V.set(x,10,z,"leaves");}V.fill(1,9,-9,11,9,-9,"water");
    V.tree(-6,6,6);V.tree(8,6,5);
    // bridge to a second island
    V.fill(12,9,0,24,9,0,"planks");V.fill(25,4,-6,33,8,6,"dirt");V.fill(25,9,-6,33,9,6,"grass");V.tree(29,0,5);
    for(const [x,z] of [[-9,-8],[-2,-2],[10,8],[-10,8]])torch(s,x,10,z,V);
  `,

  /* Prison Server Map: walled compound, numbered cell blocks, separate shop
     and PvP yards, a guard tower, and mine tiers that get visibly larger. */
  prison: `
    V.terrain(120,{base:6,amp:1,seed:5});
    V.flatten(-40,-40,40,40,7,"gravel");
    // perimeter wall with a guard tower
    V.walls(-38,8,-38,38,13,38,"stonebrick");for(let i=-38;i<=38;i+=2){V.set(i,14,-38,"darkstone");V.set(i,14,38,"darkstone");V.set(-38,14,i,"darkstone");V.set(38,14,i,"darkstone");}
    V.tower(0,-38,3,12,"darkstone");V.set(0,21,-38,"glowstone");
    // eight cell blocks, two rows of four, with barred fronts
    for(let r=0;r<2;r++)for(let c=0;c<4;c++){const x=-30+c*12,z=-28+r*12;V.fill(x,8,z,x+9,11,z+7,"stone");V.clear(x+1,8,z+1,x+8,10,z+6);for(let k=0;k<4;k++){V.set(x+1+k*2,8,z,"fence");V.set(x+1+k*2,9,z,"fence");V.set(x+1+k*2,10,z,"fence");}V.set(x+4,12,z+3,"wool_white");}
    // yard, shop and pvp areas separated by walls
    V.fill(-30,7,2,10,7,24,"cobble");
    V.walls(14,8,2,36,11,14,"stonebrick");V.fill(15,7,3,35,7,13,"planks");V.set(25,12,8,"wool_yellow");
    V.walls(14,8,18,36,11,34,"darkstone");V.fill(15,7,19,35,7,33,"sand");V.set(25,12,26,"wool_red");
    // mine tiers outside the yard, each larger and deeper than the last
    for(let t=0;t<4;t++){const size=3+t*2,x=-34+t*9,z=28;V.clear(x,4+2-t,z,x+size,7,z+size);V.fill(x,3,z,x+size,3,z+size,"darkstone");V.walls(x-1,4,z-1,x+size+1,7,z+size+1,"stone");V.set(x+Math.floor(size/2),8,z-1,"glowstone");}
    for(const [x,z] of [[-30,-16],[-6,-16],[18,-16],[-30,8],[-6,8],[18,8],[25,20]])torch(s,x,8,z,V);
  `,
}
