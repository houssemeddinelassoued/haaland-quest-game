/*
 * Super Haaland Quest — procedural pixel-art textures.
 * Every sprite in the game is generated at boot from ASCII pixel grids,
 * so the game ships with zero image assets.
 */
(function () {
  'use strict';

  const PX = 2; // one ascii cell -> 2x2 canvas pixels; 16-cell tile -> 32px

  /** Draw an ascii grid into a new canvas texture. '.' = transparent. */
  function tex(scene, key, rows, palette, px) {
    px = px || PX;
    const w = rows[0].length * px;
    const h = rows.length * px;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        const c = palette[rows[y][x]];
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x * px, y * px, px, px);
      }
    }
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
  }

  // ------------------------------------------------------------------
  // Erling Haaland — Viking cyborg with the golden ponytail.
  // ------------------------------------------------------------------
  const EP = {
    G: '#f7d94c', // golden hair
    g: '#c9a227', // hair shadow
    S: '#f0c8a0', // skin
    E: '#1b2a41', // eyes
    B: '#6cabdd', // City sky-blue kit
    b: '#4a8dbf', // kit shading
    K: '#ffffff', // kit trim
    W: '#ffffff', // shorts
    C: '#6cabdd', // socks
    D: '#20242c', // boots
    R: '#e8452c', // accent
  };

  const SMALL_IDLE = [
    '....GGGGG.....',
    '...GGGGGGG....',
    '...GSSSSSg.g..',
    '...GSESSES.g..',
    '...GSSSSSS.g..',
    '....SSSSS..g..',
    '..BBBBBBBBB...',
    '.BBKBBBBBKBB..',
    '.BbBBBBBBBbB..',
    '.BBBBBBBBBBB..',
    '..WWWWWWWWW...',
    '...WW...WW....',
    '...CC...CC....',
    '...CC...CC....',
    '...DD...DD....',
    '..DDD...DDD...',
  ];
  const SMALL_RUN1 = SMALL_IDLE.slice(0, 11).concat([
    '..WW.....WW...',
    '..CC.....CC...',
    '..CC.....CC...',
    '.DD.......DD..',
    'DDD.......DDD.',
  ]);
  const SMALL_RUN2 = SMALL_IDLE.slice(0, 11).concat([
    '....WW.WW.....',
    '....CC.CC.....',
    '....CCCCC.....',
    '....DD.DD.....',
    '...DDD.DDD....',
  ]);
  const SMALL_JUMP = [
    '....GGGGG.....',
    '...GGGGGGG..g.',
    '...GSSSSSg.g..',
    '...GSESSES.g..',
    '...GSSSSSSg...',
    '....SSSSS.....',
    '.BBBBBBBBBBB..',
    'BBBKBBBBBKBBB.',
    '.BbBBBBBBBbB..',
    '.BBBBBBBBBBB..',
    '..WWWWWWWWW...',
    '..WW.....WW...',
    '..CCC...CCC...',
    '...DD...DD....',
    '..DDD...DDD...',
    '..............',
  ];

  function superFrames(legs) {
    return [
      '....GGGGG.....',
      '...GGGGGGG....',
      '...GSSSSSg.g..',
      '...GSESSES.g..',
      '...GSSSSSS.g..',
      '...GSSSSSg.g..',
      '....SSSSS..g..',
      '..BBBBBBBBB.g.',
      '.BBKBBBBBKBB..',
      '.BbBB999BBbB..',
      '.BbBBBBBBBbB..',
      '.BBBBBBBBBBB..',
      '.SBBBBBBBBBS..',
      '.S.BBBBBBB.S..',
      '..WWWWWWWWW...',
      '..WWWWWWWWW...',
    ].concat(legs);
  }
  const SUPER_LEGS_IDLE = [
    '...WW...WW....',
    '...CC...CC....',
    '...CC...CC....',
    '...CC...CC....',
    '...DD...DD....',
    '..DDD...DDD...',
  ];
  const SUPER_LEGS_RUN1 = [
    '..WW.....WW...',
    '..CC.....CC...',
    '..CC.....CC...',
    '.CC.......CC..',
    '.DD.......DD..',
    'DDD.......DDD.',
  ];
  const SUPER_LEGS_RUN2 = [
    '....WW.WW.....',
    '....CC.CC.....',
    '....CC.CC.....',
    '....CCCCC.....',
    '....DD.DD.....',
    '...DDD.DDD....',
  ];
  const SUPER_LEGS_JUMP = [
    '..WW.....WW...',
    '..CCC...CCC...',
    '...CC...CC....',
    '...DD...DD....',
    '..DDD...DDD...',
    '..............',
  ];

  const ZEN = [
    '......GGGGG.....',
    '.....GGGGGGG....',
    '.....GSSSSSg....',
    '.....GSESSES....',
    '.....GSSSSSS....',
    '......SSSSS.....',
    '....BBBBBBBBB...',
    '...BBKBBBBBKBB..',
    '..SBBbBBBBBbBBS.',
    '..S.BBBBBBBBB.S.',
    '..WWWWWWWWWWWW..',
    '.CCDDDWWWWDDDCC.',
  ];

  // ------------------------------------------------------------------
  // Enemies
  // ------------------------------------------------------------------
  const DEFENDER_P = {
    R: '#c0392b', r: '#8e2418', S: '#e5b887', E: '#222222',
    W: '#ffffff', D: '#1a1a1a', H: '#3d2817',
  };
  const DEFENDER1 = [
    '....HHHH......',
    '...HSSSSH.....',
    '...HSESES.....',
    '....SSSS......',
    '..RRRRRRRR....',
    '.RRWRRRRWRR...',
    '.RrRRRRRRrR...',
    '..RRRRRRRR....',
    '..WWWWWWWW....',
    '..WW....WW....',
    '.DD......DD...',
    'DDD......DDD..',
  ];
  const DEFENDER2 = [
    '..............',
    '....HHHH......',
    '...HSSSSH.....',
    '...HSESES.....',
    '....SSSS......',
    '..RRRRRRRRRR..',
    '.RRWRRRRWRRRR.',
    '..RRRRRRRRRR..',
    '..WWWWWWWWWWW.',
    'DDWW......WWDD',
    'DD..........DD',
    '..............',
  ];

  const REF_P = {
    K: '#111111', k: '#333333', S: '#e5b887', E: '#ffffff',
    Y: '#f4d03f', W: '#ffffff', R: '#e74c3c',
  };
  const REFEREE = [
    '....KKKK....',
    '...KSSSSK...',
    '...KSESES...',
    '....SSSS....',
    '..KKKKKKKK..',
    '.KKWKKKKWKK.',
    '.KkKKYYKKkK.',
    '.KKKKKKKKKK.',
    '..KKKKKKKK..',
    '..KK....KK..',
    '..KK....KK..',
    '.KKK....KKK.',
  ];
  const REDCARD = [
    'RRRRRR',
    'RRRRRR',
    'RRrRRR',
    'RRRRRR',
    'RRRRRR',
    'RRRRRR',
    'RRRRRR',
    'RRRRRR',
  ];

  const DRONE_P = {
    M: '#95a5a6', m: '#5d6d7e', L: '#f9e79f', E: '#e74c3c',
    D: '#2c3e50', C: '#aed6f1',
  };
  const DRONE1 = [
    'mm..........mm',
    '.MMMM....MMMM.',
    '...DDDDDDDD...',
    '..DDMMMMMMDD..',
    '..DMCCCCCCMD..',
    '..DMCLLLLCMD..',
    '..DDMMMMMMDD..',
    '...DDDDDDDD...',
    '.....E..E.....',
    '..............',
  ];
  const DRONE2 = [
    '..MMMM....MMMM',
    'mm...........m',
    '...DDDDDDDD...',
    '..DDMMMMMMDD..',
    '..DMCCCCCCMD..',
    '..DMCLLLLCMD..',
    '..DDMMMMMMDD..',
    '...DDDDDDDD...',
    '.....E..E.....',
    '..............',
  ];

  const GK_P = {
    G: '#27ae60', g: '#1d8348', S: '#e5b887', E: '#111111',
    Y: '#f4d03f', W: '#ffffff', D: '#1a1a1a', O: '#e67e22',
    A: '#7f8c8d', 1: '#ffffff',
  };
  const GOALKEEPER = [
    '........DDDDDD..........',
    '.......DSSSSSSD.........',
    '.......DSESSSED.........',
    '.......DSSSSSSD.........',
    '........SSSSSS..........',
    '....AAGGGGGGGGGGAA......',
    '...AAGGWGGGGGGWGGAA.....',
    '..OOGGGGGGGGGGGGGGOO....',
    '..OOGGGgG11GgGGGGGOO....',
    '..OOGGGGGGGGGGGGGGOO....',
    '..OOGGGGGGGGGGGGGGOO....',
    '..OO.GGGGGGGGGGGG.OO....',
    '.....GGGGGGGGGGGG.......',
    '.....WWWWWWWWWWWW.......',
    '.....WWWWWWWWWWWW.......',
    '.....WWW......WWW.......',
    '.....YYY......YYY.......',
    '.....YYY......YYY.......',
    '.....YYY......YYY.......',
    '.....DDD......DDD.......',
    '....DDDD......DDDD......',
    '........................',
  ];

  // ------------------------------------------------------------------
  // Items & projectiles
  // ------------------------------------------------------------------
  const BALL = [
    '..WWWW..',
    '.WWKKWW.',
    'WWKWWKWW',
    'WKWWWWKW',
    'WKWWWWKW',
    'WWKWWKWW',
    '.WWKKWW.',
    '..WWWW..',
  ];
  const BALL_P = { W: '#f5f5f5', K: '#222222' };
  const FIREBALL_P = { W: '#ffd166', K: '#e8452c' };

  const MILK = [
    '.WWWWWW.',
    '.W....W.',
    '.WMMMMW.',
    '.WMMMMW.',
    '.WMMMMW.',
    '.WMMMMW.',
    '.WMMMMW.',
    '..WWWW..',
  ];
  const MILK_P = { W: '#d6eaf8', M: '#fdfefe' };

  const HAIRTIE = [
    '..GGGG..',
    '.GG..GG.',
    'GG....GG',
    'GG....GG',
    'GG....GG',
    'GG....GG',
    '.GG..GG.',
    '..GGGG..',
  ];
  const HAIRTIE_P = { G: '#f7d94c' };

  const BEEF = [
    '..RRRR..',
    '.RRRRRR.',
    'RRrRRRRR',
    'RRRRRrRR',
    'RRRRRRRR',
    '.RRrRRR.',
    '..RRRR..',
    '...RR...',
  ];
  const BEEF_P = { R: '#c0392b', r: '#7b241c' };

  const HANDBAG = [
    '..OYYO..',
    '.O....O.',
    'OOOOOOOO',
    'OOOOOOOO',
    'OOYOOYOO',
    'OOOOOOOO',
    'OOOOOOOO',
    '.OOOOOO.',
  ];
  const HANDBAG_P = { O: '#e67e22', Y: '#f4d03f' };

  // ------------------------------------------------------------------
  // Tiles
  // ------------------------------------------------------------------
  function makeTiles(scene, world) {
    const themes = {
      1: { top: '#58b368', soil: '#7a5230', soil2: '#5d3f24' },   // fjords
      2: { top: '#9ccc65', soil: '#8d6e63', soil2: '#6d4c41' },   // training
      3: { top: '#78909c', soil: '#455a64', soil2: '#37474f' },   // city rooftops
      4: { top: '#66bb6a', soil: '#616161', soil2: '#424242' },   // stadium
    };
    const t = themes[world] || themes[1];
    const P = { T: t.top, t: shade(t.top, -25), S: t.soil, s: t.soil2 };

    tex(scene, 'ground_' + world, [
      'TTTTTTTTTTTTTTTT',
      'TtTTTTTtTTTTTTtT',
      'tttttttttttttttt'.slice(0, 16),
      'SSSSSSSSSSSSSSSS',
      'SSSsSSSSSSSsSSSS',
      'SSSSSSSSsSSSSSSS',
      'SsSSSSSSSSSSSSsS',
      'SSSSSSSSSSSSSSSS',
      'SSSSsSSSSSSSSSSS',
      'SSSSSSSSSSSsSSSS',
      'SsSSSSSSsSSSSSSS',
      'SSSSSSSSSSSSSSSS',
      'SSSsSSSSSSSSSsSS',
      'SSSSSSSsSSSSSSSS',
      'SSSSSSSSSSSSSSSS',
      'sSSSSSSSSSSSSSSs',
    ], P);

    tex(scene, 'dirt_' + world, [
      'SSSSSSSSSSSSSSSS',
      'SSSsSSSSSSSsSSSS',
      'SSSSSSSSsSSSSSSS',
      'SsSSSSSSSSSSSSsS',
      'SSSSSSSSSSSSSSSS',
      'SSSSsSSSSSSSSSSS',
      'SSSSSSSSSSSsSSSS',
      'SsSSSSSSsSSSSSSS',
      'SSSSSSSSSSSSSSSS',
      'SSSsSSSSSSSSSsSS',
      'SSSSSSSsSSSSSSSS',
      'SSSSSSSSSSSSSSSS',
      'SSSSSsSSSSsSSSSS',
      'SsSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSsS',
      'sSSSSSSSSSSSSSSs',
    ], P);
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
    const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  const BRICK = [
    'BBBBBBBmBBBBBBBB',
    'BbbbbbbmBbbbbbbB',
    'BbbbbbbmBbbbbbbB',
    'BbbbbbbmBbbbbbbB',
    'mmmmmmmmmmmmmmmm',
    'BBBmBBBBBBBmBBBB',
    'BbbmBbbbbbbmBbbB',
    'BbbmBbbbbbbmBbbB',
    'mmmmmmmmmmmmmmmm',
    'BBBBBBBmBBBBBBBB',
    'BbbbbbbmBbbbbbbB',
    'BbbbbbbmBbbbbbbB',
    'BbbbbbbmBbbbbbbB',
    'mmmmmmmmmmmmmmmm',
    'BBBmBBBBBBBmBBBB',
    'bbbmbbbbbbbmbbbb',
  ];
  const BRICK_P = { B: '#c1683c', b: '#a05430', m: '#6e3a20' };

  const QBLOCK = [
    'YYYYYYYYYYYYYYYY',
    'YyyyyyyyyyyyyyYY',
    'Yy....QQQQ....yY',
    'Yy...QQ..QQ...yY',
    'Yy...QQ..QQ...yY',
    'Yy......QQ....yY',
    'Yy.....QQ.....yY',
    'Yy.....QQ.....yY',
    'Yy.....QQ.....yY',
    'Yy............yY',
    'Yy.....QQ.....yY',
    'Yy.....QQ.....yY',
    'Yy............yY',
    'YyyyyyyyyyyyyyYY',
    'YYYYYYYYYYYYYYYY',
    'yyyyyyyyyyyyyyyy',
  ];
  const QBLOCK_P = { Y: '#f4b41b', y: '#c98d0a', Q: '#7a5230', '.': '#f6c945' };

  const USED = [
    'UUUUUUUUUUUUUUUU',
    'UuuuuuuuuuuuuuUU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'Uu............uU',
    'UuuuuuuuuuuuuuUU',
    'UUUUUUUUUUUUUUUU',
    'uuuuuuuuuuuuuuuu',
  ];
  const USED_P = { U: '#9e9e9e', u: '#6e6e6e', '.': '#8a8a8a' };

  const PLATFORM = [
    'PPPPPPPPPPPPPPPP',
    'PpppppppppppppPP',
    'pppppppppppppppp',
    '................',
  ];
  const PLATFORM_P = { P: '#b0793e', p: '#8a5a28' };

  const WATER = [
    '..W...W....W....',
    'WWWWWWWWWWWWWWWW',
    'wwwwwwwwwwwwwwww',
    'wwWwwwwwwWwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwWwwwwwwwWww',
    'wwwwwwwwwwwwwwww',
    'wWwwwwwwwwWwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwWwwwwwwww',
    'wwWwwwwwwwwwwWww',
    'wwwwwwwwwwwwwwww',
    'wwwwwWwwwwwwwwww',
    'wwwwwwwwwwWwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
  ];
  const WATER_P = { W: '#aed6f1', w: '#2e86c1' };

  const SPIKES = [
    '.......A........',
    '......AAA...A...',
    '..A...AAA..AAA..',
    '.AAA..AAA..AAA..',
    '.AAA.AAAAA.AAA..',
    '.AAA.AAAAA.AAA..',
    'AAAAAAAAAAAAAAAA',
    'aaaaaaaaaaaaaaaa',
  ];
  const SPIKES_P = { A: '#b0bec5', a: '#78909c' };

  const CONE = [
    '.......OO.......',
    '......OOOO......',
    '......OOOO......',
    '.....OWWWWO.....',
    '.....OOOOOO.....',
    '....OOOOOOOO....',
    '....OWWWWWWO....',
    '...OOOOOOOOOO...',
    '...OOOOOOOOOO...',
    '..OOOOOOOOOOOO..',
    'OOOOOOOOOOOOOOOO',
    'oooooooooooooooo',
  ];
  const CONE_P = { O: '#e67e22', o: '#a04000', W: '#ffffff' };

  const TRAMP = [
    '....GGGGGGGG....',
    '..GGGGGGGGGGGG..',
    '.GGgGGGGGGGGgGG.',
    '.GGGGGWWGGGGGGG.',
    'GGGGGWWWWGGGGGGG',
    'GGGGGGWWGGGGGGGG',
    'GGgGGGGGGGGGgGGG',
    'GGGGGGGGGGGGGGGG',
    '.GGGGGGGGGGGGGG.',
    '..GGGGGGGGGGGG..',
    '....GGGGGGGG....',
    '......gggg......',
  ];
  const TRAMP_P = { G: '#ab47bc', g: '#7b1fa2', W: '#f3e5f5' };

  const DRUM = [
    '....BBBBBBBBBBBBBBBBBBBB....',
    '..BBLLLLLLLLLLLLLLLLLLLLBB..',
    '.BLLLLLLLLLLLLLLLLLLLLLLLLB.',
    '.BLLLLLLLLLLLLLLLLLLLLLLLLB.',
    '.BBBBBBBBBBBBBBBBBBBBBBBBBB.',
    '.WBWWWBWWWBWWWBWWWBWWWBWWWB.',
    '.WWBWWWBWWWBWWWBWWWBWWWBWWW.',
    '.WWWBWWWBWWWBWWWBWWWBWWWBWW.',
    '.RRRRRRRRRRRRRRRRRRRRRRRRRR.',
    '.RrRRRRRRRRRRrRRRRRRRRRrRRR.',
    '.RRRRRRRRRRRRRRRRRRRRRRRRRR.',
    '.WWBWWWBWWWBWWWBWWWBWWWBWWW.',
    '.WBWWWBWWWBWWWBWWWBWWWBWWWB.',
    '.WWWBWWWBWWWBWWWBWWWBWWWBWW.',
    '.RRRRRRRRRRRRRRRRRRRRRRRRRR.',
    '.RRRRRRRRRRRRRRRRRRRRRRRRRR.',
    '.BBBBBBBBBBBBBBBBBBBBBBBBBB.',
    '....BBBBBBBBBBBBBBBBBBBB....',
  ];
  const DRUM_P = {
    B: '#5d4037', L: '#efdcc3', W: '#efebe9',
    R: '#8d3b2f', r: '#6e2c22',
  };

  const FAN = [
    '...HHHH...',
    '..HSSSSH..',
    '..HSESEH..',
    '...SSSS...',
    '.JJJJJJJJ.',
    'JJJJJJJJJJ',
    'J.JJJJJJ.J',
    '..JJJJJJ..',
    '..JJ..JJ..',
    '..DD..DD..',
  ];
  const FAN_P = {
    H: '#5d4037', S: '#e5b887', E: '#222222',
    J: '#ffffff', D: '#37474f',
  };

  // ------------------------------------------------------------------
  // Parallax background layers per world.
  // ------------------------------------------------------------------
  function makeBackgrounds(scene, world) {
    const W = 480, H = 270;
    const canvasFar = document.createElement('canvas');
    canvasFar.width = W; canvasFar.height = H;
    const f = canvasFar.getContext('2d');
    const canvasNear = document.createElement('canvas');
    canvasNear.width = W; canvasNear.height = H;
    const n = canvasNear.getContext('2d');

    if (world === 1) {
      // Fjords: mountains, water, a Viking longhouse.
      f.fillStyle = '#3d6e8f';
      poly(f, [[0, 270], [40, 130], [110, 270]]);
      poly(f, [[80, 270], [170, 90], [270, 270]]);
      poly(f, [[230, 270], [330, 120], [430, 270]]);
      poly(f, [[380, 270], [450, 150], [480, 200], [480, 270]]);
      f.fillStyle = '#e8f4f8';
      poly(f, [[160, 108], [170, 90], [182, 112], [170, 118]]);
      poly(f, [[320, 138], [330, 120], [342, 142]]);
      n.fillStyle = '#2f5d3a';
      hills(n, 60, 200);
      // longhouse
      n.fillStyle = '#5d4037';
      n.fillRect(300, 210, 80, 40);
      n.fillStyle = '#8d6e63';
      poly(n, [[292, 212], [340, 180], [388, 212]]);
    } else if (world === 2) {
      // Training ground: fence, goal frames, floodlight.
      f.fillStyle = '#a5d6a7';
      f.fillRect(0, 190, W, 80);
      f.fillStyle = '#ffffff';
      f.fillRect(60, 150, 4, 60); f.fillRect(160, 150, 4, 60);
      f.fillRect(60, 150, 104, 4);
      f.fillRect(300, 160, 3, 50); f.fillRect(370, 160, 3, 50);
      f.fillRect(300, 160, 73, 3);
      n.fillStyle = '#90a4ae';
      for (let x = 0; x < W; x += 26) n.fillRect(x, 205, 4, 65);
      n.fillRect(0, 205, W, 5);
      n.fillStyle = '#eceff1';
      n.fillRect(430, 120, 6, 150);
      n.fillStyle = '#fff59d';
      n.fillRect(418, 105, 30, 18);
    } else if (world === 3) {
      // Big city: skyline with lit windows, rain handled in-scene.
      const cols = ['#1a2634', '#22303f', '#2b3a4a'];
      let x = 0, i = 0;
      while (x < W) {
        const bw = 40 + (i * 37) % 45;
        const bh = 90 + (i * 53) % 120;
        f.fillStyle = cols[i % 3];
        f.fillRect(x, 270 - bh, bw, bh);
        f.fillStyle = '#f9e79f';
        for (let wy = 270 - bh + 10; wy < 258; wy += 16) {
          for (let wx = x + 6; wx < x + bw - 8; wx += 14) {
            if ((wx * wy) % 5 < 2) f.fillRect(wx, wy, 5, 7);
          }
        }
        x += bw + 8; i++;
      }
      n.fillStyle = '#101820';
      let x2 = 10, j = 0;
      while (x2 < W) {
        const bw = 55 + (j * 29) % 40;
        const bh = 60 + (j * 41) % 80;
        n.fillRect(x2, 270 - bh, bw, bh);
        x2 += bw + 24; j++;
      }
      // neon sign
      n.fillStyle = '#e91e63';
      n.fillRect(120, 150, 46, 14);
      n.fillStyle = '#00e5ff';
      n.fillRect(320, 170, 40, 12);
    } else {
      // Final stadium: stands, floodlights, crowd dots.
      f.fillStyle = '#37474f';
      f.fillRect(0, 120, W, 150);
      const crowd = ['#ef5350', '#42a5f5', '#ffee58', '#ffffff', '#66bb6a'];
      for (let cy = 130; cy < 260; cy += 9) {
        for (let cx = 3; cx < W; cx += 8) {
          f.fillStyle = crowd[(cx * 7 + cy * 13) % crowd.length];
          f.fillRect(cx, cy, 4, 4);
        }
      }
      n.fillStyle = '#263238';
      n.fillRect(0, 240, W, 30);
      n.fillStyle = '#cfd8dc';
      n.fillRect(60, 60, 8, 190); n.fillRect(400, 60, 8, 190);
      n.fillStyle = '#fffde7';
      n.fillRect(40, 40, 48, 22); n.fillRect(380, 40, 48, 22);
    }

    addCanvasTex(scene, 'bgfar_' + world, canvasFar);
    addCanvasTex(scene, 'bgnear_' + world, canvasNear);
  }

  function addCanvasTex(scene, key, canvas) {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
  }

  function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  function hills(ctx, top, bottom) {
    ctx.beginPath();
    ctx.moveTo(0, 270);
    for (let x = 0; x <= 480; x += 10) {
      ctx.lineTo(x, bottom + Math.sin(x / 55) * (bottom - top) * 0.3 - 30);
    }
    ctx.lineTo(480, 270);
    ctx.closePath();
    ctx.fill();
  }

  // ------------------------------------------------------------------
  // Public entry — generate everything once at boot.
  // ------------------------------------------------------------------
  function generateAll(scene) {
    // player
    tex(scene, 'e_sm_idle', SMALL_IDLE, EP);
    tex(scene, 'e_sm_run1', SMALL_RUN1, EP);
    tex(scene, 'e_sm_run2', SMALL_RUN2, EP);
    tex(scene, 'e_sm_jump', SMALL_JUMP, EP);
    const superP = Object.assign({ 9: '#f7d94c', 1: '#ffffff' }, EP);
    tex(scene, 'e_su_idle', superFrames(SUPER_LEGS_IDLE), superP);
    tex(scene, 'e_su_run1', superFrames(SUPER_LEGS_RUN1), superP);
    tex(scene, 'e_su_run2', superFrames(SUPER_LEGS_RUN2), superP);
    tex(scene, 'e_su_jump', superFrames(SUPER_LEGS_JUMP), superP);
    tex(scene, 'e_zen', ZEN, EP);

    // enemies
    tex(scene, 'defender1', DEFENDER1, DEFENDER_P);
    tex(scene, 'defender2', DEFENDER2, DEFENDER_P);
    tex(scene, 'referee', REFEREE, REF_P);
    tex(scene, 'redcard', REDCARD, { R: '#e74c3c', r: '#ffffff' });
    tex(scene, 'drone1', DRONE1, DRONE_P);
    tex(scene, 'drone2', DRONE2, DRONE_P);
    tex(scene, 'goalkeeper', GOALKEEPER, GK_P, 3);

    // items and projectiles
    tex(scene, 'coin', BALL, BALL_P);
    tex(scene, 'bigball', BALL, BALL_P, 4);
    tex(scene, 'fireball', BALL, FIREBALL_P);
    tex(scene, 'milk', MILK, MILK_P, 3);
    tex(scene, 'hairtie', HAIRTIE, HAIRTIE_P, 3);
    tex(scene, 'beef', BEEF, BEEF_P, 3);
    tex(scene, 'handbag', HANDBAG, HANDBAG_P, 3);

    // tiles
    tex(scene, 'brick', BRICK, BRICK_P);
    tex(scene, 'qblock', QBLOCK, QBLOCK_P);
    tex(scene, 'usedblock', USED, USED_P);
    tex(scene, 'platform', PLATFORM, PLATFORM_P);
    tex(scene, 'water', WATER, WATER_P);
    tex(scene, 'spikes', SPIKES, SPIKES_P, 2);
    tex(scene, 'cone', CONE, CONE_P);
    tex(scene, 'tramp', TRAMP, TRAMP_P);
    tex(scene, 'drum', DRUM, DRUM_P, 3);
    tex(scene, 'fan', FAN, FAN_P);

    for (let w = 1; w <= 4; w++) {
      makeTiles(scene, w);
      makeBackgrounds(scene, w);
    }

    // 1x1 white pixel for particles / flashes
    const c = document.createElement('canvas');
    c.width = 2; c.height = 2;
    c.getContext('2d').fillStyle = '#ffffff';
    c.getContext('2d').fillRect(0, 0, 2, 2);
    addCanvasTex(scene, 'pixel', c);
  }

  window.HQ = window.HQ || {};
  window.HQ.generateTextures = generateAll;
})();
