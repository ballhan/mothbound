import {test} from 'node:test';
import assert from 'node:assert/strict';
import {game} from './harness.js';
test('world renders and player lands on starting ground',()=>{const run=game();run("mode='play'; for(let i=0;i<120;i++)update(1/60);draw()");assert.equal(run('player.y+player.h'),610);assert.equal(run('player.hp'),6)});
test('double jump and dash grant movement without a third jump',()=>{const run=game();run("mode='play';player.jumps=0;pressed.add('Space');update(.016);pressed.clear()");assert.equal(run('player.jumps'),1);run("pressed.add('Space');update(.016);pressed.clear()");assert.equal(run('player.jumps'),2);run("pressed.add('Space');update(.016);pressed.clear()");assert.equal(run('player.jumps'),2);run("pressed.add('KeyK');update(.016)");assert.ok(run('player.dash>0 && player.inv>0 && player.vx>800'))});
test('sword kills nearby enemy and restores soul',()=>{const run=game();run("mode='play';player.x=685;player.y=562;player.soul=20;enemies[0].hp=1;pressed.add('KeyJ');update(.016)");assert.equal(run('enemies[0].hp'),0);assert.equal(run('player.embers'),12);assert.equal(run('player.soul'),29)});
test('boss activates, attacks, and victory removes arena hazards',()=>{const run=game();run("mode='play';player.x=3800;player.y=562;update(.016)");assert.ok(run('boss.active'));run("boss.timer=0;update(.016)");assert.equal(run('boss.state'),'wind');run("boss.timer=0;update(.016)");assert.equal(run('boss.state'),'charge');run("boss.x=4300;boss.y=610;boss.hp=1;player.x=4240;player.y=540;player.face=1;pressed.add('KeyJ');update(.016)");assert.ok(run('won'));assert.equal(run('boss.active'),false);assert.equal(run('waves.length'),0)});
test('lantern heals and establishes respawn checkpoint',()=>{const run=game();run("mode='play';player.x=3260;player.y=562;player.hp=2;pressed.add('KeyE');update(.016)");assert.equal(run('checkpoint'),3260);assert.equal(run('player.hp'),6);run('player.x=4000;respawn()');assert.equal(run('player.x'),3260)});

test('downward strike bounces the player and refreshes dash',()=>{
  const run=game();run("mode='play';player.x=730;player.y=490;player.ground=false;player.dashCD=.5;keys.add('ArrowDown');pressed.add('KeyJ');update(.016)");
  assert.equal(run('enemies[0].hp'),2);assert.ok(run('player.vy<0'));assert.equal(run('player.dashCD'),0);assert.equal(run('player.attackDir'),'down');
});
test('upward strike reaches a flying enemy',()=>{
  const run=game();run("mode='play';player.x=1690;player.y=375;keys.add('ArrowUp');pressed.add('KeyJ');update(.016)");
  assert.equal(run('enemies[2].hp'),1);assert.equal(run('player.attackDir'),'up');
});
test('soul projectile costs energy and damages at range',()=>{
  const run=game();run("mode='play';player.x=530;player.y=562;player.soul=100;pressed.add('KeyF');update(.016);pressed.clear()");
  assert.equal(run('player.soul'),75);assert.equal(run('bolts.length'),1);run.tick(35);assert.equal(run('enemies[0].hp'),0);assert.equal(run('player.embers'),12);
});
test('casting with insufficient soul is blocked',()=>{
  const run=game();run("mode='play';player.soul=24;pressed.add('KeyF');update(.016)");assert.equal(run('bolts.length'),0);assert.equal(run('player.soul'),24);
});
test('map and shop freeze the world and Escape resumes',()=>{
  const run=game();run("mode='play';showMap()");const x=run('enemies[0].x');run.tick(60);assert.equal(run('enemies[0].x'),x);assert.equal(run('mode'),'map');
  run.event('keydown','Escape');assert.equal(run('mode'),'play');run('showShop()');run.tick(20);assert.equal(run('enemies[0].x'),x);
});
test('shop enforces prices, prevents duplicate purchases and persists upgrades',()=>{
  const run=game();run("mode='play';player.embers=59;showShop();buy('blade')");assert.equal(run('player.damage'),1);
  run("player.embers=105;buy('blade');buy('blade');buy('heart')");assert.equal(run('player.embers'),0);assert.equal(run('player.damage'),2);assert.equal(run('player.maxHp'),7);
  const reload=game(run.saved());reload('start(true)');assert.equal(reload('player.damage'),2);assert.equal(reload('player.hp'),7);
});
test('defeated boss and gathered motes remain completed after reload',()=>{
  const run=game();run("mode='play';boss.active=true;boss.hp=1;motes[0].taken=true;hitBoss()");const reload=game(run.saved());reload('start(true)');
  assert.equal(reload('won'),true);assert.equal(reload('boss.hp'),0);assert.equal(reload('motes[0].taken'),true);reload('player.x=3900');reload.tick(10);assert.equal(reload('boss.active'),false);
});
test('death drops embers, respawn restores health, recovery restores currency once',()=>{
  const run=game();run("mode='play';player.hp=1;player.inv=0;player.x=700;player.y=562;player.embers=45;hurt(1,710)");
  assert.equal(run('mode'),'dead');assert.equal(run('player.embers'),0);assert.equal(run('deathCache.embers'),45);run.timers();assert.equal(run('player.hp'),6);
  run('player.x=700;player.y=550');run.tick();assert.equal(run('player.embers'),45);assert.equal(run('deathCache'),null);run.tick();assert.equal(run('player.embers'),45);
});
test('phase two adds the bell projectile attack',()=>{
  const run=game();run("mode='play';player.x=3800;player.y=562;boss.active=true;boss.hp=20;boss.state='idle';boss.cycle=3;boss.timer=0;update(.016)");
  assert.equal(run('boss.phase'),2);assert.equal(run('boss.state'),'chime');run('boss.timer=0;update(.016)');assert.equal(run('bolts.filter(b=>!b.friendly).length'),7);
});
test('healing costs soul and cannot exceed the upgraded health cap',()=>{
  const run=game();run("mode='play';player.x=160;player.y=562;player.ground=true;player.hp=5;keys.add('KeyL')");run.tick(70);
  assert.equal(run('player.hp'),6);assert.equal(run('player.soul'),65);run.tick(70);assert.equal(run('player.soul'),65);
});
