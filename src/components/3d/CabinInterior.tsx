import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CabinInteriorProps {
  visible: boolean;
}

export function CabinInterior({ visible }: CabinInteriorProps) {
  const materials = useMemo(() => {
    // Connolly cream leather seats
    const leather = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F3EDE2'),
      roughness: 0.75,
      metalness: 0.05,
    });

    // Dark burled walnut veneer for executive tables
    const walnut = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3A231A'),
      roughness: 0.35,
      metalness: 0.1,
    });

    // Plush wool carpet floor runner
    const carpet = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4A4E54'),
      roughness: 0.95,
      metalness: 0.0,
    });

    // Brushed champagne gold / metallic accents
    const goldAccent = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      roughness: 0.25,
      metalness: 0.85,
    });

    // Warm ambient LED ceiling/floor strip glow
    const warmLight = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFF5E6'),
    });

    // Crystal champagne glassware
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      transmission: 0.9,
      opacity: 0.6,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
    });

    return { leather, walnut, carpet, goldAccent, warmLight, glass };
  }, []);

  if (!visible) return null;

  return (
    <group position={[0, -0.15, 0]}>
      {/* 1. Cabin Floor & Carpet */}
      <mesh material={materials.carpet} position={[0, -0.65, 0]}>
        <boxGeometry args={[1.5, 0.08, 6.2]} />
      </mesh>

      {/* 2. Executive Club Chairs (Facing pairs: Z: -1.6, -0.4 and Z: 0.8, 2.0) */}
      {[
        { x: -0.42, z: -1.4, rotY: 0 },
        { x: -0.42, z: -0.2, rotY: Math.PI },
        { x: 0.42, z: -1.4, rotY: 0 },
        { x: 0.42, z: -0.2, rotY: Math.PI },
        { x: -0.42, z: 1.0, rotY: 0 },
        { x: -0.42, z: 2.2, rotY: Math.PI },
        { x: 0.42, z: 1.0, rotY: 0 },
        { x: 0.42, z: 2.2, rotY: Math.PI },
      ].map((seat, index) => (
        <group
          key={`seat-${index}`}
          position={[seat.x, -0.4, seat.z]}
          rotation={[0, seat.rotY, 0]}
        >
          {/* Seat base cushion */}
          <mesh material={materials.leather} position={[0, 0, 0]}>
            <boxGeometry args={[0.38, 0.14, 0.42]} />
          </mesh>
          {/* Ergonomic seat backrest */}
          <mesh material={materials.leather} position={[0, 0.32, -0.18]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.38, 0.5, 0.12]} />
          </mesh>
          {/* Headrest */}
          <mesh material={materials.leather} position={[0, 0.64, -0.22]}>
            <boxGeometry args={[0.3, 0.16, 0.12]} />
          </mesh>
          {/* Armrests */}
          <mesh material={materials.leather} position={[-0.22, 0.18, -0.04]}>
            <boxGeometry args={[0.07, 0.22, 0.36]} />
          </mesh>
          <mesh material={materials.leather} position={[0.22, 0.18, -0.04]}>
            <boxGeometry args={[0.07, 0.22, 0.36]} />
          </mesh>
          {/* Metallic swivel base pedestal */}
          <mesh material={materials.goldAccent} position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.16, 16]} />
          </mesh>
        </group>
      ))}

      {/* 3. Executive Fold-Out Tables */}
      {/* Left Pair Table */}
      <group position={[-0.42, -0.22, -0.8]}>
        <mesh material={materials.walnut}>
          <boxGeometry args={[0.34, 0.04, 0.52]} />
        </mesh>
        <mesh material={materials.goldAccent} position={[0, 0.025, 0]}>
          <boxGeometry args={[0.32, 0.01, 0.01]} />
        </mesh>
        {/* Champagne Flute */}
        <mesh material={materials.glass} position={[0.05, 0.08, 0.06]}>
          <cylinderGeometry args={[0.025, 0.015, 0.12, 12]} />
        </mesh>
      </group>

      {/* Right Pair Table */}
      <group position={[0.42, -0.22, -0.8]}>
        <mesh material={materials.walnut}>
          <boxGeometry args={[0.34, 0.04, 0.52]} />
        </mesh>
        <mesh material={materials.goldAccent} position={[0, 0.025, 0]}>
          <boxGeometry args={[0.32, 0.01, 0.01]} />
        </mesh>
      </group>

      {/* Forward Cabin Bulkhead partition */}
      <mesh material={materials.walnut} position={[0, -0.05, 3.1]}>
        <boxGeometry args={[1.5, 1.2, 0.06]} />
      </mesh>
      {/* Aft Cabin Bulkhead partition */}
      <mesh material={materials.walnut} position={[0, -0.05, -3.1]}>
        <boxGeometry args={[1.5, 1.2, 0.06]} />
      </mesh>

      {/* 4. Warm Ambient LED Lighting Strips (ceiling & baseline) */}
      <mesh material={materials.warmLight} position={[0, 0.65, 0]}>
        <boxGeometry args={[0.1, 0.02, 5.8]} />
      </mesh>
      <mesh material={materials.warmLight} position={[-0.68, -0.62, 0]}>
        <boxGeometry args={[0.04, 0.02, 5.8]} />
      </mesh>
      <mesh material={materials.warmLight} position={[0.68, -0.62, 0]}>
        <boxGeometry args={[0.04, 0.02, 5.8]} />
      </mesh>

      {/* Interior Ambient Point Lights */}
      <pointLight color="#FFE9CE" intensity={1.8} distance={3.5} position={[0, 0.4, -0.8]} />
      <pointLight color="#FFE9CE" intensity={1.8} distance={3.5} position={[0, 0.4, 1.6]} />
    </group>
  );
}
