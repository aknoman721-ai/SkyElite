import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CloudsProps {
  reducedMotion?: boolean;
}

interface CloudPuffData {
  position: [number, number, number];
  scale: [number, number, number];
  rotationZ: number;
  driftSpeed: number;
}

export function Clouds({ reducedMotion = false }: CloudsProps) {
  const cloudsGroup = useRef<THREE.Group>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Organic cumulus cloud puffs matching the hero start page
  const puffs = useMemo<CloudPuffData[]>(() => {
    const list: CloudPuffData[] = [
      // Upper background cloud bank
      { position: [-6, 3.5, -9], scale: [5.5, 4.0, 3.5], rotationZ: 0.1, driftSpeed: 0.04 },
      { position: [-2, 4.2, -8], scale: [6.0, 4.5, 4.0], rotationZ: -0.05, driftSpeed: 0.05 },
      { position: [4, 3.8, -10], scale: [7.0, 5.0, 4.5], rotationZ: 0.08, driftSpeed: 0.03 },
      { position: [9, 4.5, -9], scale: [6.2, 4.2, 3.8], rotationZ: -0.1, driftSpeed: 0.04 },

      // Midground clouds behind jet
      { position: [-8, 0.5, -6], scale: [4.8, 3.2, 3.0], rotationZ: 0.05, driftSpeed: 0.06 },
      { position: [-4, -0.8, -5], scale: [4.2, 2.8, 2.5], rotationZ: -0.08, driftSpeed: 0.07 },
      { position: [2, 1.2, -6], scale: [5.2, 3.6, 3.2], rotationZ: 0.12, driftSpeed: 0.05 },
      { position: [7, -0.5, -5.5], scale: [4.5, 3.0, 2.8], rotationZ: -0.05, driftSpeed: 0.06 },

      // Lower horizon puffs
      { position: [-5, -3.5, -7], scale: [7.5, 3.8, 4.0], rotationZ: 0.02, driftSpeed: 0.05 },
      { position: [1, -4.0, -8], scale: [8.0, 4.2, 4.5], rotationZ: -0.04, driftSpeed: 0.04 },
      { position: [6, -3.8, -7], scale: [7.2, 3.6, 3.8], rotationZ: 0.06, driftSpeed: 0.05 },
    ];
    return isMobile ? list.slice(2, 8) : list;
  }, [isMobile]);

  // Pure soft white cumulus cloud material (same as start page)
  const cloudMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFFFFF'),
      roughness: 0.98,
      metalness: 0.0,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
  }, []);

  useFrame((state, delta) => {
    if (reducedMotion || !cloudsGroup.current) return;

    // Drifting slowly to the left
    cloudsGroup.current.children.forEach((child, idx) => {
      const speed = puffs[idx]?.driftSpeed || 0.05;
      child.position.x -= delta * speed * 2.5;

      if (child.position.x < -18) {
        child.position.x = 18;
      }
    });
  });

  return (
    <group ref={cloudsGroup}>
      {puffs.map((puff, idx) => (
        <mesh
          key={`cloud-puff-${idx}`}
          material={cloudMaterial}
          position={puff.position}
          scale={puff.scale}
          rotation={[0, 0, puff.rotationZ]}
        >
          <sphereGeometry args={[1, 20, 20]} />
        </mesh>
      ))}
    </group>
  );
}
