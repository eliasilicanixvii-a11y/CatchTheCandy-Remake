import { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Primi Passi',
    subtitle: 'Impara a lanciare la lingua elastica',
    theme: 'meadow',
    playerStart: { x: 180, y: 440 },
    candyStart: { x: 800, y: 440 },
    starsClicks: [2, 4],
    hint: 'Clicca su una superficie normale per lanciare la lingua e tirarti verso di essa!',
    objects: [
      // Left starting platform
      { type: 'normal', x: 180, y: 520, width: 220, height: 60, isStatic: true, label: 'Start Pad' },
      // Central gap pit hazard floor
      { type: 'hazard', x: 500, y: 580, width: 300, height: 40, isStatic: true, label: 'Spike Pit' },
      // Overhead anchor beam to swing across
      { type: 'normal', x: 500, y: 190, width: 340, height: 50, isStatic: true, label: 'Overhead Beam' },
      // Right landing platform with candy
      { type: 'normal', x: 800, y: 520, width: 220, height: 60, isStatic: true, label: 'Goal Pad' },
    ],
  },
  {
    id: 2,
    name: 'Scivolo di Ghiaccio',
    subtitle: 'Attenzione: sul ghiaccio la lingua scivola via!',
    theme: 'ice',
    playerStart: { x: 160, y: 380 },
    candyStart: { x: 820, y: 380 },
    starsClicks: [2, 5],
    hint: 'La lingua non può attaccarsi al ghiaccio. Mira ai punti in legno per oltrepassarlo!',
    objects: [
      // Left start
      { type: 'normal', x: 160, y: 470, width: 180, height: 60, isStatic: true, label: 'Start Shelf' },
      // Huge slippery ice floor in the middle
      { type: 'ice', x: 490, y: 530, width: 440, height: 60, isStatic: true, label: 'Ice Lake' },
      // Sloped ice ramp
      { type: 'ice', x: 340, y: 390, width: 40, height: 180, angle: 0.15, isStatic: true, label: 'Ice Wall' },
      // High normal wooden anchor ring in ceiling
      { type: 'normal', x: 490, y: 150, width: 140, height: 50, isStatic: true, label: 'Wooden Grip' },
      { type: 'normal', x: 490, y: 220, width: 40, height: 40, shape: 'circle', radius: 24, isStatic: true, label: 'Anchor Orb' },
      // Right goal platform
      { type: 'normal', x: 820, y: 470, width: 180, height: 60, isStatic: true, label: 'Goal Shelf' },
    ],
  },
  {
    id: 3,
    name: 'Cassa Mobile',
    subtitle: 'Tira gli oggetti mobili con la lingua',
    theme: 'meadow',
    playerStart: { x: 160, y: 450 },
    candyStart: { x: 820, y: 200 },
    starsClicks: [3, 6],
    hint: 'Puoi agganciare e trascinare le casse di legno mobili per salire più in alto!',
    objects: [
      // Ground floor
      { type: 'normal', x: 490, y: 540, width: 900, height: 60, isStatic: true, label: 'Ground' },
      // High goal ledge
      { type: 'normal', x: 820, y: 270, width: 220, height: 40, isStatic: true, label: 'High Ledge' },
      // High ice divider preventing direct tongue to the goal
      { type: 'ice', x: 670, y: 360, width: 36, height: 260, isStatic: true, label: 'Ice Barrier' },
      // Movable heavy wooden crate
      { type: 'movable', x: 440, y: 460, width: 85, height: 85, isStatic: false, label: 'Wood Crate' },
      // Ceiling wooden beam
      { type: 'normal', x: 440, y: 120, width: 240, height: 40, isStatic: true, label: 'Ceiling Grip' },
    ],
  },
  {
    id: 4,
    name: 'Il Pendolo Glaciale',
    subtitle: 'Oscilla tra ancoraggi normali sopra abissi di ghiaccio',
    theme: 'crystal',
    playerStart: { x: 140, y: 280 },
    candyStart: { x: 840, y: 280 },
    starsClicks: [3, 6],
    hint: 'Prendi slancio oscillando come un pendolo per raggiungere l\'ancoraggio successivo!',
    objects: [
      // Starting ledge
      { type: 'normal', x: 140, y: 350, width: 140, height: 40, isStatic: true, label: 'Ledge 1' },
      // Deep slippery pit
      { type: 'ice', x: 490, y: 560, width: 700, height: 50, isStatic: true, label: 'Ice Deep' },
      // Overhead anchor orbs
      { type: 'normal', x: 330, y: 130, width: 44, height: 44, shape: 'circle', radius: 26, isStatic: true, label: 'Orb 1' },
      { type: 'normal', x: 490, y: 110, width: 44, height: 44, shape: 'circle', radius: 26, isStatic: true, label: 'Orb 2' },
      { type: 'normal', x: 650, y: 130, width: 44, height: 44, shape: 'circle', radius: 26, isStatic: true, label: 'Orb 3' },
      // Slippery ice hanging stalactites
      { type: 'ice', x: 410, y: 210, width: 28, height: 120, isStatic: true, label: 'Ice Spire 1' },
      { type: 'ice', x: 570, y: 210, width: 28, height: 120, isStatic: true, label: 'Ice Spire 2' },
      // End ledge
      { type: 'normal', x: 840, y: 350, width: 140, height: 40, isStatic: true, label: 'Ledge 2' },
    ],
  },
  {
    id: 5,
    name: 'Il Bilanciere Meccanico',
    subtitle: 'Usa la leva per far rotolare la caramella',
    theme: 'sunset',
    playerStart: { x: 180, y: 440 },
    candyStart: { x: 810, y: 120, isMovable: true },
    starsClicks: [3, 6],
    hint: 'La caramella è mobile! Fai leva sul bilanciere o tirala direttamente!',
    objects: [
      // Left start platform
      { type: 'normal', x: 180, y: 510, width: 200, height: 50, isStatic: true, label: 'Start Pad' },
      // High ramp where candy sits
      { type: 'normal', x: 810, y: 170, width: 180, height: 30, angle: -0.1, isStatic: true, label: 'Candy Perch' },
      // Center fulcrum post
      { type: 'normal', x: 500, y: 460, width: 36, height: 90, isStatic: true, label: 'Fulcrum' },
      // Tilting seesaw plank (dynamic movable plank resting on fulcrum!)
      { type: 'movable', x: 500, y: 410, width: 360, height: 26, isStatic: false, label: 'Seesaw Plank' },
      // Bottom barrier
      { type: 'ice', x: 500, y: 550, width: 500, height: 35, isStatic: true, label: 'Bottom Ice' },
      // Overhead anchor
      { type: 'normal', x: 500, y: 110, width: 160, height: 36, isStatic: true, label: 'Top Bar' },
    ],
  },
  {
    id: 6,
    name: 'La Parete Glaciale',
    subtitle: 'Scala la parete ghiacciata agganciando i soli tasselli sicuri',
    theme: 'ice',
    playerStart: { x: 140, y: 490 },
    candyStart: { x: 840, y: 140 },
    starsClicks: [4, 7],
    hint: 'Grande torre di ghiaccio: pianifica la traiettoria mirando esclusivamente ai bottoni in legno!',
    objects: [
      // Base floor
      { type: 'normal', x: 180, y: 560, width: 220, height: 40, isStatic: true, label: 'Base' },
      // Huge vertical ice cliff
      { type: 'ice', x: 380, y: 310, width: 48, height: 450, isStatic: true, label: 'Ice Cliff 1' },
      { type: 'ice', x: 620, y: 250, width: 48, height: 450, isStatic: true, label: 'Ice Cliff 2' },
      // Small wooden climbing knobs
      { type: 'normal', x: 260, y: 380, width: 36, height: 36, shape: 'circle', radius: 20, isStatic: true, label: 'Knob 1' },
      { type: 'normal', x: 500, y: 320, width: 36, height: 36, shape: 'circle', radius: 20, isStatic: true, label: 'Knob 2' },
      { type: 'normal', x: 500, y: 170, width: 36, height: 36, shape: 'circle', radius: 20, isStatic: true, label: 'Knob 3' },
      { type: 'normal', x: 740, y: 240, width: 36, height: 36, shape: 'circle', radius: 20, isStatic: true, label: 'Knob 4' },
      // Ice pit below
      { type: 'ice', x: 500, y: 565, width: 440, height: 35, isStatic: true, label: 'Ice Trench' },
      // High candy landing
      { type: 'normal', x: 840, y: 190, width: 160, height: 36, isStatic: true, label: 'Goal Post' },
    ],
  },
  {
    id: 7,
    name: 'Il Trampolino Elastico',
    subtitle: 'Superfici rimbalzanti per slanci spettacolari',
    theme: 'candy',
    playerStart: { x: 150, y: 440 },
    candyStart: { x: 830, y: 160 },
    starsClicks: [3, 6],
    hint: 'I cuscinetti rimbalzanti verdi ti spingono con forza extra!',
    objects: [
      // Starting pad
      { type: 'normal', x: 150, y: 520, width: 170, height: 50, isStatic: true, label: 'Start Pad' },
      // Bouncy spring pad on floor
      { type: 'bouncy', x: 380, y: 530, width: 160, height: 40, isStatic: true, label: 'Spring Pad 1' },
      // Ice wall in the center
      { type: 'ice', x: 490, y: 340, width: 40, height: 260, isStatic: true, label: 'Ice Divider' },
      // Bouncy vertical wall
      { type: 'bouncy', x: 620, y: 420, width: 130, height: 40, isStatic: true, label: 'Spring Pad 2' },
      // Overhead anchor ring
      { type: 'normal', x: 490, y: 100, width: 140, height: 36, isStatic: true, label: 'Top Anchor' },
      // Candy platform
      { type: 'normal', x: 830, y: 220, width: 160, height: 40, isStatic: true, label: 'Candy Ledge' },
    ],
  },
  {
    id: 8,
    name: 'La Grande Sfida',
    subtitle: 'Il puzzle definitivo con tutti gli elementi fisici combinati',
    theme: 'crystal',
    playerStart: { x: 130, y: 470 },
    candyStart: { x: 850, y: 130, isMovable: true },
    starsClicks: [5, 9],
    hint: 'Trascina le casse mobili, rimbalza, scivola e oscilla fino alla caramella regina!',
    objects: [
      // Ground
      { type: 'normal', x: 150, y: 540, width: 180, height: 50, isStatic: true, label: 'Start' },
      // Ice valley
      { type: 'ice', x: 490, y: 550, width: 420, height: 45, isStatic: true, label: 'Ice Pit' },
      // Movable crate in pit
      { type: 'movable', x: 340, y: 470, width: 75, height: 75, isStatic: false, label: 'Crate 1' },
      // Bouncy ramp
      { type: 'bouncy', x: 500, y: 470, width: 110, height: 35, angle: -0.15, isStatic: true, label: 'Bounce Ramp' },
      // Central ice pillar
      { type: 'ice', x: 640, y: 320, width: 38, height: 340, isStatic: true, label: 'Ice Pillar' },
      // Overhead wooden anchors
      { type: 'normal', x: 320, y: 150, width: 110, height: 32, isStatic: true, label: 'Anchor 1' },
      { type: 'normal', x: 500, y: 110, width: 110, height: 32, isStatic: true, label: 'Anchor 2' },
      { type: 'normal', x: 640, y: 90, width: 40, height: 40, shape: 'circle', radius: 24, isStatic: true, label: 'Orb Anchor' },
      // High movable crate near candy
      { type: 'movable', x: 740, y: 250, width: 65, height: 65, isStatic: false, label: 'High Crate' },
      // Goal platform
      { type: 'normal', x: 850, y: 180, width: 150, height: 35, isStatic: true, label: 'Victory Pad' },
    ],
  },
];
