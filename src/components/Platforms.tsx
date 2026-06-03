import { useMemo, useRef, useEffect } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

const PLATFORM_COUNT = 40;
const VISIBLE_RANGE = 20;

const NEON_COLORS = [
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#00ff00', // Lime
  '#ffff00', // Yellow
  '#ff4d00', // Orange
];

export default function Platforms() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const score = useGameStore((state) => state.score);

  const instances = useMemo(() => {
    const currentLevel = Math.floor(score / 5);
    const startLevel = Math.max(0, currentLevel - VISIBLE_RANGE);
    const endLevel = startLevel + PLATFORM_COUNT;
    
    const items = [];
    for (let i = startLevel; i < endLevel; i++) {
      if (i === 0) continue;

      const seed = i * 15485863;
      const angle = (seed % 1000) / 1000 * Math.PI * 2;
      const radius = 3 + (Math.abs(Math.sin(seed * 0.5)) * 10);
      
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      
      const colorIndex = Math.abs(Math.floor(Math.sin(seed) * NEON_COLORS.length));
      
      items.push({
        key: `platform-${i}`,
        position: [x, i * 5, z],
        rotation: [0, (seed % 100) / 100 * Math.PI, 0],
        scale: [3 + Math.sin(seed) * 1, 0.5, 3 + Math.cos(seed) * 1],
        color: new THREE.Color(NEON_COLORS[colorIndex]),
      });
    }
    return items;
  }, [score]);

  useEffect(() => {
    if (meshRef.current) {
      instances.forEach((instance, i) => {
        meshRef.current?.setColorAt(i, instance.color);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [instances]);

  return (
    <InstancedRigidBodies
      instances={instances}
      type="fixed"
      colliders="cuboid"
      name="platform"
    >
      <instancedMesh ref={meshRef} args={[undefined, undefined, PLATFORM_COUNT]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          emissiveIntensity={1}
          toneMapped={false}
          onBeforeCompile={(shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              'vec4 diffuseColor = vec4( diffuse, opacity );',
              'vec4 diffuseColor = vec4( diffuse, opacity );\n  gl_FragColor.rgb += instanceColor.rgb * 0.5;'
            );
          }}
        />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}
