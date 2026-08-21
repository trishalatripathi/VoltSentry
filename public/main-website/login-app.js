/**
 * VoltSentry 3D Showroom & Login Controller (login-app.js)
 * Implements:
 * • True 3D Mid-Engine Emerald Supercar Coupe Model (Matching 6-View Blueprint Sheet)
 * • Rich Emerald Metallic Paint (0x072a16) & Obsidian Carbon Aerodynamics
 * • Full 360° Horizontal Drag Rotation with Inertia & Physics Momentum
 * • Signature Green LED Matrix Headlights, Active Floor Spotlights & Underglow
 * • 3D Floating Disintegration Crystals & Electrical Particle Field
 * • Interactive Light Mode / Dark Mode Theme Switcher
 * • Password visibility eye toggle
 * • Cinematic battery verification transition sequence & dashboard redirect
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const canvas = document.getElementById('vehicleCanvas');
  const container = document.getElementById('canvasContainer');
  const exploreLabel = document.getElementById('exploreLabel');
  const rippleContainer = document.getElementById('rippleContainer');
  
  const loginForm = document.getElementById('loginForm');
  const loginCard = document.getElementById('loginCard');
  const signInBtn = document.getElementById('signInBtn');
  const logoBolt = document.querySelector('.logo-bolt');
  const sweepOverlay = document.getElementById('sweepOverlay');
  
  const eyeToggle = document.getElementById('eyeToggle');
  const passwordInput = document.getElementById('passwordInput');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const body = document.body;

  // ========================================================
  // 1. LIGHT / DARK THEME TOGGLE
  // ========================================================
  const savedTheme = localStorage.getItem('voltsentry-theme');
  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      body.classList.toggle('light-theme');
      body.classList.toggle('dark-theme');
      
      const isLight = body.classList.contains('light-theme');
      localStorage.setItem('voltsentry-theme', isLight ? 'light' : 'dark');
      
      if (ambientLight) {
        ambientLight.intensity = isLight ? 2.0 : 1.3;
      }
    });
  }

  // ========================================================
  // 2. PASSWORD VISIBILITY TOGGLE
  // ========================================================
  if (eyeToggle && passwordInput) {
    eyeToggle.addEventListener('click', () => {
      const isPass = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPass ? 'text' : 'password');
      
      const eyeIcon = document.getElementById('eyeIcon');
      if (isPass) {
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        `;
      } else {
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        `;
      }
    });
  }

  // ========================================================
  // 3. THREE.JS 3D SHOWROOM ENGINE
  // ========================================================
  let scene, camera, renderer;
  let vehicleGroup, vehicleBody, vehicleBodyWireframe;
  let ambientLight, dirLight1, dirLight2;
  let headlightLightL, headlightLightR, underglowLight;
  
  // Materials
  let bodyPaintMat, windshieldMat, chromeMat, wheelMat, emissiveGreenMat, emissiveOrangeMat, headlightsMat, carbonMat;
  let shardsGroup = [];
  let particles, particlePositions, particleVelocities;
  const particleCount = 200;
  
  // Physics & Interaction State
  let isDragging = false;
  let startPointerX = 0;
  let rotationVelocity = 0.005; // Starting showroom spin inertia
  const friction = 0.96;
  const originalRotationY = 0.45; // Hero showroom angle
  
  let targetVehicleY = 0;
  let currentVehicleY = 0;
  let mouse = new THREE.Vector2();
  let raycaster = new THREE.Raycaster();
  let isHovered = false;
  let hasInteracted = false;
  
  let particleMode = 'float'; // 'float' | 'attract' | 'batteryField'
  let batteryFieldProgress = { value: 0 };

  function initThree() {
    if (!canvas || !container) return;

    // Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060906, 0.05);

    camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.25, 5.4);
    camera.lookAt(0, 0.1, 0);

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Lighting
    ambientLight = new THREE.AmbientLight(0x0e1b10, 1.3);
    scene.add(ambientLight);

    dirLight1 = new THREE.DirectionalLight(0x4ade80, 0.65);
    dirLight1.position.set(5, 6, 4);
    scene.add(dirLight1);

    dirLight2 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight2.position.set(-6, 8, -2);
    scene.add(dirLight2);

    // Dynamic Headlight Spotlights
    headlightLightL = new THREE.SpotLight(0xeeffee, 2.0, 14, Math.PI / 6, 0.4, 1);
    headlightLightL.position.set(-0.6, 0.25, 1.4);
    headlightLightL.target.position.set(-1.2, -0.2, 5.0);
    scene.add(headlightLightL);
    scene.add(headlightLightL.target);

    headlightLightR = new THREE.SpotLight(0xeeffee, 2.0, 14, Math.PI / 6, 0.4, 1);
    headlightLightR.position.set(0.6, 0.25, 1.4);
    headlightLightR.target.position.set(1.2, -0.2, 5.0);
    scene.add(headlightLightR);
    scene.add(headlightLightR.target);

    // Underbody Green Glow
    underglowLight = new THREE.PointLight(0x22c55e, 3.2, 4.2, 1.5);
    underglowLight.position.set(0, -0.25, 0);
    scene.add(underglowLight);

    // Showroom Floor Grid
    const gridHelper = new THREE.GridHelper(22, 44, 0x16341c, 0x0a160c);
    gridHelper.position.y = -0.42;
    scene.add(gridHelper);

    // Build 3D Emerald Mid-Engine Supercar (Matching 6-view blueprint reference)
    buildEmeraldSupercar();

    // Build 3D Electrical Particles
    buildParticles();

    // Start Rendering Loop
    animate();

    // Initial Entrance Rotation Tween
    vehicleGroup.rotation.y = -Math.PI;
    if (window.gsap) {
      gsap.to(vehicleGroup.rotation, {
        y: originalRotationY,
        duration: 1.8,
        ease: 'power3.out'
      });
    } else {
      vehicleGroup.rotation.y = originalRotationY;
    }
  }

  // ========================================================
  // 4. EXACT 3D EMERALD SUPERCAR GEOMETRY ASSEMBLY
  // (Derived directly from 6-view orthographic blueprint)
  // ========================================================
  function buildEmeraldSupercar() {
    vehicleGroup = new THREE.Group();
    vehicleGroup.position.set(0, 0, 0);
    scene.add(vehicleGroup);

    vehicleBody = new THREE.Group();
    vehicleGroup.add(vehicleBody);

    // Exact Metallic Emerald Paint (Matching the 6-view reference sheet)
    bodyPaintMat = new THREE.MeshStandardMaterial({
      color: 0x072a16, // Rich Metallic Emerald Green
      roughness: 0.12,
      metalness: 0.88,
      name: 'emeraldBodyPaint'
    });

    windshieldMat = new THREE.MeshStandardMaterial({
      color: 0x020804,
      roughness: 0.04,
      metalness: 0.96,
      transparent: true,
      opacity: 0.85
    });

    chromeMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.15,
      metalness: 0.92
    });

    wheelMat = new THREE.MeshStandardMaterial({
      color: 0x060907,
      roughness: 0.5,
      metalness: 0.3
    });

    carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0a100c,
      roughness: 0.3,
      metalness: 0.8
    });

    emissiveGreenMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x4ade80,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.5
    });

    emissiveOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.5
    });

    headlightsMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x4ade80,
      emissiveIntensity: 3.2
    });

    // 1. Main Wide Mid-Engine Supercar Chassis (Matching Blueprint Width & Length)
    const chassisGeo = new THREE.BoxGeometry(1.82, 0.16, 3.76);
    const chassis = new THREE.Mesh(chassisGeo, bodyPaintMat);
    chassis.position.y = 0.08;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    vehicleBody.add(chassis);

    // Low-Slung Front Splitter Lip
    const splitterGeo = new THREE.BoxGeometry(1.86, 0.04, 0.44);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.02, 1.98);
    vehicleBody.add(splitter);

    const splitterGlow = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.02, 0.04), emissiveGreenMat);
    splitterGlow.position.set(0, 0.01, 2.19);
    vehicleBody.add(splitterGlow);

    // 2. Sculpted Wedge Nose Bonnet (Matching Front & Side Views)
    const hoodGeo = new THREE.BoxGeometry(1.72, 0.18, 1.45);
    const hood = new THREE.Mesh(hoodGeo, bodyPaintMat);
    hood.position.set(0, 0.19, 1.2);
    hood.rotation.x = -0.14; // Low sharp wedge slope
    hood.castShadow = true;
    vehicleBody.add(hood);

    // Center Bonnet Ridge Strips
    const ridgeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.8), emissiveGreenMat);
    ridgeL.position.set(-0.35, 0.26, 1.15);
    ridgeL.rotation.x = -0.14;
    vehicleBody.add(ridgeL);
    const ridgeR = ridgeL.clone();
    ridgeR.position.x = 0.35;
    vehicleBody.add(ridgeR);

    // Front Nose Cap
    const noseGeo = new THREE.BoxGeometry(1.72, 0.22, 0.38);
    const nose = new THREE.Mesh(noseGeo, bodyPaintMat);
    nose.position.set(0, 0.1, 1.92);
    vehicleBody.add(nose);

    // Lower Front Bumper Corner Intakes (Green L-bars from reference sheet)
    const intakeL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.05), emissiveGreenMat);
    intakeL.position.set(-0.66, 0.08, 2.09);
    vehicleBody.add(intakeL);
    const intakeR = intakeL.clone();
    intakeR.position.x = 0.66;
    vehicleBody.add(intakeR);

    // 3. Teardrop Supercar Glass Canopy & Mid-Engine Glass Cover (Matching Top View)
    const cabinGeo = new THREE.SphereGeometry(0.78, 32, 16);
    cabinGeo.scale(1.12, 0.54, 1.95);
    const cabin = new THREE.Mesh(cabinGeo, windshieldMat);
    cabin.position.set(0, 0.34, -0.05);
    cabin.castShadow = true;
    vehicleBody.add(cabin);

    // Mid-Engine Glass Bay Cover (Rear decklid glass section)
    const engineGlassGeo = new THREE.BoxGeometry(0.96, 0.04, 0.85);
    const engineGlass = new THREE.Mesh(engineGlassGeo, windshieldMat);
    engineGlass.position.set(0, 0.36, -0.85);
    engineGlass.rotation.x = 0.12;
    vehicleBody.add(engineGlass);

    // A-Pillars
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.06), bodyPaintMat);
    pillarL.position.set(-0.64, 0.34, 0.68);
    pillarL.rotation.set(-0.58, 0, 0.3);
    vehicleBody.add(pillarL);
    const pillarR = pillarL.clone();
    pillarR.position.x = 0.64;
    pillarR.rotation.z = -0.3;
    vehicleBody.add(pillarR);

    // C-Pillars Buttresses
    const buttressL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.9), bodyPaintMat);
    buttressL.position.set(-0.68, 0.3, -0.95);
    buttressL.rotation.set(0.35, 0, 0.16);
    vehicleBody.add(buttressL);
    const buttressR = buttressL.clone();
    buttressR.position.x = 0.68;
    buttressR.rotation.z = -0.16;
    vehicleBody.add(buttressR);

    // 4. Side Intake Scoops & Sculpted Hips (Matching Side & Top Views)
    const sideScoopL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.95), carbonMat);
    sideScoopL.position.set(-0.88, 0.2, -0.2);
    sideScoopL.rotation.y = 0.15;
    vehicleBody.add(sideScoopL);

    const sideScoopR = sideScoopL.clone();
    sideScoopR.position.x = 0.88;
    sideScoopR.rotation.y = -0.15;
    vehicleBody.add(sideScoopR);

    // Carbon Aero Mirrors
    const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.1), carbonMat);
    mirrorL.position.set(-0.94, 0.34, 0.48);
    vehicleBody.add(mirrorL);
    const mirrorR = mirrorL.clone();
    mirrorR.position.x = 0.94;
    vehicleBody.add(mirrorR);

    const mirrorLedL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), emissiveOrangeMat);
    mirrorLedL.position.set(-0.96, 0.34, 0.51);
    vehicleBody.add(mirrorLedL);
    const mirrorLedR = mirrorLedL.clone();
    mirrorLedR.position.x = 0.96;
    vehicleBody.add(mirrorLedR);

    // 5. Muscular 3D Wheel Arch Fenders (Matching Top View Hips)
    const fenderPositions = [
      [-0.88, 1.15],
      [0.88, 1.15],
      [-0.9, -1.15],
      [0.9, -1.15]
    ];

    fenderPositions.forEach((pos) => {
      const fenderGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.32, 16, 1, false, 0, Math.PI);
      fenderGeo.rotateZ(Math.PI / 2);
      const fender = new THREE.Mesh(fenderGeo, bodyPaintMat);
      fender.position.set(pos[0], 0.18, pos[1]);
      fender.rotation.x = Math.PI / 2;
      vehicleBody.add(fender);
    });

    // 6. Side Rocker Skirts with Green Neon Sill Strip
    const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 2.3), carbonMat);
    skirtL.position.set(-0.88, 0.06, 0);
    vehicleBody.add(skirtL);
    const skirtR = skirtL.clone();
    skirtR.position.x = 0.88;
    vehicleBody.add(skirtR);

    const neonL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 2.1), emissiveGreenMat);
    neonL.position.set(-0.89, 0.06, 0);
    vehicleBody.add(neonL);
    const neonR = neonL.clone();
    neonR.position.x = 0.89;
    vehicleBody.add(neonR);

    // 7. Signature Green LED Strip Headlights & Tail Lightbar (Matching Front & Rear Blueprint)
    const lightBarGeo = new THREE.BoxGeometry(0.42, 0.035, 0.08);
    const headlightL = new THREE.Mesh(lightBarGeo, headlightsMat);
    headlightL.position.set(-0.6, 0.18, 1.98);
    headlightL.rotation.y = 0.18;
    vehicleBody.add(headlightL);

    const headlightR = headlightL.clone();
    headlightR.position.x = 0.6;
    headlightR.rotation.y = -0.18;
    vehicleBody.add(headlightR);

    // Rear Tail Lightbar
    const tailLightGeo = new THREE.BoxGeometry(1.72, 0.035, 0.04);
    const tailLightMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 2.2
    });
    const tailLight = new THREE.Mesh(tailLightGeo, tailLightMat);
    tailLight.position.set(0, 0.24, -1.86);
    vehicleBody.add(tailLight);

    // Rear Carbon Diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.74, 0.12, 0.35);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
    diffuser.position.set(0, 0.06, -1.78);
    vehicleBody.add(diffuser);

    // 8. Satin Black 10-Spoke Alloy Wheels & Glowing Green Calipers
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 24);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelPositions = [
      [-0.89, 0.04, 1.15],
      [0.89, 0.04, 1.15],
      [-0.91, 0.04, -1.15],
      [0.91, 0.04, -1.15]
    ];

    wheelPositions.forEach((pos) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(pos[0], pos[1], pos[2]);

      // Tire
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.castShadow = true;
      wGroup.add(tire);

      // Satin Black Rim Lip
      const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.29, 24);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, carbonMat);
      wGroup.add(rim);

      // Glowing Green Spokes (Cross-star inserts)
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.58, 0.3);
      const spoke1 = new THREE.Mesh(spokeGeo, emissiveGreenMat);
      wGroup.add(spoke1);

      const spoke2 = spoke1.clone();
      spoke2.rotation.x = Math.PI / 2;
      wGroup.add(spoke2);

      const spoke3 = spoke1.clone();
      spoke3.rotation.x = Math.PI / 4;
      wGroup.add(spoke3);

      const spoke4 = spoke1.clone();
      spoke4.rotation.x = -Math.PI / 4;
      wGroup.add(spoke4);

      // Glowing Green Disc Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.06, 0.18, 0.1);
      const caliper = new THREE.Mesh(caliperGeo, emissiveGreenMat);
      caliper.position.set(pos[0] > 0 ? -0.06 : 0.06, 0.18, 0);
      wGroup.add(caliper);

      // Hubcap center
      const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.31, 8);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, wheelMat);
      wGroup.add(cap);

      vehicleBody.add(wGroup);
    });

    // 9. Trailing 3D Disintegration Shards Cluster (Emerald & Gold)
    shardsGroup = [];
    const shardCount = 52;
    const shardGeo = new THREE.IcosahedronGeometry(0.065, 0);

    for (let i = 0; i < shardCount; i++) {
      const mat = Math.random() > 0.4 ? emissiveGreenMat : emissiveOrangeMat;
      const shard = new THREE.Mesh(shardGeo, mat);

      const x = 0.25 + (Math.random() - 0.2) * 1.1;
      const y = (Math.random() - 0.25) * 0.7 + 0.15;
      const z = -0.4 - Math.random() * 1.6;

      shard.position.set(x, y, z);

      const s = 0.25 + Math.random() * 1.3;
      shard.scale.set(s, s, s);
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      shard.userData = {
        originalPosition: new THREE.Vector3(x, y, z),
        phase: Math.random() * Math.PI * 2,
        speed: 1.1 + Math.random() * 2.2
      };

      vehicleBody.add(shard);
      shardsGroup.push(shard);
    }

    // 10. Holographic 3D Wireframe Clone for Transition
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      wireframe: true,
      transparent: true,
      opacity: 0
    });

    vehicleBodyWireframe = new THREE.Group();
    vehicleBody.traverse((child) => {
      if (child.isMesh && !shardsGroup.includes(child)) {
        const wireClone = new THREE.Mesh(child.geometry.clone(), wireframeMat);
        wireClone.position.copy(child.position);
        wireClone.rotation.copy(child.rotation);
        wireClone.scale.copy(child.scale);
        vehicleBodyWireframe.add(wireClone);
      }
    });
    vehicleBodyWireframe.visible = false;
    vehicleBody.add(vehicleBodyWireframe);
  }

  // ========================================================
  // 5. 3D ELECTRICAL PARTICLES
  // ========================================================
  function buildParticles() {
    const geo = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 6.5;
      const y = (Math.random() - 0.2) * 2.4;
      const z = (Math.random() - 0.5) * 5.5;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.006 + 0.003,
        z: (Math.random() - 0.5) * 0.008,
        phase: Math.random() * Math.PI * 2
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x4ade80,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particles = new THREE.Points(geo, pMat);
    scene.add(particles);
  }

  function updateParticles() {
    if (!particles) return;
    const posAttr = particles.geometry.attributes.position;
    const time = performance.now() * 0.001;

    for (let i = 0; i < particleCount; i++) {
      let x = posAttr.getX(i);
      let y = posAttr.getY(i);
      let z = posAttr.getZ(i);
      const vel = particleVelocities[i];

      if (particleMode === 'float') {
        x += vel.x;
        y += vel.y;
        z += vel.z;

        if (y > 2.2) y = -0.4;
        if (Math.abs(x) > 3.4) x = (Math.random() - 0.5) * 4.5;
        if (Math.abs(z) > 3.4) z = (Math.random() - 0.5) * 4.5;

      } else if (particleMode === 'attract') {
        const targetX = mouse.x * 2.4;
        const targetY = mouse.y * 1.3 + 0.3;
        const targetZ = 1.2;

        x += (targetX - x) * 0.035 + (Math.random() - 0.5) * 0.01;
        y += (targetY - y) * 0.035 + (Math.random() - 0.5) * 0.01;
        z += (targetZ - z) * 0.035 + (Math.random() - 0.5) * 0.01;

      } else if (particleMode === 'batteryField') {
        const indexRatio = i / particleCount;
        const angle = indexRatio * Math.PI * 2 + time * 2.2;
        const radius = 1.7 + Math.sin(time * 4 + indexRatio * 10) * 0.18;

        const targetX = Math.cos(angle) * radius;
        const targetY = (indexRatio - 0.5) * 0.85 + 0.15;
        const targetZ = Math.sin(angle) * radius;

        const lerpFactor = batteryFieldProgress.value;
        x = THREE.MathUtils.lerp(x, targetX, lerpFactor);
        y = THREE.MathUtils.lerp(y, targetY, lerpFactor);
        z = THREE.MathUtils.lerp(z, targetZ, lerpFactor);
      }

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  }

  // ========================================================
  // 6. RENDER ANIMATION & PHYSICS LOOP
  // ========================================================
  function animate() {
    requestAnimationFrame(animate);

    // Free 360° Horizontal Drag Rotation with Momentum
    if (!isDragging) {
      vehicleGroup.rotation.y += rotationVelocity;
      rotationVelocity *= friction;

      if (particleMode !== 'batteryField' && Math.abs(rotationVelocity) < 0.0006) {
        rotationVelocity = 0.0006; // Ambient showroom glide
      }
    }

    // Vehicle Hover Lift Interpolation
    currentVehicleY = THREE.MathUtils.lerp(currentVehicleY, targetVehicleY, 0.08);
    vehicleBody.position.y = currentVehicleY + Math.sin(performance.now() * 0.0016) * 0.025;

    // Spotlights follow 360° Car Rotation
    const headAngle = vehicleGroup.rotation.y;
    const forwardX = Math.sin(headAngle);
    const forwardZ = Math.cos(headAngle);

    headlightLightL.position.set(
      vehicleGroup.position.x - 0.6 * forwardZ + 1.4 * forwardX,
      vehicleGroup.position.y + currentVehicleY + 0.25,
      vehicleGroup.position.z + 0.6 * forwardX + 1.4 * forwardZ
    );
    headlightLightL.target.position.set(
      headlightLightL.position.x + 3.2 * forwardX,
      -0.2,
      headlightLightL.position.z + 3.2 * forwardZ
    );
    headlightLightL.target.updateMatrixWorld();

    headlightLightR.position.set(
      vehicleGroup.position.x + 0.6 * forwardZ + 1.4 * forwardX,
      vehicleGroup.position.y + currentVehicleY + 0.25,
      vehicleGroup.position.z - 0.6 * forwardX + 1.4 * forwardZ
    );
    headlightLightR.target.position.set(
      headlightLightR.position.x + 3.2 * forwardX,
      -0.2,
      headlightLightR.position.z + 3.2 * forwardZ
    );
    headlightLightR.target.updateMatrixWorld();

    // Floating 3D Shards Motion
    const timeVal = performance.now() * 0.001;
    shardsGroup.forEach((shard) => {
      const uData = shard.userData;
      const wave = Math.sin(timeVal * uData.speed + uData.phase) * 0.08;
      shard.position.y = uData.originalPosition.y + wave;
      shard.position.x = uData.originalPosition.x + Math.cos(timeVal * uData.speed + uData.phase) * 0.04;
      shard.rotation.x += 0.008;
      shard.rotation.y += 0.012;
    });

    // Particle system update
    updateParticles();

    renderer.render(scene, camera);
  }

  // ========================================================
  // 7. POINTER & RAYCASTING INTERACTION
  // ========================================================
  function handleRaycast(event) {
    if (particleMode === 'batteryField') return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(vehicleBody.children, true);

    if (intersects.length > 0) {
      if (!isHovered) {
        isHovered = true;
        setHoverState(true);
      }
    } else {
      if (isHovered) {
        isHovered = false;
        setHoverState(false);
      }
    }
  }

  function setHoverState(hovered) {
    if (particleMode === 'batteryField') return;

    if (hovered) {
      targetVehicleY = 0.24; // lift vehicle
      particleMode = 'attract';

      if (window.gsap) {
        gsap.to(emissiveGreenMat, { emissiveIntensity: 2.6, duration: 0.4 });
        gsap.to(headlightsMat, { emissiveIntensity: 4.5, duration: 0.4 });
        gsap.to(underglowLight, { intensity: 5.2, duration: 0.4 });
        gsap.to(bodyPaintMat.color, { r: 0.08, g: 0.22, b: 0.12, duration: 0.4 });
      }

      headlightLightL.intensity = 3.2;
      headlightLightR.intensity = 3.2;

    } else {
      targetVehicleY = 0;
      particleMode = 'float';

      if (window.gsap) {
        gsap.to(emissiveGreenMat, { emissiveIntensity: 2.2, duration: 0.4 });
        gsap.to(headlightsMat, { emissiveIntensity: 3.2, duration: 0.4 });
        gsap.to(underglowLight, { intensity: 3.2, duration: 0.4 });
        gsap.to(bodyPaintMat.color, { r: 0.04, g: 0.16, b: 0.08, duration: 0.4 });
      }

      headlightLightL.intensity = 2.0;
      headlightLightR.intensity = 2.0;
    }
  }

  // Pointer event listeners on canvas container
  container.addEventListener('mousemove', handleRaycast);

  container.addEventListener('mouseleave', () => {
    if (isHovered) {
      isHovered = false;
      setHoverState(false);
    }
  });

  container.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startPointerX = e.clientX;
    rotationVelocity = 0;

    if (!hasInteracted) {
      hasInteracted = true;
      if (exploreLabel) exploreLabel.classList.add('fade-out');
    }

    const rect = container.getBoundingClientRect();
    triggerRipple(e.clientX - rect.left, e.clientY - rect.top);

    container.setPointerCapture(e.pointerId);
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startPointerX;
    startPointerX = e.clientX;

    // Full 360° Horizontal Drag Rotation
    vehicleGroup.rotation.y += deltaX * 0.009;
    rotationVelocity = deltaX * 0.0035; // Momentum
  });

  container.addEventListener('pointerup', (e) => {
    isDragging = false;
    container.releasePointerCapture(e.pointerId);
  });

  container.addEventListener('pointercancel', () => {
    isDragging = false;
  });

  canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  // Ripple Ring Emitter
  function triggerRipple(x, y) {
    if (!rippleContainer) return;
    const ripple = document.createElement('div');
    ripple.classList.add('ripple-ring');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    rippleContainer.appendChild(ripple);

    if (window.gsap) {
      gsap.to(ripple, {
        scale: 14,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    } else {
      setTimeout(() => ripple.remove(), 900);
    }
  }

  // ========================================================
  // 8. CINEMATIC LOGIN SUCCESS TRANSITION
  // ========================================================
  function triggerCinematicTransition() {
    if (particleMode === 'batteryField') return;
    particleMode = 'batteryField';
    isHovered = false;

    // 1. Button changes state
    const btnText = signInBtn ? signInBtn.querySelector('.btn-text') : null;
    if (btnText) btnText.textContent = "Verifying battery...";
    if (signInBtn) signInBtn.style.pointerEvents = 'none';

    // 2. VoltSentry logo begins glowing
    if (logoBolt) logoBolt.classList.add('verifying');

    // 3. EV becomes brighter, lighting transitions to full green energy
    if (window.gsap) {
      gsap.to(underglowLight, { intensity: 10, distance: 8, duration: 1.2 });
      gsap.to(emissiveGreenMat, { emissiveIntensity: 6.0, duration: 1.2 });
      gsap.to(headlightsMat, { emissiveIntensity: 6.0, duration: 1.2 });

      // 4. Energy particles start forming field around vehicle
      gsap.to(batteryFieldProgress, {
        value: 1.0,
        duration: 1.4,
        ease: 'power2.inOut'
      });

      // 5. Vehicle executes 180° rotation
      const currentRot = vehicleGroup.rotation.y;
      gsap.to(vehicleGroup.rotation, {
        y: currentRot + Math.PI,
        duration: 1.8,
        ease: 'power3.inOut'
      });

      // 6. Transition vehicle into holographic 3D wireframe
      if (vehicleBodyWireframe) {
        vehicleBodyWireframe.visible = true;
        vehicleBodyWireframe.children.forEach((mesh) => {
          gsap.to(mesh.material, { opacity: 0.85, duration: 1.2, delay: 0.3 });
        });
      }

      // Fade out physical surfaces
      gsap.to(bodyPaintMat, { opacity: 0.1, transparent: true, duration: 1.0, delay: 0.3 });
      gsap.to(windshieldMat, { opacity: 0.05, transparent: true, duration: 1.0, delay: 0.3 });
      gsap.to(chromeMat, { opacity: 0.1, transparent: true, duration: 1.0, delay: 0.3 });
      gsap.to(wheelMat, { opacity: 0.1, transparent: true, duration: 1.0, delay: 0.3 });

      // Explode and dissolve trailing shards
      shardsGroup.forEach((shard) => {
        gsap.to(shard.position, {
          x: shard.position.x + (Math.random() - 0.5) * 1.6,
          y: shard.position.y + (Math.random() - 0.2) * 1.3,
          z: shard.position.z - 2.0 - Math.random() * 2.0,
          duration: 1.5,
          ease: 'power2.out'
        });
        gsap.to(shard.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.2,
          delay: 0.3,
          ease: 'power2.in'
        });
      });

      // Pulse particle field
      gsap.to(particles.material, {
        size: 0.08,
        opacity: 1.0,
        duration: 1.0,
        ease: 'bounce.out'
      });

      // 7. Sweep passes screen, card disappears, dashboard fades in
      const tl = gsap.timeline({ delay: 1.3 });

      tl.to(sweepOverlay, {
        x: '100%',
        duration: 1.1,
        ease: 'power2.inOut'
      })
      .to(loginCard, {
        opacity: 0,
        y: -60,
        duration: 0.6,
        ease: 'power3.in'
      }, "-=0.7")
      .to(container.parentElement, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'power3.in'
      }, "-=0.6")
      .to(document.body, {
        backgroundColor: '#040704',
        duration: 0.5,
        onComplete: () => {
          window.location.href = 'index.html';
        }
      }, "-=0.2");

    } else {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    }
  }

  // Intercept form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      triggerCinematicTransition();
    });
  }

  // Window Resize
  window.addEventListener('resize', () => {
    if (!camera || !renderer || !container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Start Three.js Engine
  initThree();
});
