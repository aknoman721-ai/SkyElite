import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, Html } from '@react-three/drei';
import { CabinInterior } from './CabinInterior';

interface JetModelProps {
  scrollProgress: number; // 0 to 1
  fuselageOpacity?: number;
  enginePower?: number;
  reducedMotion?: boolean;
}

// Compute explode value from scroll progress
// Phase A (0.18 - 0.24): 0
// Phase B (0.24 - 0.32): smoothly ramps 0 -> 1, holds at peak
// Phase C (0.32 - 0.38): smoothly reassembles 1 -> 0
function getExplodeProgress(p: number): number {
  if (p < 0.24 || p > 0.38) return 0;
  if (p >= 0.27 && p <= 0.32) return 1.0;
  if (p < 0.27) {
    const t = (p - 0.24) / 0.03;
    return t * t * (3 - 2 * t);
  }
  // p > 0.32 to 0.38
  const t = (0.38 - p) / 0.06;
  return t * t * (3 - 2 * t);
}

// =========================================================================
// TUNABLE NOSE & COCKPIT CONFIGURATION (Matches Reference Photo)
// =========================================================================
export const NOSE_CONFIG = {
  // 1. Nose Length & Joint
  fuselageJointZ: 4.25,          // Seamless joint with fuselage cylinder (radius 0.950)
  fuselageRadius: 0.950,         // Matches fuselage cylinder radius exactly
  noseTipZ: 7.45,                // Total nose tip coordinate along +Z (blunt, rounded ogive)

  // 2. Aerodynamic Droop & Loft
  noseDroop: 0.16,               // Downward droop of nose tip (0.10 to 0.22)
  bellyFlattening: 0.10,         // Subtle flattening factor of lower fuselage belly
  crownRise: 0.055,              // Cockpit roof crown lift factor above windshield

  // 3. Radome Cap (Weather radar dome at the tip)
  radomeSeamZ: 6.95,             // Position where circular radome seam ring sits
  radomeColor: '#14171C',        // Matte-satin dark graphite (#14171C)
  radomeRoughness: 0.35,         // Satin sheen to contrast with high-gloss fuselage body
  radomeMetalness: 0.25,         // Metallic factor for radome composite

  // 4. Cockpit Windshield & Windows
  windowFrameThickness: 0.016,   // Outer bezel border depth/thickness
  bezelColor: '#16191E',         // Dark-bronze/black frame bezel color
  bezelRoughness: 0.45,          // Bezel finish roughness
  reflectionStrength: 2.4,       // envMapIntensity for mirror cloud reflections on glass

  // 5. Exterior Paint & Highlights
  paintRoughness: 0.12,          // Glossy obsidian body roughness
  paintClearcoatRoughness: 0.05, // Ultra-slick mirror clearcoat roughness (spec: 0.05)
  paintMetalness: 0.85,          // Metallic sheen (spec: 0.85)
  paintEnvMapIntensity: 2.0,     // Paint cloud reflection intensity
  rimHighlightIntensity: 1.5,    // Crisp top ridge highlight line intensity
};

