import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { JetModel } from './JetModel';
import { Clouds } from './Clouds';
import { RouteGlobe } from './RouteGlobe';
import { CameraRig } from './CameraRig';

interface SceneProps {
  scrollProgress: number; // 0 to 1
  reducedMotion?: boolean;
}

function JetController({
  scrollProgress,
  reducedMotion = false,
}: {
  scrollProgress: number;
  reducedMotion?: boolean;
}) {
  const jetGroup = useRef<THREE.Group>(null);
  const p = Math.max(0, Math.min(1, scrollProgress));

  // Determine fuselage opacity: Section 3 (Comfort: ~0.55 to ~0.76) becomes translucent
  const fuselageOpacity = useMemo(() => {
    if (p >= 0.55 && p <= 0.76) {
      const mid = 0.655;
      const dist = Math.abs(p - mid) / 0.105;
      return THREE.MathUtils.lerp(0.15, 0.85, dist * dist);
    }
    return 1.0;
  }, [p]);

  // Globe opacity: active during Section 2 (Accessible: 0.35 to 0.56)
  const globeOpacity = useMemo(() => {
    if (p >= 0.32 && p <= 0.58) {
      if (p < 0.40) return (p - 0.32) / 0.08;
      if (p > 0.52) return (0.58 - p) / 0.06;
      return 1.0;
    }
    return 0;
  }, [p]);

  // Engine power: active with afterburner on final climb
  const enginePower = useMemo(() => {
    if (p >= 0.88) return 2.2;
    return 1.0;
  }, [p]);

  // Choreograph jet position and rotation across the scroll journey
  useFrame((state, delta) => {
    if (!jetGroup.current) return;

    let targetPos = new THREE.Vector3(0.6, -1.6, 0.4);
    let targetRot = new THREE.Euler(0.08, -0.42, 0.06);

    if (p <= 0.18) {
      // 0. HERO (0 -> 0.18): EXACTLY MATCHING START PAGE
      const t = p / 0.18;
      targetPos.set(
        THREE.MathUtils.lerp(0.6, 1.2, t),
        THREE.MathUtils.lerp(-1.6, -1.1, t),
        THREE.MathUtils.lerp(0.4, 0.45, t)
      );
      targetRot.set(
        THREE.MathUtils.lerp(0.08, 0.12, t),
        THREE.MathUtils.lerp(-0.42, -0.35, t),
        THREE.MathUtils.lerp(0.06, 0.08, t)
      );
    } else if (p <= 0.38) {
      // 1. PREMIUM (0.18 -> 0.38):
      // Jet glides into LOWER-LEFT / lower-centre, large and clearly visible, never overlapping text on the right
      if (p < 0.24) {
        // Phase A (0.18 -> 0.24): glide down and left into lower-left frame, slow rotation to 3/4 view
        const t = (p - 0.18) / 0.06;
        targetPos.set(
          THREE.MathUtils.lerp(1.2, -1.8, t),
          THREE.MathUtils.lerp(-1.1, -2.1, t),
          THREE.MathUtils.lerp(0.45, 0.8, t)
        );
        targetRot.set(
          THREE.MathUtils.lerp(0.12, 0.10, t),
          THREE.MathUtils.lerp(-0.35, 0.35, t),
          THREE.MathUtils.lerp(0.08, 0.08, t)
        );
      } else if (p <= 0.32) {
        // Phase B (0.24 -> 0.32): Jet settled in lower-left, slow 3/4 orbit rotation during exploded view
        const t = (p - 0.24) / 0.08;
        targetPos.set(-1.8, -2.1, 0.8);
        targetRot.set(
          0.10,
          THREE.MathUtils.lerp(0.35, 0.56, t), // ~25 degree slow orbit for inspection
          0.08
        );
      } else {
        // Phase C (0.32 -> 0.38): Jet reassembles and prepares for hand-off into Accessible
        const t = (p - 0.32) / 0.06;
        targetPos.set(
          THREE.MathUtils.lerp(-1.8, -1.8, t),
          THREE.MathUtils.lerp(-2.1, -2.1, t),
          0.8
        );
        targetRot.set(
          0.10,
          THREE.MathUtils.lerp(0.56, 0.45, t),
          0.08
        );
      }
    } else if (p <= 0.58) {
      // 2. ACCESSIBLE (0.38 -> 0.58):
      // Smooth hand-off: ascends from lower-left to high center above the globe
      const t = (p - 0.38) / 0.20;
      targetPos.set(
        THREE.MathUtils.lerp(-1.8, 0.2, t),
        THREE.MathUtils.lerp(-2.1, 1.4, t),
        THREE.MathUtils.lerp(0.8, 0.0, t)
      );
      targetRot.set(
        THREE.MathUtils.lerp(0.10, 0.04, t),
        THREE.MathUtils.lerp(0.45, -0.25, t),
        THREE.MathUtils.lerp(0.08, 0.05, t)
      );
    } else if (p <= 0.78) {
      // 3. COMFORT (0.58 -> 0.78): Fuselage translucent, aligned with cabin camera
      const t = (p - 0.58) / 0.20;
      targetPos.set(
        THREE.MathUtils.lerp(0.2, 0.0, t),
        THREE.MathUtils.lerp(1.4, -0.1, t),
        THREE.MathUtils.lerp(0.0, 0.0, t)
      );
      targetRot.set(0, 0, 0);
    } else if (p <= 0.90) {
      // 4. EXPERIENCE: Distant background cruise behind glass cards
      const t = (p - 0.78) / 0.12;
      targetPos.set(
        THREE.MathUtils.lerp(0.0, 0.4, t),
        THREE.MathUtils.lerp(-0.1, -0.3, t),
        THREE.MathUtils.lerp(0.0, -3.2, t)
      );
      targetRot.set(0.06, -0.35, 0.08);
    } else {
      // 5. FINAL CTA: Bank sharply right and climb high into clouds
      const t = (p - 0.90) / 0.10;
      targetPos.set(
        THREE.MathUtils.lerp(0.4, 9.5, t),
        THREE.MathUtils.lerp(-0.3, 7.0, t),
        THREE.MathUtils.lerp(-3.2, -14.0, t)
      );
      targetRot.set(
        THREE.MathUtils.lerp(0.06, 0.42, t),
        THREE.MathUtils.lerp(-0.35, 0.38, t),
        THREE.MathUtils.lerp(0.08, 0.65, t)
      );
    }

    const lerpSpeed = Math.min(1, delta * 4.5);
    jetGroup.current.position.lerp(targetPos, lerpSpeed);
    jetGroup.current.rotation.x = THREE.MathUtils.lerp(jetGroup.current.rotation.x, targetRot.x, lerpSpeed);
    jetGroup.current.rotation.y = THREE.MathUtils.lerp(jetGroup.current.rotation.y, targetRot.y, lerpSpeed);
    jetGroup.current.rotation.z = THREE.MathUtils.lerp(jetGroup.current.rotation.z, targetRot.z, lerpSpeed);
  });

  return (
    <>
      <group ref={jetGroup}>
        <JetModel
          scrollProgress={scrollProgress}
          fuselageOpacity={fuselageOpacity}
          enginePower={enginePower}
          reducedMotion={reducedMotion}
        />
      </group>
      <RouteGlobe scrollProgress={scrollProgress} opacity={globeOpacity} />
    </>
  );
}

