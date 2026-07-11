/*
 * Super Haaland Quest — a Super Mario-style 2D platformer starring
 * Erling Haaland. Built with Phaser 3 Arcade Physics.
 */
(function () {
  'use strict';

  const TILE = 32;
  const WIDTH = 960;
  const HEIGHT = 480;
  const GRAVITY = 900;

  const sfx = () => window.HQ.sfx;

  // ==================================================================
  // BOOT — generate every texture procedurally, then go to the menu.
  // ==================================================================
  class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() {
      window.HQ.generateTextures(this);
      this.scene.start('Menu');
    }
  }

  // ==================================================================
  // MENU
  // ==================================================================
  class MenuScene extends Phaser.Scene {
    constructor() { super('Menu'); }

    create() {
      const g = this.add.graphics();
      g.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x1b4965, 0x1b4965, 1);
      g.fillRect(0, 0, WIDTH, HEIGHT);

      this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'bgfar_1')
        .setOrigin(0).setAlpha(0.35).setTileScale(HEIGHT / 270);

      this.add.text(WIDTH / 2, 92, 'SUPER', {
        fontFamily: 'monospace', fontSize: '34px', color: '#f7d94c',
        stroke: '#000', strokeThickness: 6,
      }).setOrigin(0.5);
      this.add.text(WIDTH / 2, 146, 'HAALAND QUEST', {
        fontFamily: 'monospace', fontSize: '58px', color: '#6cabdd',
        stroke: '#000', strokeThickness: 8, fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(WIDTH / 2, 190, 'A Viking Cyborg Platform Adventure', {
        fontFamily: 'monospace', fontSize: '15px', color: '#ffffff',
      }).setOrigin(0.5);

      const hero = this.add.image(WIDTH / 2, 268, 'e_su_idle').setScale(2.4);
      this.tweens.add({
        targets: hero, y: 258, duration: 700, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const lines = [
        'ARROWS / WASD ... run       UP / SPACE ... Power Leap',
        'SHIFT ... Slide-Tackle Dash     Z ... kick fireball (Beef power)',
        'M ... mute      R ... restart level',
        '',
        'Milk = grow   Hair-tie = invincible   Beef = fireballs   Bag = shield',
      ];
      this.add.text(WIDTH / 2, 360, lines.join('\n'), {
        fontFamily: 'monospace', fontSize: '13px', color: '#cfe8f5',
        align: 'center', lineSpacing: 6,
      }).setOrigin(0.5);

      const prompt = this.add.text(WIDTH / 2, 440, 'PRESS ENTER TO KICK OFF', {
        fontFamily: 'monospace', fontSize: '20px', color: '#f7d94c',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: prompt, alpha: 0.25, duration: 550, yoyo: true, repeat: -1,
      });

      this.input.keyboard.once('keydown-ENTER', () => this.startGame());
      this.input.once('pointerdown', () => this.startGame());
    }

    startGame() {
      sfx().ensure();
      sfx().coin();
      this.registry.set('score', 0);
      this.registry.set('coins', 0);
      this.registry.set('lives', 3);
      this.registry.set('power', { size: 'small', beef: false, shield: false });
      this.scene.start('Level', { level: 0 });
    }
  }

  // ==================================================================
  // LEVEL
  // ==================================================================
  class LevelScene extends Phaser.Scene {
    constructor() { super('Level'); }

    init(data) {
      this.levelIndex = data.level || 0;
      this.def = window.HQ.LEVELS[this.levelIndex];
    }

    create() {
      const def = this.def;
      this.clearing = false;
      this.dying = false;
      this.stunUntil = 0;
      this.invulnUntil = 0;
      this.starUntil = 0;
      this.dashUntil = 0;
      this.dashReadyAt = 0;
      this.timeLeft = def.time;
      this.boss = null;

      this.buildBackdrop();
      this.buildAnims();
      this.buildMap();
      this.createPlayer();
      this.wireCollisions();
      this.createHUD();

      this.cameras.main.setBounds(0, 0, this.mapWidth * TILE, HEIGHT);
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

      this.keys = this.input.keyboard.addKeys(
        'LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE,SHIFT,Z,K,M,R,ENTER');
      this.input.keyboard.on('keydown-M', () => sfx().toggleMute());
      this.input.keyboard.on('keydown-R', () => {
        if (!this.clearing) this.scene.restart({ level: this.levelIndex });
      });

      this.time.addEvent({
        delay: 1000, loop: true, callback: () => {
          if (this.clearing || this.dying) return;
          this.timeLeft--;
          if (this.timeLeft <= 0) this.killPlayer();
        },
      });

      // level intro banner
      const banner = this.add.text(WIDTH / 2, HEIGHT / 2 - 40, def.name, {
        fontFamily: 'monospace', fontSize: '30px', color: '#ffffff',
        stroke: '#000', strokeThickness: 6,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
      this.tweens.add({
        targets: banner, alpha: 0, delay: 1600, duration: 500,
        onComplete: () => banner.destroy(),
      });

      sfx().startMusic(def.world);
      this.events.once('shutdown', () => sfx().stopMusic());
    }

    // ---------------- backdrop ----------------
    buildBackdrop() {
      const t = this.def.theme;
      const g = this.add.graphics().setScrollFactor(0).setDepth(-30);
      g.fillGradientStyle(t.sky, t.sky, t.skyBottom, t.skyBottom, 1);
      g.fillRect(0, 0, WIDTH, HEIGHT);

      const scale = HEIGHT / 270;
      this.bgFar = this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'bgfar_' + this.def.world)
        .setOrigin(0).setScrollFactor(0).setDepth(-20).setTileScale(scale);
      this.bgNear = this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'bgnear_' + this.def.world)
        .setOrigin(0).setScrollFactor(0).setDepth(-10).setTileScale(scale);

      if (t.rain) {
        this.add.particles(0, 0, 'pixel', {
          x: { min: 0, max: WIDTH }, y: -10,
          lifespan: 900, speedY: { min: 420, max: 560 }, speedX: -60,
          scale: { start: 1.4, end: 0.8 }, alpha: 0.4, tint: 0x9fc5e8,
          quantity: 2, frequency: 30,
        }).setScrollFactor(0).setDepth(60);
      }
    }

    // ---------------- animations ----------------
    buildAnims() {
      const mk = (key, frames, rate, repeat) => {
        if (this.anims.exists(key)) return;
        this.anims.create({
          key,
          frames: frames.map(k => ({ key: k })),
          frameRate: rate,
          repeat: repeat === undefined ? -1 : repeat,
        });
      };
      mk('sm_run', ['e_sm_run1', 'e_sm_idle', 'e_sm_run2'], 10);
      mk('su_run', ['e_su_run1', 'e_su_idle', 'e_su_run2'], 10);
      mk('defender_walk', ['defender1', 'defender2'], 5);
      mk('drone_fly', ['drone1', 'drone2'], 10);
    }

    // ---------------- map construction ----------------
    buildMap() {
      const def = this.def;
      const rows = def.rows.slice();
      rows.push(def.ground, def.ground);
      const width = Math.max(...rows.map(r => r.length));
      const grid = rows.map(r => r.padEnd(width, '.'));
      this.grid = grid;
      this.mapWidth = width;
      this.physics.world.setBounds(0, 0, width * TILE, HEIGHT + 200);

      this.solids = this.physics.add.staticGroup();
      this.blocks = this.physics.add.staticGroup();     // bricks + item blocks
      this.platforms = this.physics.add.staticGroup();  // one-way
      this.hazards = this.physics.add.staticGroup();
      this.coins = this.physics.add.staticGroup();
      this.items = this.physics.add.group();
      this.enemies = this.physics.add.group();
      this.cards = this.physics.add.group();       // referee red cards
      this.bossBalls = this.physics.add.group();
      this.fireballs = this.physics.add.group();
      this.drums = this.physics.add.staticGroup();
      this.spawn = { x: 64, y: 64 };

      const w = def.world;
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < width; x++) {
          const ch = grid[y][x];
          const cx = x * TILE + TILE / 2;
          const cy = y * TILE + TILE / 2;
          switch (ch) {
            case 'X': {
              const above = y > 0 ? grid[y - 1][x] : '.';
              const key = (above === 'X') ? 'dirt_' + w : 'ground_' + w;
              this.solids.create(cx, cy, key);
              break;
            }
            case '=':
              this.blocks.create(cx, cy, 'brick')
                .setData({ kind: 'brick' });
              break;
            case '?': case 'M': case 'B': case 'H': case 'G': {
              const content = { '?': 'coin', M: 'milk', B: 'beef', H: 'hairtie', G: 'handbag' }[ch];
              this.blocks.create(cx, cy, 'qblock')
                .setData({ kind: 'qblock', content });
              break;
            }
            case '-': {
              const p = this.platforms.create(cx, cy - 12, 'platform');
              p.body.checkCollision.down = false;
              p.body.checkCollision.left = false;
              p.body.checkCollision.right = false;
              break;
            }
            case 'o':
              this.coins.create(cx, cy, 'coin');
              break;
            case '~': {
              const wtr = this.hazards.create(cx, cy, 'water');
              wtr.setData('lethal', true).setDepth(5);
              break;
            }
            case '^': {
              const key = def.theme.hazard === 'cone' ? 'cone' : 'spikes';
              const hz = this.hazards.create(cx, cy + (key === 'spikes' ? 8 : 4), key);
              hz.body.setSize(24, key === 'spikes' ? 14 : 22);
              break;
            }
            case 'T': {
              const tr = this.solids.create(cx, cy + 4, 'tramp');
              tr.setData('tramp', true);
              tr.body.setSize(28, 22);
              break;
            }
            case 'D':
              this.placeDrum(cx, y * TILE + TILE);
              break;
            case 'S':
              this.spawn = { x: cx, y: cy - 8 };
              break;
            case 'd':
              this.spawnDefender(cx, cy);
              break;
            case 'r':
              this.spawnReferee(cx, cy);
              break;
            case 'p':
              this.spawnDrone(cx, cy);
              break;
            case 'K':
              this.spawnBoss(cx, cy);
              break;
          }
        }
      }
    }

    placeDrum(cx, bottomY) {
      const drum = this.drums.create(cx, bottomY - 27, 'drum');
      drum.body.setSize(72, 50);
      drum.setDepth(6);
    }

    // ---------------- enemies ----------------
    spawnDefender(x, y) {
      const e = this.enemies.create(x, y, 'defender1');
      e.setData('type', 'defender');
      e.play('defender_walk');
      e.body.setSize(22, 22).setOffset(3, 2);
      e.setVelocityX(Phaser.Math.Between(0, 1) ? 55 : -55);
      e.setBounceX(1);
    }

    spawnReferee(x, y) {
      const e = this.enemies.create(x, y, 'referee');
      e.setData('type', 'referee');
      e.body.setSize(20, 22).setOffset(2, 2);
      e.setData('nextThrow', 0);
    }

    spawnDrone(x, y) {
      const e = this.enemies.create(x, y, 'drone1');
      e.setData('type', 'drone');
      e.play('drone_fly');
      e.body.setAllowGravity(false);
      e.body.setSize(24, 14).setOffset(2, 3);
      e.setData('baseY', y);
      e.setData('baseX', x);
      e.setData('nextFlash', this.time.now + Phaser.Math.Between(1500, 3000));
    }

    spawnBoss(x, y) {
      const b = this.enemies.create(x, y - 20, 'goalkeeper');
      b.setData('type', 'boss');
      b.setData('hp', 6);
      b.setData('nextKick', this.time.now + 1500);
      b.body.setSize(50, 58).setOffset(11, 6);
      b.setVelocityX(-60);
      b.setBounceX(1);
      this.boss = b;
    }

    // ---------------- player ----------------
    createPlayer() {
      const power = this.registry.get('power');
      this.player = this.physics.add.sprite(this.spawn.x, this.spawn.y,
        power.size === 'super' ? 'e_su_idle' : 'e_sm_idle');
      this.player.setDepth(10);
      this.applyBodySize();
      this.player.setMaxVelocity(420, 800);
      this.facing = 1;
      if (power.shield) this.addAura();
    }

    applyBodySize() {
      const power = this.registry.get('power');
      if (power.size === 'super') {
        this.player.body.setSize(18, 40).setOffset(5, 3);
      } else {
        this.player.body.setSize(18, 28).setOffset(5, 3);
      }
    }

    addAura() {
      if (this.aura) return;
      this.aura = this.add.image(0, 0, 'handbag').setDepth(9).setAlpha(0.9).setScale(0.7);
    }

    removeAura() {
      if (this.aura) { this.aura.destroy(); this.aura = null; }
    }

    // ---------------- collisions ----------------
    wireCollisions() {
      const P = this.player;
      this.physics.add.collider(P, this.solids, this.onSolid, null, this);
      this.physics.add.collider(P, this.blocks, this.onBlock, null, this);
      this.physics.add.collider(P, this.platforms);
      this.physics.add.collider(this.enemies, this.solids);
      this.physics.add.collider(this.enemies, this.blocks);
      this.physics.add.collider(this.enemies, this.platforms);
      this.physics.add.collider(this.items, this.solids);
      this.physics.add.collider(this.items, this.blocks);
      this.physics.add.collider(this.items, this.platforms);
      this.physics.add.collider(this.fireballs, this.solids);
      this.physics.add.collider(this.fireballs, this.blocks);
      this.physics.add.collider(this.bossBalls, this.solids);

      this.physics.add.overlap(P, this.coins, (_, c) => this.collectCoin(c));
      this.physics.add.overlap(P, this.items, (_, i) => this.collectItem(i));
      this.physics.add.overlap(P, this.enemies, (_, e) => this.touchEnemy(e));
      this.physics.add.overlap(P, this.cards, (_, c) => { c.destroy(); this.damagePlayer(); });
      this.physics.add.overlap(P, this.bossBalls, (_, b) => { b.destroy(); this.damagePlayer(); });
      this.physics.add.overlap(P, this.hazards, (_, h) => {
        if (h.getData('lethal')) this.killPlayer();
        else this.damagePlayer();
      });
      this.physics.add.overlap(P, this.drums, (_, d) => this.hitDrum(d));
      this.physics.add.overlap(this.fireballs, this.enemies,
        (f, e) => this.fireballHits(f, e));
    }

    onSolid(player, tile) {
      if (tile.getData('tramp') && player.body.touching.down) {
        player.setVelocityY(-720);
        sfx().tone(300, 0.25, 'square', 0.06, 900);
        this.tweens.add({ targets: tile, scaleY: 0.7, duration: 80, yoyo: true });
      }
    }

    onBlock(player, block) {
      const dashing = this.time.now < this.dashUntil;
      const kind = block.getData('kind');

      // head bump from below
      if (player.body.touching.up && block.body.touching.down) {
        this.bumpBlock(block, kind);
        return;
      }
      // slide-tackle dash smashes bricks from the side
      if (dashing && kind === 'brick' &&
          (player.body.touching.left || player.body.touching.right)) {
        this.smashBrick(block);
      }
    }

    bumpBlock(block, kind) {
      const power = this.registry.get('power');
      if (kind === 'brick') {
        if (power.size === 'super') this.smashBrick(block);
        else {
          sfx().bump();
          this.nudge(block);
        }
        return;
      }
      if (kind === 'qblock') {
        const content = block.getData('content');
        block.setData('kind', 'used');
        block.setTexture('usedblock');
        this.nudge(block);
        this.spawnContent(content, block.x, block.y - TILE);
      } else {
        sfx().bump();
      }
    }

    nudge(block) {
      this.tweens.add({
        targets: block, y: block.y - 6, duration: 70, yoyo: true,
      });
    }

    smashBrick(block) {
      sfx().brick();
      this.addScore(50);
      this.burst(block.x, block.y, 0xc1683c);
      block.destroy();
    }

    spawnContent(content, x, y) {
      if (content === 'coin') {
        sfx().coin();
        this.addScore(100);
        this.registry.set('coins', this.registry.get('coins') + 1);
        const c = this.add.image(x, y, 'coin');
        this.tweens.add({
          targets: c, y: y - 40, alpha: 0, duration: 400,
          onComplete: () => c.destroy(),
        });
        return;
      }
      sfx().powerup();
      const item = this.items.create(x, y, content);
      item.setData('type', content);
      item.setVelocityY(-160);
      if (content === 'milk') item.setVelocityX(60).setBounceX(1);
      if (content === 'hairtie') item.setVelocity(90, -220).setBounce(1, 0.9);
    }

    burst(x, y, tint) {
      const p = this.add.particles(x, y, 'pixel', {
        speed: { min: 80, max: 220 }, lifespan: 500, quantity: 14,
        scale: { start: 3, end: 0 }, tint, gravityY: 600, emitting: false,
      });
      p.explode();
      this.time.delayedCall(600, () => p.destroy());
    }

    // ---------------- pickups ----------------
    collectCoin(c) {
      c.destroy();
      sfx().coin();
      this.addScore(100);
      this.registry.set('coins', this.registry.get('coins') + 1);
    }

    collectItem(item) {
      const type = item.getData('type');
      item.destroy();
      const power = this.registry.get('power');
      sfx().powerup();
      if (type === 'milk') {
        if (power.size === 'small') {
          power.size = 'super';
          this.registry.set('power', power);
          this.player.y -= 8;
          this.applyBodySize();
          this.floatText(this.player.x, this.player.y - 40, 'RAW MILK!');
        } else this.addScore(500);
      } else if (type === 'beef') {
        power.size = 'super';
        power.beef = true;
        this.registry.set('power', power);
        this.player.y -= 8;
        this.applyBodySize();
        this.floatText(this.player.x, this.player.y - 40, 'BEEF POWER!');
      } else if (type === 'hairtie') {
        this.starUntil = this.time.now + 8000;
        this.floatText(this.player.x, this.player.y - 40, 'KKNEKKI MODE!');
      } else if (type === 'handbag') {
        power.shield = true;
        this.registry.set('power', power);
        this.addAura();
        this.floatText(this.player.x, this.player.y - 40, 'HERMES SHIELD!');
      }
      this.addScore(1000);
    }

    floatText(x, y, msg) {
      const t = this.add.text(x, y, msg, {
        fontFamily: 'monospace', fontSize: '14px', color: '#f7d94c',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(50);
      this.tweens.add({
        targets: t, y: y - 30, alpha: 0, duration: 1100,
        onComplete: () => t.destroy(),
      });
    }

    // ---------------- combat ----------------
    touchEnemy(enemy) {
      if (this.clearing || this.dying || !enemy.active) return;
      const P = this.player;
      const star = this.time.now < this.starUntil;
      const dashing = this.time.now < this.dashUntil;
      const type = enemy.getData('type');
      const stomping = P.body.velocity.y > 100 &&
        P.body.bottom < enemy.body.top + 14;

      if (type === 'boss') {
        if (stomping) {
          P.setVelocityY(-420);
          this.hurtBoss(enemy, 2);
        } else if (star) {
          this.hurtBoss(enemy, 2);
        } else this.damagePlayer();
        return;
      }

      if (star || (dashing && type === 'defender')) {
        this.squashEnemy(enemy);
        return;
      }
      if (stomping) {
        P.setVelocityY(this.jumpHeld() ? -430 : -280);
        this.squashEnemy(enemy);
        if (type === 'referee') sfx().whistle();
        return;
      }
      this.damagePlayer();
    }

    squashEnemy(enemy) {
      sfx().stomp();
      this.addScore(200);
      enemy.disableBody(true, false);
      this.tweens.add({
        targets: enemy, scaleY: 0.3, alpha: 0, y: enemy.y + 8, duration: 300,
        onComplete: () => enemy.destroy(),
      });
    }

    fireballHits(fireball, enemy) {
      if (!enemy.active) return;
      fireball.destroy();
      if (enemy.getData('type') === 'boss') {
        this.hurtBoss(enemy, 1);
      } else {
        this.squashEnemy(enemy);
      }
    }

    hurtBoss(boss, dmg) {
      if (this.time.now < (boss.getData('iframes') || 0)) return;
      boss.setData('iframes', this.time.now + 900);
      const hp = boss.getData('hp') - dmg;
      boss.setData('hp', hp);
      sfx().bossHit();
      this.cameras.main.shake(150, 0.008);
      boss.setTint(0xff6666);
      this.time.delayedCall(250, () => boss.active && boss.clearTint());
      if (hp <= 0) this.defeatBoss(boss);
      else {
        const speed = 60 + (6 - hp) * 25;
        boss.setVelocityX(boss.body.velocity.x < 0 ? -speed : speed);
      }
    }

    defeatBoss(boss) {
      this.addScore(5000);
      sfx().fanfare();
      const x = boss.x, groundY = boss.body.bottom;
      boss.disableBody(true, false);
      this.tweens.add({
        targets: boss, angle: 180, y: boss.y + 120, alpha: 0, duration: 1000,
        onComplete: () => boss.destroy(),
      });
      this.boss = null;
      // the victory drum appears where the keeper fell
      this.time.delayedCall(1100, () => {
        if (this.scene.isActive()) {
          this.placeDrum(x, groundY);
          this.floatText(x, groundY - 90, 'HIT THE DRUM!');
        }
      });
    }

    damagePlayer() {
      if (this.clearing || this.dying) return;
      if (this.time.now < this.starUntil) return;
      if (this.time.now < this.invulnUntil) return;
      const power = this.registry.get('power');
      if (power.shield) {
        power.shield = false;
        this.registry.set('power', power);
        this.removeAura();
        sfx().hurt();
        this.invulnUntil = this.time.now + 1600;
        this.floatText(this.player.x, this.player.y - 40, 'SHIELD SAVED YOU!');
        return;
      }
      if (power.beef) {
        power.beef = false;
        this.registry.set('power', power);
        sfx().hurt();
        this.invulnUntil = this.time.now + 1600;
        return;
      }
      if (power.size === 'super') {
        power.size = 'small';
        this.registry.set('power', power);
        this.applyBodySize();
        sfx().hurt();
        this.cameras.main.shake(150, 0.01);
        this.invulnUntil = this.time.now + 1800;
        return;
      }
      this.killPlayer();
    }

    killPlayer() {
      if (this.dying || this.clearing) return;
      this.dying = true;
      sfx().stopMusic();
      sfx().die();
      const P = this.player;
      P.setTint(0x8899aa);
      P.body.enable = false;
      this.tweens.add({ targets: P, y: P.y - 60, duration: 350, ease: 'Quad.easeOut' });
      this.tweens.add({
        targets: P, y: HEIGHT + 120, delay: 380, duration: 700, ease: 'Quad.easeIn',
      });
      this.time.delayedCall(1400, () => {
        const lives = this.registry.get('lives') - 1;
        this.registry.set('lives', lives);
        this.registry.set('power', { size: 'small', beef: false, shield: false });
        if (lives <= 0) this.scene.start('GameOver');
        else this.scene.restart({ level: this.levelIndex });
      });
    }

    // ---------------- level clear: THE DRUM ----------------
    hitDrum(drum) {
      if (this.clearing || this.dying) return;
      const P = this.player;
      const falling = P.body.velocity.y > 0;
      const above = P.body.bottom < drum.body.top + 20;
      if (!(falling && above)) return;

      this.clearing = true;
      const perfect = P.body.velocity.y > 430;
      sfx().stopMusic();
      sfx().drum();
      this.cameras.main.shake(300, 0.012);
      P.setVelocity(0, 0);
      P.body.setAllowGravity(false);
      P.body.enable = false;
      P.y = drum.body.top - (perfect ? 10 : P.body.height / 2);

      this.enemies.children.iterate(e => { if (e && e.body) e.body.enable = false; });

      if (perfect) {
        P.setTexture('e_zen');
        this.addScore(5000);
        sfx().zen();
        this.floatText(P.x, P.y - 60, 'ZEN MASTER! +5000');
      } else {
        P.setTexture(this.registry.get('power').size === 'super' ? 'e_su_idle' : 'e_sm_idle');
      }

      const timeBonus = Math.max(0, this.timeLeft) * 10;
      this.addScore(timeBonus);
      this.floatText(P.x, P.y - 84, 'TIME BONUS +' + timeBonus);

      this.vikingRow(drum.x);
      this.time.delayedCall(3600, () => this.nextLevel());
    }

    vikingRow(x) {
      // pixel-art fans pop up and do the Viking clap wave
      const baseY = HEIGHT - 20;
      for (let i = 0; i < 14; i++) {
        const fx = x - 220 + i * 34;
        const fan = this.add.image(fx, baseY + 30, 'fan').setDepth(4);
        fan.setTint([0x6cabdd, 0xffffff, 0xf7d94c][i % 3]);
        this.tweens.add({
          targets: fan, y: baseY, duration: 300, delay: i * 60,
          ease: 'Back.easeOut',
        });
        this.tweens.add({
          targets: fan, y: baseY - 14, duration: 260, yoyo: true, repeat: 5,
          delay: 500 + i * 90,
        });
      }
      [0, 1, 2, 3, 4, 5].forEach(i => {
        this.time.delayedCall(500 + i * 540, () => sfx().tone(90, 0.3, 'sine', 0.18, 60));
      });
    }

    nextLevel() {
      if (this.levelIndex + 1 >= window.HQ.LEVELS.length) {
        this.scene.start('Victory');
      } else {
        this.scene.start('Level', { level: this.levelIndex + 1 });
      }
    }

    // ---------------- HUD ----------------
    createHUD() {
      const style = {
        fontFamily: 'monospace', fontSize: '15px', color: '#ffffff',
        stroke: '#000', strokeThickness: 3,
      };
      this.hudScore = this.add.text(14, 10, '', style).setScrollFactor(0).setDepth(100);
      this.hudLives = this.add.text(14, 30, '', style).setScrollFactor(0).setDepth(100);
      this.hudWorld = this.add.text(WIDTH / 2, 10, this.def.name, style)
        .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
      this.hudTime = this.add.text(WIDTH - 14, 10, '', style)
        .setOrigin(1, 0).setScrollFactor(0).setDepth(100);
      this.hudPower = this.add.text(WIDTH - 14, 30, '', style)
        .setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    }

    refreshHUD() {
      const power = this.registry.get('power');
      this.hudScore.setText(
        'SCORE ' + this.registry.get('score') +
        '   BALLS ' + this.registry.get('coins'));
      this.hudLives.setText('LIVES x' + this.registry.get('lives'));
      this.hudTime.setText('TIME ' + Math.max(0, this.timeLeft));
      const tags = [];
      if (power.size === 'super') tags.push('SUPER');
      if (power.beef) tags.push('BEEF');
      if (power.shield) tags.push('BAG');
      if (this.time.now < this.starUntil) tags.push('KKNEKKI!');
      this.hudPower.setText(tags.join(' + '));
      if (this.boss && this.boss.active) {
        this.hudWorld.setText('KEEPER HP: ' + '#'.repeat(Math.max(0, this.boss.getData('hp'))));
      }
    }

    addScore(n) {
      this.registry.set('score', this.registry.get('score') + n);
    }

    // ---------------- per-frame update ----------------
    jumpHeld() {
      const k = this.keys;
      return k.UP.isDown || k.W.isDown || k.SPACE.isDown;
    }

    update(time, delta) {
      if (!this.player) return;
      this.refreshHUD();

      const cam = this.cameras.main;
      this.bgFar.tilePositionX = cam.scrollX * 0.15 / this.bgFar.tileScaleX;
      this.bgNear.tilePositionX = cam.scrollX * 0.4 / this.bgNear.tileScaleX;

      if (this.aura) {
        this.aura.setPosition(this.player.x - this.facing * 16, this.player.y - 6);
      }

      if (this.dying || this.clearing) return;

      const P = this.player;
      if (P.y > HEIGHT + 80) { this.killPlayer(); return; }

      this.handleInput(time, delta);
      this.animatePlayer(time);
      this.updateEnemies(time);
      this.pruneProjectiles();
    }

    handleInput(time) {
      const P = this.player;
      const k = this.keys;
      const stunned = time < this.stunUntil;
      const dashing = time < this.dashUntil;
      const star = time < this.starUntil;
      const slippery = this.def.theme.slippery;

      const accel = slippery ? 700 : 1600;
      const drag = slippery ? 250 : 1500;
      const maxRun = (star ? 300 : 220) * (dashing ? 1.9 : 1);
      P.setMaxVelocity(Math.max(maxRun, 430), 900);
      P.setDragX(dashing ? 0 : drag);

      const left = k.LEFT.isDown || k.A.isDown;
      const right = k.RIGHT.isDown || k.D.isDown;

      if (!stunned && !dashing) {
        if (left) {
          P.setAccelerationX(-accel);
          this.facing = -1;
        } else if (right) {
          P.setAccelerationX(accel);
          this.facing = 1;
        } else {
          P.setAccelerationX(0);
        }
        if (Math.abs(P.body.velocity.x) > maxRun) {
          P.setVelocityX(Math.sign(P.body.velocity.x) * maxRun);
        }
      } else {
        P.setAccelerationX(0);
      }
      P.setFlipX(this.facing < 0);

      // The Power Leap — big, slightly floaty jump
      const onGround = P.body.blocked.down || P.body.touching.down;
      if (!stunned && this.jumpHeld() && onGround && !this.jumpLatch) {
        P.setVelocityY(-470);
        sfx().jump();
        this.jumpLatch = true;
      }
      if (!this.jumpHeld()) this.jumpLatch = false;
      // floaty while rising with the button held
      if (P.body.velocity.y < 0 && this.jumpHeld()) {
        P.body.gravity.y = -GRAVITY * 0.35;
      } else {
        P.body.gravity.y = GRAVITY * 0.15;
      }

      // Slide-Tackle Dash
      if (!stunned && Phaser.Input.Keyboard.JustDown(k.SHIFT) &&
          time > this.dashReadyAt) {
        this.dashUntil = time + 230;
        this.dashReadyAt = time + 900;
        P.setVelocityX(this.facing * 430);
        sfx().dash();
        this.burst(P.x - this.facing * 14, P.y + 10, 0x6cabdd);
      }
      P.setAngle(time < this.dashUntil ? this.facing * 14 : 0);

      // Beef power: kick flaming mini-footballs
      const power = this.registry.get('power');
      if (!stunned && power.beef &&
          (Phaser.Input.Keyboard.JustDown(k.Z) || Phaser.Input.Keyboard.JustDown(k.K))) {
        if (this.fireballs.countActive(true) < 2) {
          sfx().kick();
          const f = this.fireballs.create(P.x + this.facing * 18, P.y, 'fireball');
          f.setVelocity(this.facing * 300, -120);
          f.setBounce(0.95);
          f.setData('bornAt', time);
        }
      }

      // Kknekki star sparkle
      if (star) {
        const c = [0xf7d94c, 0xffffff, 0x6cabdd][Math.floor(time / 90) % 3];
        P.setTint(c);
      } else if (time < this.invulnUntil) {
        P.setAlpha(Math.floor(time / 80) % 2 ? 0.35 : 1);
      } else if (time < this.stunUntil) {
        P.setTint(0xccccff);
      } else {
        P.clearTint();
        P.setAlpha(1);
      }
    }

    animatePlayer(time) {
      const P = this.player;
      if (this.clearing) return;
      const power = this.registry.get('power');
      const pre = power.size === 'super' ? 'su' : 'sm';
      const onGround = P.body.blocked.down || P.body.touching.down;
      if (!onGround) {
        P.anims.stop();
        P.setTexture('e_' + pre + '_jump');
      } else if (Math.abs(P.body.velocity.x) > 25) {
        P.play(pre + '_run', true);
      } else {
        P.anims.stop();
        P.setTexture('e_' + pre + '_idle');
      }
    }

    updateEnemies(time) {
      const P = this.player;
      this.enemies.children.iterate(e => {
        if (!e || !e.active || !e.body) return;
        const type = e.getData('type');

        if (type === 'defender') {
          if (e.body.blocked.left) e.setVelocityX(55);
          else if (e.body.blocked.right) e.setVelocityX(-55);
          else if (Math.abs(e.body.velocity.x) < 10) {
            e.setVelocityX(e.flipX ? 55 : -55);
          }
          e.setFlipX(e.body.velocity.x > 0);

        } else if (type === 'referee') {
          const dist = Math.abs(P.x - e.x);
          e.setFlipX(P.x > e.x);
          if (dist < 450 && time > e.getData('nextThrow')) {
            e.setData('nextThrow', time + 2300);
            sfx().whistle();
            const card = this.cards.create(e.x, e.y - 14, 'redcard');
            const dir = Math.sign(P.x - e.x) || 1;
            card.setVelocity(dir * 150, -280);
            card.setAngularVelocity(dir * 340);
            card.setData('bornAt', time);
          }

        } else if (type === 'drone') {
          const baseY = e.getData('baseY');
          const baseX = e.getData('baseX');
          e.y = baseY + Math.sin(time / 400 + baseX) * 14;
          e.x = baseX + Math.sin(time / 900 + baseX) * 46;
          if (time > e.getData('nextFlash')) {
            e.setData('nextFlash', time + 3200);
            this.droneFlash(e);
          }

        } else if (type === 'boss') {
          // keep the keeper pacing his penalty box
          const minX = 60 * TILE;
          if (e.x < minX && e.body.velocity.x < 0) e.setVelocityX(80);
          if (Math.abs(e.body.velocity.x) < 20) {
            e.setVelocityX((P.x < e.x ? -1 : 1) * (60 + (6 - e.getData('hp')) * 25));
          }
          e.setFlipX(P.x > e.x);
          if (time > e.getData('nextKick') && Math.abs(P.x - e.x) < 620) {
            e.setData('nextKick', time + 1400 + e.getData('hp') * 200);
            sfx().kick();
            const ball = this.bossBalls.create(e.x, e.y - 10, 'bigball');
            const dir = Math.sign(P.x - e.x) || -1;
            ball.setVelocity(dir * 190, -220);
            ball.setBounce(0.85, 0.8);
            ball.setAngularVelocity(dir * 200);
            ball.setData('bornAt', time);
          }
        }
      });
    }

    droneFlash(drone) {
      sfx().flash();
      const ring = this.add.image(drone.x, drone.y, 'pixel')
        .setDepth(40).setTint(0xffffcc).setAlpha(0.8).setScale(6);
      this.tweens.add({
        targets: ring, scale: 70, alpha: 0, duration: 380,
        onComplete: () => ring.destroy(),
      });
      const d = Phaser.Math.Distance.Between(
        drone.x, drone.y, this.player.x, this.player.y);
      if (d < 130 && this.time.now > this.starUntil &&
          this.time.now > this.invulnUntil) {
        this.stunUntil = this.time.now + 900;
        sfx().stun();
        this.player.setVelocityX(0);
        this.cameras.main.flash(180, 255, 255, 220);
      }
    }

    pruneProjectiles() {
      const now = this.time.now;
      const sweep = (group, life) => {
        group.children.iterate(o => {
          if (!o || !o.active) return;
          if (now - (o.getData('bornAt') || now) > life || o.y > HEIGHT + 100) {
            o.destroy();
          }
        });
      };
      sweep(this.cards, 3200);
      sweep(this.bossBalls, 6500);
      sweep(this.fireballs, 4200);
    }
  }

  // ==================================================================
  // GAME OVER
  // ==================================================================
  class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOver'); }
    create() {
      sfx().stopMusic();
      const g = this.add.graphics();
      g.fillGradientStyle(0x1a0505, 0x1a0505, 0x3d0c0c, 0x3d0c0c, 1);
      g.fillRect(0, 0, WIDTH, HEIGHT);
      this.add.text(WIDTH / 2, 160, 'FULL TIME', {
        fontFamily: 'monospace', fontSize: '52px', color: '#e74c3c',
        stroke: '#000', strokeThickness: 8,
      }).setOrigin(0.5);
      this.add.text(WIDTH / 2, 230, 'The referee has blown the final whistle.', {
        fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
      }).setOrigin(0.5);
      this.add.text(WIDTH / 2, 290,
        'FINAL SCORE: ' + this.registry.get('score'), {
          fontFamily: 'monospace', fontSize: '24px', color: '#f7d94c',
          stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5);
      const prompt = this.add.text(WIDTH / 2, 380, 'PRESS ENTER FOR A REMATCH', {
        fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5);
      this.tweens.add({ targets: prompt, alpha: 0.3, duration: 550, yoyo: true, repeat: -1 });
      this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Menu'));
      this.input.once('pointerdown', () => this.scene.start('Menu'));
    }
  }

  // ==================================================================
  // VICTORY
  // ==================================================================
  class VictoryScene extends Phaser.Scene {
    constructor() { super('Victory'); }
    create() {
      sfx().stopMusic();
      sfx().fanfare();
      const g = this.add.graphics();
      g.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x1b4965, 0x1b4965, 1);
      g.fillRect(0, 0, WIDTH, HEIGHT);
      this.add.tileSprite(0, 0, WIDTH, HEIGHT, 'bgfar_4')
        .setOrigin(0).setAlpha(0.5).setTileScale(HEIGHT / 270);

      this.add.text(WIDTH / 2, 110, 'CHAMPION!', {
        fontFamily: 'monospace', fontSize: '54px', color: '#f7d94c',
        stroke: '#000', strokeThickness: 8,
      }).setOrigin(0.5);
      this.add.text(WIDTH / 2, 170,
        'Erling conquered the Final Stadium.\nThe Viking Row echoes through the night.', {
          fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
          align: 'center',
        }).setOrigin(0.5);

      this.add.image(WIDTH / 2, 280, 'e_zen').setScale(3);
      this.add.text(WIDTH / 2, 350,
        'FINAL SCORE: ' + this.registry.get('score') +
        '    BALLS COLLECTED: ' + this.registry.get('coins'), {
          fontFamily: 'monospace', fontSize: '20px', color: '#6cabdd',
          stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5);

      // fans doing the wave
      for (let i = 0; i < 20; i++) {
        const fan = this.add.image(50 + i * 46, HEIGHT - 26, 'fan')
          .setTint([0x6cabdd, 0xffffff, 0xf7d94c][i % 3]);
        this.tweens.add({
          targets: fan, y: HEIGHT - 44, duration: 300, yoyo: true,
          repeat: -1, delay: i * 90, repeatDelay: 900,
        });
      }

      const prompt = this.add.text(WIDTH / 2, 420, 'PRESS ENTER TO PLAY AGAIN', {
        fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5);
      this.tweens.add({ targets: prompt, alpha: 0.3, duration: 550, yoyo: true, repeat: -1 });
      this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Menu'));
      this.input.once('pointerdown', () => this.scene.start('Menu'));
    }
  }

  // ==================================================================
  // Game bootstrap
  // ==================================================================
  window.HQ.game = new Phaser.Game({
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent: 'game-container',
    backgroundColor: '#0b1020',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: GRAVITY },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MenuScene, LevelScene, GameOverScene, VictoryScene],
  });
})();