// Procedural high-fidelity luxury jet with exploded-view support
function ProceduralJet({
  fuselageOpacity = 1,
  enginePower = 1,
  scrollProgress,
}: {
  fuselageOpacity: number;
  enginePower: number;
  scrollProgress: number;
}) {
  const jetGroup = useRef<THREE.Group>(null);

  // Group refs for exploded components
  const noseRef = useRef<THREE.Group>(null);
  const fuselageRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightEngineRef = useRef<THREE.Group>(null);
  const leftEngineRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  const leftExhaust = useRef<THREE.Mesh>(null);
  const rightExhaust = useRef<THREE.Mesh>(null);

  // Materials
  const materials = useMemo(() => {
    // Glossy obsidian black paint for exterior (clearcoat 1.0, clearcoatRoughness 0.05, metalness 0.85)
    const paint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0A0C10'),
      metalness: NOSE_CONFIG.paintMetalness,
      roughness: NOSE_CONFIG.paintRoughness,
      clearcoat: 1.0,
      clearcoatRoughness: NOSE_CONFIG.paintClearcoatRoughness,
      reflectivity: 0.95,
      envMapIntensity: NOSE_CONFIG.paintEnvMapIntensity,
      transparent: true,
      opacity: fuselageOpacity,
      side: THREE.DoubleSide,
      depthWrite: fuselageOpacity > 0.4,
    });

    // Brushed titanium / chrome accents
    const chrome = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D8DEE4'),
      metalness: 0.95,
      roughness: 0.18,
      transparent: true,
      opacity: fuselageOpacity,
    });

    // Dark tinted cabin window glass
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#10141A'),
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.8,
      transparent: true,
      opacity: Math.max(0.2, fuselageOpacity * 0.9),
      ior: 1.5,
    });

    // Glowing fiery amber turbine intake & exhaust
    const exhaustGlow = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF7700'),
      transparent: true,
      opacity: 0.95,
    });

    const turbineIntakeGlow = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFAA1D'),
      transparent: true,
      opacity: 0.95,
    });

    const turbineCoreWhite = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFF5D0'),
    });

    // Illuminated cabin oval window glass
    const windowIlluminated = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FAF8F5'),
    });

    // Matte dark graphite for weather-radar radome (#14171C, roughness 0.35)
    const radome = new THREE.MeshStandardMaterial({
      color: new THREE.Color(NOSE_CONFIG.radomeColor),
      roughness: NOSE_CONFIG.radomeRoughness,
      metalness: NOSE_CONFIG.radomeMetalness,
      transparent: true,
      opacity: fuselageOpacity,
    });

    // Curved cockpit windshield glass (dark smoky tint mirroring clouds)
    const cockpitGlass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#080D14'),
      metalness: 0.25,
      roughness: 0.02,
      transmission: 0.65,
      transparent: true,
      opacity: Math.max(0.35, fuselageOpacity * 0.95),
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
      envMapIntensity: NOSE_CONFIG.reflectionStrength,
      ior: 1.55,
    });

    // Dark-bronze / black window bezel frame
    const bezelBronze = new THREE.MeshStandardMaterial({
      color: new THREE.Color(NOSE_CONFIG.bezelColor),
      roughness: NOSE_CONFIG.bezelRoughness,
      metalness: 0.45,
      transparent: true,
      opacity: fuselageOpacity,
    });

    // Dark rubber gasket & windshield frame
    const frameRubber = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0B0D10'),
      roughness: 0.85,
      metalness: 0.1,
      transparent: true,
      opacity: fuselageOpacity,
    });

    // Brushed titanium windshield pillar and pitot tubes
    const titanium = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94A3B8'),
      metalness: 0.85,
      roughness: 0.22,
      transparent: true,
      opacity: fuselageOpacity,
    });

    // Subtle dark panel line
    const panelLine = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#06080B'),
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: fuselageOpacity * 0.85,
    });

    // Vent louvres recessed backing plate and slats
    const louvreDark = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0D0F14'),
      roughness: 0.6,
      metalness: 0.35,
      transparent: true,
      opacity: fuselageOpacity,
    });

    // Subtle wingtip beacons
    const beaconRed = new THREE.MeshBasicMaterial({ color: '#EF4444' });
    const beaconGreen = new THREE.MeshBasicMaterial({ color: '#10B981' });
    const beaconWhite = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });

    return {
      paint,
      chrome,
      glass,
      radome,
      cockpitGlass,
      bezelBronze,
      louvreDark,
      frameRubber,
      titanium,
      panelLine,
      exhaustGlow,
      turbineIntakeGlow,
      turbineCoreWhite,
      windowIlluminated,
      beaconRed,
      beaconGreen,
      beaconWhite,
    };
  }, [fuselageOpacity]);

  // Current explosion amount (0 to 1)
  const currentExplode = useRef(0);

  // Dynamic animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const targetExplode = getExplodeProgress(scrollProgress);

    // Smoothly lerp explode state
    currentExplode.current = THREE.MathUtils.lerp(
      currentExplode.current,
      targetExplode,
      Math.min(1, delta * 8)
    );

    const exp = currentExplode.current;

    // 1. Nose & Cockpit slides forward (+Z)
    if (noseRef.current) {
      noseRef.current.position.set(0, exp * 0.25, exp * 1.8);
    }

    // 2. Main Fuselage stays centered
    if (fuselageRef.current) {
      fuselageRef.current.position.set(0, 0, 0);
    }

    // 3. Right Wing slides outward (+X) and slightly back (-Z)
    if (rightWingRef.current) {
      rightWingRef.current.position.set(0.7 + exp * 1.5, -0.25, 0.6 - exp * 0.3);
    }

    // 4. Left Wing slides outward (-X) and slightly back (-Z)
    if (leftWingRef.current) {
      leftWingRef.current.position.set(-0.7 - exp * 1.5, -0.25, 0.6 - exp * 0.3);
    }

    // 5. Right Engine moves outward (+X), up (+Y), and back (-Z)
    if (rightEngineRef.current) {
      rightEngineRef.current.position.set(1.4 + exp * 0.9, 0.3 + exp * 0.2, -3.4 - exp * 0.8);
    }

    // 6. Left Engine moves outward (-X), up (+Y), and back (-Z)
    if (leftEngineRef.current) {
      leftEngineRef.current.position.set(-1.4 - exp * 0.9, 0.3 + exp * 0.2, -3.4 - exp * 0.8);
    }

    // 7. Empennage (Tail) moves up (+Y) and back (-Z)
    if (tailRef.current) {
      tailRef.current.position.set(0, 1.2 + exp * 0.9, -5.6 - exp * 1.5);
    }

    // Flight wobble (diminished during exploded inspection)
    if (jetGroup.current) {
      const isComfort = scrollProgress >= 0.55 && scrollProgress <= 0.75;
      const isExploded = scrollProgress >= 0.22 && scrollProgress <= 0.35;
      const wobbleFactor = isComfort || isExploded ? 0.001 : 0.008;

      jetGroup.current.position.y += Math.sin(time * 1.5) * wobbleFactor;
      jetGroup.current.rotation.z += Math.sin(time * 0.8) * (wobbleFactor * 0.5);
    }

    // Engine exhaust flicker
    if (leftExhaust.current && rightExhaust.current) {
      const pulse = 0.75 + Math.sin(time * 12) * 0.15 * enginePower;
      leftExhaust.current.scale.set(1, 1, pulse);
      rightExhaust.current.scale.set(1, 1, pulse);
    }
  });

  // Wing geometry
  const wingShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1.8, -0.6);
    shape.lineTo(6.8, -3.2);
    shape.lineTo(6.8, -2.8);
    shape.lineTo(0, 2.2);
    shape.closePath();
    return shape;
  }, []);

  const wingExtrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 2,
  }), []);

  // Realistic business-jet ogive nose, radome, and cockpit geometries matching reference photo
  const { noseGeometry, radomeGeometry, windowGeometries, louvreSlats } = useMemo(() => {
    // 1. Mobile-friendly radial segments (< 15k triangles)
    const radialSegments = typeof window !== 'undefined' && window.innerWidth < 768 ? 48 : 72;

    // 2. Main Nose Cone Spline (Z = 4.25 -> 6.95)
    // Starts at exact fuselage cylinder radius 0.950 at Z = 4.25 with zero tangent slope
    const NOSE_SPLINE = [
      new THREE.Vector2(0.950, 4.25),
      new THREE.Vector2(0.948, 4.55),
      new THREE.Vector2(0.940, 4.90),
      new THREE.Vector2(0.922, 5.30),
      new THREE.Vector2(0.888, 5.75),
      new THREE.Vector2(0.832, 6.20),
      new THREE.Vector2(0.748, 6.60),
      new THREE.Vector2(0.670, 6.82),
      new THREE.Vector2(0.585, NOSE_CONFIG.radomeSeamZ),
    ];

    // 3. Radome Cap Spline (Z = 6.95 -> 7.45)
    // Full, blunt, bulbous dome tip matching the photo (not a sharp needle)
    const RADOME_SPLINE = [
      new THREE.Vector2(0.585, NOSE_CONFIG.radomeSeamZ),
      new THREE.Vector2(0.520, 7.08),
      new THREE.Vector2(0.425, 7.20),
      new THREE.Vector2(0.300, 7.32),
      new THREE.Vector2(0.150, 7.41),
      new THREE.Vector2(0.000, NOSE_CONFIG.noseTipZ), // Closed tip
    ];

    const noseCurve = new THREE.SplineCurve(NOSE_SPLINE);
    const nosePoints = noseCurve.getPoints(24);

    const radomeCurve = new THREE.SplineCurve(RADOME_SPLINE);
    const radomePoints = radomeCurve.getPoints(16);

    const noseGeom = new THREE.LatheGeometry(nosePoints, radialSegments);
    noseGeom.rotateX(Math.PI / 2);

    const radomeGeom = new THREE.LatheGeometry(radomePoints, radialSegments);
    radomeGeom.rotateX(Math.PI / 2);

    // Deform vertices for authentic business jet loft (droop, belly flattening, cockpit crown)
    const Z_START = NOSE_CONFIG.fuselageJointZ;
    const TOTAL_LEN = NOSE_CONFIG.noseTipZ - Z_START;

    const deformNoseLoft = (geometry: THREE.BufferGeometry) => {
      const pos = geometry.attributes.position;
      const v = new THREE.Vector3();

      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const t = Math.max(0, Math.min(1, (v.z - Z_START) / TOTAL_LEN));

        // Downward aerodynamic droop
        const droop = NOSE_CONFIG.noseDroop * Math.pow(t, 1.7);
        v.y -= droop;

        // Flatten underside belly slightly
        if (v.y < 0) {
          v.y *= (1 - NOSE_CONFIG.bellyFlattening * Math.sin(t * Math.PI * 0.85));
        }

        // Top crown rises smoothly into windshield area
        if (v.y > 0.1 && v.z >= 4.3 && v.z <= 5.8) {
          const crownT = Math.sin(((v.z - 4.3) / 1.5) * Math.PI);
          v.y += NOSE_CONFIG.crownRise * crownT * Math.pow(Math.max(0, v.y / 0.95), 1.5);
        }

        pos.setXYZ(i, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();
    };

    deformNoseLoft(noseGeom);
    deformNoseLoft(radomeGeom);

    // 4. Cockpit Window Shapes & Extrusions (Front Windshield + 2 Side Windows)
    const makeRoundedTrapezoid = (wBottom: number, wTop: number, h: number, r: number) => {
      const s = new THREE.Shape();
      const hb = wBottom / 2;
      const ht = wTop / 2;
      const hh = h / 2;
      s.moveTo(-hb + r, -hh);
      s.lineTo(hb - r, -hh);
      s.quadraticCurveTo(hb, -hh, hb, -hh + r);
      s.lineTo(ht, hh - r);
      s.quadraticCurveTo(ht, hh, ht - r, hh);
      s.lineTo(-ht + r, hh);
      s.quadraticCurveTo(-ht, hh, -ht, hh - r);
      s.lineTo(-hb, -hh + r);
      s.quadraticCurveTo(-hb, -hh, -hb + r, -hh);
      return s;
    };

    const makeRoundedRect = (w: number, h: number, r: number) => {
      const s = new THREE.Shape();
      const hw = w / 2;
      const hh = h / 2;
      s.moveTo(-hw + r, -hh);
      s.lineTo(hw - r, -hh);
      s.quadraticCurveTo(hw, -hh, hw, -hh + r);
      s.lineTo(hw, hh - r);
      s.quadraticCurveTo(hw, hh, hw - r, hh);
      s.lineTo(-hw + r, hh);
      s.quadraticCurveTo(-hw, hh, -hw, hh - r);
      s.lineTo(-hw, -hh + r);
      s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      return s;
    };

    const bezelSettings: THREE.ExtrudeGeometryOptions = {
      depth: NOSE_CONFIG.windowFrameThickness,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
    };

    const glassSettings: THREE.ExtrudeGeometryOptions = {
      depth: NOSE_CONFIG.windowFrameThickness * 0.75,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    };

    // Front Windshield (Swept-back rounded trapezoid)
    const frontBezelShape = makeRoundedTrapezoid(0.48, 0.38, 0.38, 0.045);
    const frontGlassShape = makeRoundedTrapezoid(0.42, 0.33, 0.33, 0.035);

    // Side Window 1 (Forward side window - tall, slight wedge)
    const side1BezelShape = makeRoundedTrapezoid(0.26, 0.23, 0.36, 0.035);
    const side1GlassShape = makeRoundedTrapezoid(0.21, 0.18, 0.31, 0.025);

    // Side Window 2 (Aft side window - tall rounded rectangle)
    const side2BezelShape = makeRoundedRect(0.24, 0.34, 0.035);
    const side2GlassShape = makeRoundedRect(0.19, 0.29, 0.025);

    // 5. Precomputed louvre slat offsets (row of 9 slats)
    const slats = [-0.10, -0.075, -0.05, -0.025, 0, 0.025, 0.05, 0.075, 0.10];

    return {
      noseGeometry: noseGeom,
      radomeGeometry: radomeGeom,
      windowGeometries: {
        frontBezelGeom: new THREE.ExtrudeGeometry(frontBezelShape, bezelSettings),
        frontGlassGeom: new THREE.ExtrudeGeometry(frontGlassShape, glassSettings),
        side1BezelGeom: new THREE.ExtrudeGeometry(side1BezelShape, bezelSettings),
        side1GlassGeom: new THREE.ExtrudeGeometry(side1GlassShape, glassSettings),
        side2BezelGeom: new THREE.ExtrudeGeometry(side2BezelShape, bezelSettings),
        side2GlassGeom: new THREE.ExtrudeGeometry(side2GlassShape, glassSettings),
      },
      louvreSlats: slats,
    };
  }, []);

  const explodeVal = getExplodeProgress(scrollProgress);
  const labelsVisible = explodeVal > 0.35;
  const labelOpacity = Math.max(0, Math.min(1, (explodeVal - 0.35) / 0.35));

  return (
    <group ref={jetGroup}>
      {/* Soft Contact Shadow beneath Jet */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshBasicMaterial
          color="#A8B2C0"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* 1. NOSE & COCKPIT GROUP (Matches Reference Photo) */}
      <group ref={noseRef}>
        {/* Crisp rim highlight line along top ridge of nose & cockpit */}
        <directionalLight
          position={[0, 6, 2]}
          intensity={NOSE_CONFIG.rimHighlightIntensity}
          color="#EAEFF8"
        />

        {/* Aerodynamic Main Nose Cone (Glossy Obsidian Paint #0A0C10) */}
        <mesh
          geometry={noseGeometry}
          material={materials.paint}
          castShadow
          receiveShadow
        />

        {/* Weather-Radar Radome Cap (Matte-satin dark graphite #14171C) */}
        <mesh
          geometry={radomeGeometry}
          material={materials.radome}
          castShadow
          receiveShadow
        />

        {/* Panel Seam Ring at Fuselage Joint (Z = 4.25, zero gap/seam step) */}
        <mesh
          material={materials.panelLine}
          position={[0, 0, NOSE_CONFIG.fuselageJointZ]}
        >
          <torusGeometry args={[0.952, 0.006, 12, 64]} />
        </mesh>

        {/* Radome Circular Seam Ring (inset dark groove at Z = 6.95) */}
        <mesh
          material={materials.panelLine}
          position={[0, -0.09, NOSE_CONFIG.radomeSeamZ]}
        >
          <torusGeometry args={[0.587, 0.006, 12, 64]} />
        </mesh>

        {/* Faint aerodynamic crease / scratch lines on Radome Cap */}
        <mesh
          material={materials.panelLine}
          position={[-0.10, 0.16, 7.18]}
          rotation={[0.22, -0.16, -0.12]}
        >
          <boxGeometry args={[0.004, 0.004, 0.36]} />
        </mesh>
        <mesh
          material={materials.panelLine}
          position={[0.10, 0.16, 7.18]}
          rotation={[0.22, 0.16, 0.12]}
        >
          <boxGeometry args={[0.004, 0.004, 0.36]} />
        </mesh>

        {/* Cockpit Window Canopy System (Mirroring Cloud Reflections) */}
        <group position={[0, 0, 0]}>
          {/* Front-Left Windshield Pane */}
          <group position={[-0.22, 0.74, 5.12]} rotation={[-0.62, 0.20, -0.12]}>
            <mesh geometry={windowGeometries.frontBezelGeom} material={materials.bezelBronze} castShadow receiveShadow />
            <mesh geometry={windowGeometries.frontGlassGeom} material={materials.cockpitGlass} position={[0, 0, 0.005]} castShadow receiveShadow />
          </group>

          {/* Front-Right Windshield Pane */}
          <group position={[0.22, 0.74, 5.12]} rotation={[-0.62, -0.20, 0.12]}>
            <mesh geometry={windowGeometries.frontBezelGeom} material={materials.bezelBronze} castShadow receiveShadow />
            <mesh geometry={windowGeometries.frontGlassGeom} material={materials.cockpitGlass} position={[0, 0, 0.005]} castShadow receiveShadow />
          </group>

          {/* Center Windshield Divider Post */}
          <mesh
            material={materials.bezelBronze}
            position={[0, 0.75, 5.14]}
            rotation={[-0.62, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.016, 0.016, 0.44, 12]} />
          </mesh>

          {/* Left Side Window 1 (Forward Side Window) */}
          <group position={[-0.56, 0.65, 4.86]} rotation={[-0.32, 0.62, -0.24]}>
            <mesh geometry={windowGeometries.side1BezelGeom} material={materials.bezelBronze} castShadow receiveShadow />
            <mesh geometry={windowGeometries.side1GlassGeom} material={materials.cockpitGlass} position={[0, 0, 0.005]} castShadow receiveShadow />
          </group>

          {/* Right Side Window 1 */}
          <group position={[0.56, 0.65, 4.86]} rotation={[-0.32, -0.62, 0.24]}>
            <mesh geometry={windowGeometries.side1BezelGeom} material={materials.bezelBronze} castShadow receiveShadow />
            <mesh geometry={windowGeometries.side1GlassGeom} material={materials.cockpitGlass} position={[0, 0, 0.005]} castShadow receiveShadow />
          </group>

          {/* Left Side Window 2 (Aft Side Window) */}
          <group position={[-0.74, 0.56, 4.54]} rotation={[-0.15, 0.82, -0.16]}>
            <mesh geometry={windowGeometries.side2BezelGeom} material={materials.bezelBronze} castShadow receiveShadow />
            <mesh geometry={windowGeometries.side2GlassGeom} material={materials.cockpitGlass} position={[0, 0, 0.005]} castShadow receiveShadow />
          </group>

          {/* Right Side Window 2 */}
          <group position={[0.74, 0.56, 4.54]} rotation={[-0.15, -0.82, 0.16]}>
            <mesh geometry={windowGeometries.side2BezelGeom} material={materials.bezelBronze} castShadow receiveShadow />
            <mesh geometry={windowGeometries.side2GlassGeom} material={materials.cockpitGlass} position={[0, 0, 0.005]} castShadow receiveShadow />
          </group>

          {/* Windshield Brow Curved Boundary Line */}
          <mesh
            material={materials.panelLine}
            position={[0, 0.86, 4.90]}
            rotation={[-0.54, 0, 0]}
          >
            <torusGeometry args={[0.48, 0.008, 8, 32, Math.PI]} />
          </mesh>
        </group>

        {/* Recessed Vent Louvre Panel under Windshield (Left Side) */}
        <group position={[-0.74, 0.28, 5.18]} rotation={[0.06, 0.38, -0.06]}>
          {/* Recessed backing plate */}
          <mesh material={materials.louvreDark} position={[0, 0, -0.005]}>
            <boxGeometry args={[0.26, 0.09, 0.012]} />
          </mesh>
          {/* Outer sculpted contour border */}
          <mesh material={materials.panelLine} position={[0, 0, 0]}>
            <boxGeometry args={[0.272, 0.102, 0.004]} />
          </mesh>
          {/* 9 Angled Louvre Slats */}
          {louvreSlats.map((xOff, i) => (
            <mesh
              key={`louvre-l-${i}`}
              material={materials.bezelBronze}
              position={[xOff, 0, 0.004]}
              rotation={[0, 0, -0.38]}
              castShadow
            >
              <boxGeometry args={[0.005, 0.065, 0.008]} />
            </mesh>
          ))}
        </group>

        {/* Recessed Vent Louvre Panel under Windshield (Right Side) */}
        <group position={[0.74, 0.28, 5.18]} rotation={[0.06, -0.38, 0.06]}>
          <mesh material={materials.louvreDark} position={[0, 0, -0.005]}>
            <boxGeometry args={[0.26, 0.09, 0.012]} />
          </mesh>
          <mesh material={materials.panelLine} position={[0, 0, 0]}>
            <boxGeometry args={[0.272, 0.102, 0.004]} />
          </mesh>
          {louvreSlats.map((xOff, i) => (
            <mesh
              key={`louvre-r-${i}`}
              material={materials.bezelBronze}
              position={[xOff, 0, 0.004]}
              rotation={[0, 0, 0.38]}
              castShadow
            >
              <boxGeometry args={[0.005, 0.065, 0.008]} />
            </mesh>
          ))}
        </group>

        {/* Curved Panel Line behind Cockpit Windows wrapping down Fuselage */}
        <mesh
          material={materials.panelLine}
          position={[0, 0.45, 4.40]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.948, 0.005, 8, 48, Math.PI]} />
        </mesh>

        {/* Antenna Bumps on Crown behind Windshield */}
        {/* Forward Antenna Bump */}
        <group position={[0, 0.985, 4.65]} rotation={[-0.05, 0, 0]}>
          <mesh material={materials.frameRubber} position={[0, -0.01, 0]}>
            <boxGeometry args={[0.065, 0.015, 0.20]} />
          </mesh>
          <mesh material={materials.paint} position={[0, 0.005, 0]} castShadow>
            <sphereGeometry args={[0.035, 16, 12]} />
          </mesh>
        </group>

        {/* Aft Antenna Bump */}
        <group position={[0, 0.975, 4.35]} rotation={[-0.02, 0, 0]}>
          <mesh material={materials.frameRubber} position={[0, -0.01, 0]}>
            <boxGeometry args={[0.055, 0.015, 0.16]} />
          </mesh>
          <mesh material={materials.paint} position={[0, 0.005, 0]} castShadow>
            <sphereGeometry args={[0.030, 16, 12]} />
          </mesh>
        </group>

        {/* Dual Pitot Probes (Brushed Titanium) */}
        {/* Left Pitot Probe */}
        <group position={[-0.54, 0.05, 6.35]} rotation={[0, -0.06, 0]}>
          <mesh material={materials.titanium} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.32, 12]} />
          </mesh>
          <mesh material={materials.titanium} position={[0.01, -0.01, -0.08]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.02, 0.035, 0.06]} />
          </mesh>
        </group>

        {/* Right Pitot Probe */}
        <group position={[0.54, 0.05, 6.35]} rotation={[0, 0.06, 0]}>
          <mesh material={materials.titanium} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.32, 12]} />
          </mesh>
          <mesh material={materials.titanium} position={[-0.01, -0.01, -0.08]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.02, 0.035, 0.06]} />
          </mesh>
        </group>

        {/* Angle-of-Attack (AoA) Vane */}
        <mesh
          material={materials.titanium}
          position={[-0.66, -0.10, 5.88]}
          rotation={[0.1, 0, -0.28]}
          castShadow
        >
          <boxGeometry args={[0.012, 0.055, 0.09]} />
        </mesh>

        {/* Navigation / Taxi Lights under windshield */}
        {/* Left light */}
        <group position={[-0.78, 0.24, 4.78]}>
          <mesh material={materials.chrome} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
          </mesh>
          <mesh material={materials.beaconWhite} position={[-0.01, 0, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
          </mesh>
        </group>
        {/* Right light */}
        <group position={[0.78, 0.24, 4.78]}>
          <mesh material={materials.chrome} rotation={[0, -Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
          </mesh>
          <mesh material={materials.beaconWhite} position={[0.01, 0, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
          </mesh>
        </group>

        {/* Nose Landing-Gear Door Outline on Underside */}
        <mesh
          material={materials.panelLine}
          position={[0, -0.84, 5.15]}
          rotation={[0.08, 0, 0]}
        >
          <boxGeometry args={[0.46, 0.012, 1.1]} />
        </mesh>
      </group>

      {/* 2. MAIN FUSELAGE & CABIN GROUP */}
      <group ref={fuselageRef}>
        {/* Center passenger tube */}
        <mesh
          material={materials.paint}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.95, 0.95, 8.5, 32, 1, true]} />
        </mesh>

        {/* Tapered Tail Cone Base */}
        <mesh
          material={materials.paint}
          position={[0, 0.1, -5.4]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.95, 0.28, 2.8, 32, 1, true]} />
        </mesh>

        {/* Cabin Oval Windows (Left & Right rows) */}
        {[-2.2, -1.3, -0.4, 0.5, 1.4, 2.3].map((zPos, idx) => (
          <group key={`windows-${idx}`}>
            {/* Right side window */}
            <mesh
              material={materials.windowIlluminated}
              position={[0.965, 0.15, zPos]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <capsuleGeometry args={[0.13, 0.22, 4, 12]} />
            </mesh>
            <mesh
              material={materials.chrome}
              position={[0.962, 0.15, zPos]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <capsuleGeometry args={[0.145, 0.23, 4, 12]} />
            </mesh>
            {/* Left side window */}
            <mesh
              material={materials.windowIlluminated}
              position={[-0.965, 0.15, zPos]}
              rotation={[0, -Math.PI / 2, 0]}
            >
              <capsuleGeometry args={[0.13, 0.22, 4, 12]} />
            </mesh>
            <mesh
              material={materials.chrome}
              position={[-0.962, 0.15, zPos]}
              rotation={[0, -Math.PI / 2, 0]}
            >
              <capsuleGeometry args={[0.145, 0.23, 4, 12]} />
            </mesh>
          </group>
        ))}

        {/* Cabin Interior */}
        <CabinInterior visible={fuselageOpacity < 0.95} />

        {/* Fuselage Leader Line & Callout */}
        {labelsVisible && (
          <Html position={[0, 1.3, 0]} center distanceFactor={14}>
            <div
              className="pointer-events-none select-none flex flex-col items-center transition-opacity duration-300"
              style={{ opacity: labelOpacity }}
            >
              <div className="text-[11px] font-medium text-gray-800 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full border border-gray-300 shadow-md whitespace-nowrap">
                Acoustic Carbon Fuselage · 48 dB
              </div>
              <div className="w-[1px] h-6 bg-gray-400/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#202A36]" />
            </div>
          </Html>
        )}
      </group>

      {/* 3. RIGHT WING GROUP */}
      <group ref={rightWingRef} position={[0.7, -0.25, 0.6]} rotation={[0.04, 0, -0.06]}>
        <mesh
          material={materials.paint}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <extrudeGeometry args={[wingShape, wingExtrudeSettings]} />
        </mesh>
        {/* Right Winglet */}
        <mesh
          material={materials.paint}
          position={[6.8, 0.5, -3.0]}
          rotation={[0.15, 0, 0.35]}
          castShadow
        >
          <boxGeometry args={[0.08, 1.1, 0.7]} />
        </mesh>
        <mesh material={materials.beaconGreen} position={[6.85, 1.05, -3.0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
        </mesh>

        {/* Wing Callout Label */}
        {labelsVisible && (
          <Html position={[4.2, 0.6, -1.8]} center distanceFactor={14}>
            <div
              className="pointer-events-none select-none flex flex-col items-center transition-opacity duration-300"
              style={{ opacity: labelOpacity }}
            >
              <div className="text-[11px] font-medium text-gray-800 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full border border-gray-300 shadow-md whitespace-nowrap">
                Supercritical Swept Wing · Mach 0.90
              </div>
              <div className="w-[1px] h-6 bg-gray-400/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#202A36]" />
            </div>
          </Html>
        )}
      </group>

      {/* 4. LEFT WING GROUP (mirrored) */}
      <group ref={leftWingRef} position={[-0.7, -0.25, 0.6]} rotation={[0.04, 0, 0.06]} scale={[-1, 1, 1]}>
        <mesh
          material={materials.paint}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <extrudeGeometry args={[wingShape, wingExtrudeSettings]} />
        </mesh>
        {/* Left Winglet */}
        <mesh
          material={materials.paint}
          position={[6.8, 0.5, -3.0]}
          rotation={[0.15, 0, 0.35]}
          castShadow
        >
          <boxGeometry args={[0.08, 1.1, 0.7]} />
        </mesh>
        <mesh material={materials.beaconRed} position={[6.85, 1.05, -3.0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
        </mesh>
      </group>

      {/* 5. RIGHT ENGINE GROUP */}
      <group ref={rightEngineRef} position={[1.4, 0.3, -3.4]}>
        <mesh
          material={materials.paint}
          position={[-0.35, 0, 0]}
          rotation={[0, 0, 0.2]}
        >
          <boxGeometry args={[0.7, 0.15, 1.2]} />
        </mesh>
        <mesh
          material={materials.paint}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.48, 0.44, 2.5, 24]} />
        </mesh>
        <mesh material={materials.chrome} position={[0, 0, 1.25]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.46, 0.06, 12, 24]} />
        </mesh>
        {/* Turbine Glowing Fan Face */}
        <mesh material={materials.turbineIntakeGlow} position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.05, 24]} />
        </mesh>
        <mesh material={materials.turbineCoreWhite} position={[0, 0, 0.95]}>
          <coneGeometry args={[0.14, 0.35, 16]} />
        </mesh>
        <pointLight
          color="#FFAA1D"
          intensity={enginePower * 3.5}
          distance={5}
          position={[0, 0, 1.1]}
        />
        <mesh material={materials.chrome} position={[0, 0, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.42, 0.3, 24]} />
        </mesh>
        <mesh
          ref={rightExhaust}
          material={materials.exhaustGlow}
          position={[0, 0, -1.8]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.34, 1.3, 16]} />
        </mesh>
        <pointLight
          color="#FF7700"
          intensity={enginePower * 4.0}
          distance={6}
          position={[0, 0, -2.0]}
        />

        {/* Engine Callout Label */}
        {labelsVisible && (
          <Html position={[0.4, 0.9, 0]} center distanceFactor={14}>
            <div
              className="pointer-events-none select-none flex flex-col items-center transition-opacity duration-300"
              style={{ opacity: labelOpacity }}
            >
              <div className="text-[11px] font-medium text-gray-800 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full border border-gray-300 shadow-md whitespace-nowrap">
                BR725 Turbofan · 16,900 lbf Thrust
              </div>
              <div className="w-[1px] h-6 bg-gray-400/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#202A36]" />
            </div>
          </Html>
        )}
      </group>

      {/* 6. LEFT ENGINE GROUP */}
      <group ref={leftEngineRef} position={[-1.4, 0.3, -3.4]}>
        <mesh
          material={materials.paint}
          position={[0.35, 0, 0]}
          rotation={[0, 0, -0.2]}
        >
          <boxGeometry args={[0.7, 0.15, 1.2]} />
        </mesh>
        <mesh
          material={materials.paint}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.48, 0.44, 2.5, 24]} />
        </mesh>
        <mesh material={materials.chrome} position={[0, 0, 1.25]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.46, 0.06, 12, 24]} />
        </mesh>
        <mesh material={materials.turbineIntakeGlow} position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.05, 24]} />
        </mesh>
        <mesh material={materials.turbineCoreWhite} position={[0, 0, 0.95]}>
          <coneGeometry args={[0.14, 0.35, 16]} />
        </mesh>
        <pointLight
          color="#FFAA1D"
          intensity={enginePower * 3.5}
          distance={5}
          position={[0, 0, 1.1]}
        />
        <mesh material={materials.chrome} position={[0, 0, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.42, 0.3, 24]} />
        </mesh>
        <mesh
          ref={leftExhaust}
          material={materials.exhaustGlow}
          position={[0, 0, -1.8]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.34, 1.3, 16]} />
        </mesh>
        <pointLight
          color="#FF7700"
          intensity={enginePower * 4.0}
          distance={6}
          position={[0, 0, -2.0]}
        />
      </group>

      {/* 7. EMPENNAGE (TAIL GROUP) */}
      <group ref={tailRef} position={[0, 1.2, -5.6]}>
        <mesh
          material={materials.paint}
          position={[0, 0.8, -0.4]}
          rotation={[0.38, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.12, 2.4, 1.3]} />
        </mesh>
        <mesh material={materials.beaconWhite} position={[0, 2.05, -0.95]}>
          <sphereGeometry args={[0.06, 8, 8]} />
        </mesh>

        {/* T-Tail Horizontal Stabilizers */}
        <group position={[0, 2.0, -0.8]}>
          <mesh material={materials.paint} castShadow>
            <boxGeometry args={[3.8, 0.1, 0.9]} />
          </mesh>
          <mesh material={materials.chrome} position={[0, 0, 0.4]}>
            <boxGeometry args={[3.75, 0.08, 0.12]} />
          </mesh>
        </group>

        {/* Tail Callout Label */}
        {labelsVisible && (
          <Html position={[0, 2.6, -0.8]} center distanceFactor={14}>
            <div
              className="pointer-events-none select-none flex flex-col items-center transition-opacity duration-300"
              style={{ opacity: labelOpacity }}
            >
              <div className="text-[11px] font-medium text-gray-800 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full border border-gray-300 shadow-md whitespace-nowrap">
                High-Authority Swept T-Tail
              </div>
              <div className="w-[1px] h-6 bg-gray-400/70" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#202A36]" />
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// User-supplied GLB loader with automatic fallback to ProceduralJet
function ExternalGLTFJet({
  modelUrl,
  fuselageOpacity,
  enginePower,
  scrollProgress,
}: {
  modelUrl: string;
  fuselageOpacity: number;
  enginePower: number;
  scrollProgress: number;
}) {
  const gltf = useGLTF(modelUrl);
  const clonedScene = useMemo(() => {
    const scene = gltf.scene.clone();
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.transparent = true;
          mat.opacity = fuselageOpacity;
        }
      }
    });
    return scene;
  }, [gltf, fuselageOpacity]);

  return (
    <group scale={1.8}>
      <primitive object={clonedScene} />
      <CabinInterior visible={fuselageOpacity < 0.95} />
    </group>
  );
}

export function JetModel({
  scrollProgress,
  fuselageOpacity = 1,
  enginePower = 1,
  reducedMotion = false,
}: JetModelProps) {
  const [hasExternalModel, setHasExternalModel] = useState<boolean>(false);
  const modelPath = '/models/jet.glb';

  useEffect(() => {
    fetch(modelPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok && res.headers.get('content-type')?.includes('model')) {
          setHasExternalModel(true);
        } else {
          setHasExternalModel(false);
        }
      })
      .catch(() => {
        setHasExternalModel(false);
      });
  }, []);

  return (
    <group>
      {hasExternalModel ? (
        <ExternalGLTFJet
          modelUrl={modelPath}
          fuselageOpacity={fuselageOpacity}
          enginePower={enginePower}
          scrollProgress={scrollProgress}
        />
      ) : (
        <ProceduralJet
          fuselageOpacity={fuselageOpacity}
          enginePower={enginePower}
          scrollProgress={scrollProgress}
        />
      )}
    </group>
  );
}