export function Scene({ scrollProgress, reducedMotion = false }: SceneProps) {
  const p = Math.max(0, Math.min(1, scrollProgress));

  // Subtle rim light enhancement that grows with explosion (0.24 to 0.32) so black paint reads clearly
  const explodeFactor = useMemo(() => {
    if (p < 0.24 || p > 0.38) return 0;
    if (p >= 0.27 && p <= 0.32) return 1.0;
    if (p < 0.27) return (p - 0.24) / 0.03;
    return (0.38 - p) / 0.06;
  }, [p]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#ECEEF2]">
      <Canvas
        shadows
        dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)]}
        camera={{ position: [0, 0, 7.2], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <Suspense fallback={null}>
          {/* Studio Lighting Setup matching start page */}
          <ambientLight intensity={0.7} color="#F3F5F8" />
          {/* Key Light */}
          <directionalLight
            position={[8, 12, 10]}
            intensity={2.2}
            color="#FFF8EE"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          {/* Fill Light */}
          <directionalLight position={[-8, 6, 4]} intensity={1.2} color="#DCE4EC" />
          {/* Rim Light (with subtle boost during exploded view so separated black parts read clearly) */}
          <directionalLight
            position={[-3, -4, -7]}
            intensity={1.4 + explodeFactor * 1.2}
            color="#FFFFFF"
          />
          {/* Soft upward bounce from clouds */}
          <hemisphereLight args={['#FFFFFF', '#D9DFE7', 0.8]} />

          {/* Drei Environment for crisp metallic reflections */}
          <Environment preset="studio" />

          {/* Drifting Cumulus Cloud Layer */}
          <Clouds reducedMotion={reducedMotion} />

          {/* Jet & Route Globe orchestrated along scroll */}
          <JetController
            scrollProgress={scrollProgress}
            reducedMotion={reducedMotion}
          />

          {/* Camera Choreography */}
          <CameraRig
            scrollProgress={scrollProgress}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
