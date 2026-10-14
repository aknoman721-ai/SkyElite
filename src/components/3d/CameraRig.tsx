import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
  scrollProgress: number; // 0 to 1
  reducedMotion?: boolean;
}

export function CameraRig({ scrollProgress, reducedMotion = false }: CameraRigProps) {
  const { camera } = useThree();
  const mousePos = useRef({ x: 0, y: 0 });

  // Handle subtle interactive mouse parallax on desktop
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePos.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    // If reduced motion is preferred, use a static pleasing camera
    if (reducedMotion) {
      camera.position.set(0, 0, 7.2);
      camera.lookAt(0, -0.4, 0);
      return;
    }

    const p = Math.max(0, Math.min(1, scrollProgress));
    const mouseX = mousePos.current.x * 0.15;
    const mouseY = -mousePos.current.y * 0.1;

    let targetCamPos = new THREE.Vector3(0, 0, 7.2);
    let targetLookAt = new THREE.Vector3(0, -0.4, 0);

    // Continuous scroll-driven camera choreography across the 6 sections
    if (p <= 0.18) {
      // 0. HERO (0 -> 0.18):
      // Camera faces the jet angled in the lower right, matching start page
      targetCamPos.set(0 + mouseX, 0 + mouseY, 7.2);
      targetLookAt.set(0, -0.4, 0);
    } else if (p <= 0.38) {
      // 1. PREMIUM (0.18 -> 0.38):
      // Jet in lower-left (-1.8, -2.1, 0.8), text on the right
      // Slow ~25 degree orbit around the jet with a subtle cinematic dolly-in
      const t = (p - 0.18) / 0.20;
      const camX = THREE.MathUtils.lerp(0, -0.9, t) + mouseX;
      const camY = THREE.MathUtils.lerp(0, -0.6, t) + mouseY;
      const camZ = THREE.MathUtils.lerp(7.2, 5.8, t); // dolly-in
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(
        THREE.MathUtils.lerp(0, -1.4, t),
        THREE.MathUtils.lerp(-0.4, -1.5, t),
        THREE.MathUtils.lerp(0, 0.5, t)
      );
    } else if (p <= 0.58) {
      // 2. ACCESSIBLE (0.38 -> 0.58):
      // Smooth hand-off from lower-left to high center above the route globe
      const t = (p - 0.38) / 0.20;
      const camX = THREE.MathUtils.lerp(-0.9, 0, t) + mouseX;
      const camY = THREE.MathUtils.lerp(-0.6, 2.4, t) + mouseY;
      const camZ = THREE.MathUtils.lerp(5.8, 9.8, t);
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(
        THREE.MathUtils.lerp(-1.4, 0, t),
        THREE.MathUtils.lerp(-1.5, -1.2, t),
        THREE.MathUtils.lerp(0.5, -0.5, t)
      );
    } else if (p <= 0.78) {
      // 3. COMFORT (0.58 -> 0.78):
      // Fuselage becomes translucent, camera glides INTO the cabin
      const t = (p - 0.58) / 0.20;
      const camX = THREE.MathUtils.lerp(0, -0.32, t) + mouseX * 0.3;
      const camY = THREE.MathUtils.lerp(2.4, -0.15, t) + mouseY * 0.3;
      const camZ = THREE.MathUtils.lerp(9.8, 1.9, t);
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(
        THREE.MathUtils.lerp(0, 0.1, t),
        THREE.MathUtils.lerp(-1.2, -0.2, t),
        THREE.MathUtils.lerp(-0.5, -1.8, t)
      );
    } else if (p <= 0.90) {
      // 4. EXPERIENCE (0.78 -> 0.90):
      // Camera pulls back to exterior trailing view, jet drifts gracefully
      const t = (p - 0.78) / 0.12;
      const camX = THREE.MathUtils.lerp(-0.32, 0, t) + mouseX;
      const camY = THREE.MathUtils.lerp(-0.15, 0.6, t) + mouseY;
      const camZ = THREE.MathUtils.lerp(1.9, 7.0, t);
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(
        THREE.MathUtils.lerp(0.1, 0, t),
        THREE.MathUtils.lerp(-0.2, -0.2, t),
        THREE.MathUtils.lerp(-1.8, -1.0, t)
      );
    } else {
      // 5. FINAL CTA (0.90 -> 1.0):
      // Jet climbs and banks away into the clouds, camera settles on peaceful sky
      const t = (p - 0.90) / 0.10;
      const camX = THREE.MathUtils.lerp(0, 0, t) + mouseX;
      const camY = THREE.MathUtils.lerp(0.6, 0.8, t) + mouseY;
      const camZ = THREE.MathUtils.lerp(7.0, 7.5, t);
      targetCamPos.set(camX, camY, camZ);
      targetLookAt.set(0, 0.2, 0);
    }

    // Buttery smooth lerp damping
    const lerpSpeed = Math.min(1, delta * 4.5);
    camera.position.lerp(targetCamPos, lerpSpeed);

    // Smooth lookAt tracking
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    const targetDirection = new THREE.Vector3().subVectors(targetLookAt, camera.position).normalize();
    const blendedDirection = currentLookAt.lerp(targetDirection, lerpSpeed);
    const newTarget = new THREE.Vector3().addVectors(camera.position, blendedDirection);
    camera.lookAt(newTarget);
  });

  return null;
}
