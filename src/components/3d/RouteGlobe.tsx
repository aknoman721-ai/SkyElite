import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RouteGlobeProps {
  scrollProgress: number; // 0 to 1
  opacity: number;
}

interface CityHub {
  name: string;
  code: string;
  lat: number;
  lng: number;
}

const HUBS: CityHub[] = [
  { name: 'New York (TEB)', code: 'KTEB', lat: 40.85, lng: -74.06 },
  { name: 'London (FAB)', code: 'EGLF', lat: 51.27, lng: -0.77 },
  { name: 'Geneva (GVA)', code: 'LSGG', lat: 46.23, lng: 6.10 },
  { name: 'Dubai (DWC)', code: 'OMDW', lat: 24.89, lng: 55.16 },
  { name: 'Tokyo (HND)', code: 'RJTT', lat: 35.54, lng: 139.77 },
  { name: 'Los Angeles (VNY)', code: 'KVNY', lat: 34.20, lng: -118.48 },
  { name: 'Miami (OPF)', code: 'KOPF', lat: 25.90, lng: -80.27 },
  { name: 'Paris (LBG)', code: 'LFPB', lat: 48.96, lng: 2.44 },
];

const FLIGHT_PAIRS: [number, number][] = [
  [0, 1], // NY -> London
  [1, 2], // London -> Geneva
  [2, 3], // Geneva -> Dubai
  [3, 4], // Dubai -> Tokyo
  [5, 0], // LA -> NY
  [5, 6], // LA -> Miami
  [6, 0], // Miami -> NY
  [1, 7], // London -> Paris
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function RouteGlobe({ opacity }: RouteGlobeProps) {
  const globeGroup = useRef<THREE.Group>(null);
  const pulseGroup = useRef<THREE.Group>(null);
  const globeRadius = 3.6;

  // Convert hubs to 3D positions
  const hubPositions = useMemo(() => {
    return HUBS.map((h) => latLngToVector3(h.lat, h.lng, globeRadius));
  }, [globeRadius]);

  // Construct curved 3D flight arcs
  const flightCurves = useMemo(() => {
    return FLIGHT_PAIRS.map(([fromIdx, toIdx]) => {
      const vFrom = hubPositions[fromIdx];
      const vTo = hubPositions[toIdx];

      // Midpoint elevated above surface for flight arc
      const mid = new THREE.Vector3().addVectors(vFrom, vTo).multiplyScalar(0.5);
      const distance = vFrom.distanceTo(vTo);
      const arcHeight = Math.min(1.4, Math.max(0.4, distance * 0.25));
      mid.normalize().multiplyScalar(globeRadius + arcHeight);

      const curve = new THREE.QuadraticBezierCurve3(vFrom, mid, vTo);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color('#202A36'),
        transparent: true,
        opacity: Math.max(0.01, opacity * 0.65),
      });
      const lineObj = new THREE.Line(geometry, material);
      return { geometry, curve, material, lineObj };
    });
  }, [hubPositions, globeRadius, opacity]);

  // Slow planetary rotation
  useFrame((state, delta) => {
    if (globeGroup.current) {
      globeGroup.current.rotation.y += delta * 0.08;
    }
  });

  if (opacity <= 0.01) return null;

  return (
    <group
      ref={globeGroup}
      position={[0, -4.8, -1.0]}
      rotation={[0.3, 0.4, -0.1]}
    >
      {/* 1. Core Sphere (frosted cloud-grey) */}
      <mesh>
        <sphereGeometry args={[globeRadius, 48, 48]} />
        <meshStandardMaterial
          color="#D2D7DE"
          roughness={0.7}
          metalness={0.1}
          transparent
          opacity={opacity * 0.55}
          wireframe={false}
        />
      </mesh>

      {/* 2. Latitude & Longitude Meridian Rings */}
      {[-2, -1, 0, 1, 2].map((latStep) => (
        <mesh
          key={`lat-${latStep}`}
          position={[0, latStep * 1.0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              Math.sqrt(Math.max(0, globeRadius * globeRadius - Math.pow(latStep * 1.0, 2))) - 0.02,
              Math.sqrt(Math.max(0, globeRadius * globeRadius - Math.pow(latStep * 1.0, 2))) + 0.02,
              64,
            ]}
          />
          <meshBasicMaterial
            color="#202A36"
            transparent
            opacity={opacity * 0.18}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* 3. City Hub Nodes */}
      {hubPositions.map((pos, idx) => (
        <group key={`hub-${idx}`} position={pos}>
          {/* Beacon dot */}
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#202A36" transparent opacity={opacity * 0.9} />
          </mesh>
          {/* Beacon halo */}
          <mesh>
            <ringGeometry args={[0.1, 0.14, 16]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={opacity * 0.75}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 4. Flight Arcs */}
      {flightCurves.map((flight, idx) => (
        <primitive key={`flight-line-${idx}`} object={flight.lineObj} />
      ))}

      {/* Atmospheric glow ring around globe horizon */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[globeRadius + 0.05, globeRadius + 0.35, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={opacity * 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
