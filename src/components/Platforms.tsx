import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedRigidBodies, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';
import Flag from './Flag';
import DestructiblePlatform from './DestructiblePlatform';
import HiddenJumpPlatform from './HiddenJumpPlatform';
import HintSign from './HintSign';

const PLATFORM_COUNT = 70; 
const SPACING = 4;

const NEON_COLORS = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#00ffff'),
  new THREE.Color('#ff00ff'),
  new THREE.Color('#00ff00'),
  new THREE.Color('#ffff00'),
];

const GOLDEN_COLOR = new THREE.Color('#ffd700');
const MOVING_COLOR = new THREE.Color('#ffaa00');
const ENDING_LEVEL = 200; 

export default function Platforms() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const movingPlatformsRef = useRef<Map<string, RapierRigidBody>>(new Map());
  
  // Update pivotLevel more frequently (every 10 levels) for smoother rendering transitions
  const pivotLevel = useGameStore((state) => Math.floor(state.currentLevel / 10) * 10);

  const { instances, movingPlatforms, destructiblePlatforms } = useMemo(() => {
    // Window of 300 platforms around the pivot
    const startLevel = Math.max(1, pivotLevel - 100); 
    const count = 300;
    
    const items = [];
    const moving = [];
    const destructible = [];
    
    for (let i = 0; i < count; i++) {
      const levelIndex = startLevel + i;
      if (levelIndex > ENDING_LEVEL) continue;

      const seed = levelIndex * 15485863;
      const angle = levelIndex * 0.5 + Math.sin(seed) * 0.3;
      const radius = 3 + (Math.abs(Math.sin(seed)) * 7);
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const position = [x, levelIndex * SPACING, z] as [number, number, number];
      
      const isExpertZone = levelIndex >= 150; // 600m+
      const sizeMultiplier = isExpertZone ? 0.4 : 1.0; // Drastically reduced for high difficulty

      // 1. Checkpoint (Priority 1)
      if (levelIndex > 0 && levelIndex % 15 === 0) {
        items.push({
          key: `platform-${levelIndex}`,
          name: 'checkpoint',
          position,
          rotation: [0, (seed % 100) / 100 * Math.PI, 0] as [number, number, number],
          scale: [8 * sizeMultiplier, 0.6, 8 * sizeMultiplier] as [number, number, number],
          color: GOLDEN_COLOR,
        });
      }
      // 2. Destructible Platform (Priority 2) - Starts at 400m (Level 100)
      else if (levelIndex >= 100 && levelIndex % 3 === 0) {
        destructible.push({
          key: `destructible-${levelIndex}`,
          position,
          scale: [5 * sizeMultiplier, 0.6, 5 * sizeMultiplier] as [number, number, number]
        });
      }
      // 3. Moving Platform (Priority 3) - Starts at 200m (Level 50)
      else if (levelIndex >= 50 && levelIndex % 3 === 0) {
        moving.push({
          key: `moving-${levelIndex}`,
          levelIndex: levelIndex,
          position: position,
          scale: [6 * sizeMultiplier, 0.6, 6 * sizeMultiplier] as [number, number, number]
        });
      }
      // 4. Normal Platform
      else {
        let scaleX, scaleZ, color, name = 'platform';

        if (levelIndex === ENDING_LEVEL) {
          scaleX = 4; scaleZ = 4; color = new THREE.Color('#00ffff'); name = 'ending';
        } else if (levelIndex <= 10) {
          scaleX = 6; scaleZ = 6; color = NEON_COLORS[0];
        } else {
          scaleX = (4 + Math.sin(seed * 2) * 1.5) * sizeMultiplier;
          scaleZ = (4 + Math.cos(seed * 2) * 1.5) * sizeMultiplier;
          
          const colorIndex = Math.abs(seed) % NEON_COLORS.length;
          color = NEON_COLORS[colorIndex];
        }

        items.push({
          key: `platform-${levelIndex}`,
          name: name,
          position: position,
          rotation: [0, (seed % 100) / 100 * Math.PI, 0] as [number, number, number],
          scale: [scaleX, 0.6, scaleZ] as [number, number, number],
          color: color || NEON_COLORS[0],
        });
      }
    }
    return { instances: items, movingPlatforms: moving, destructiblePlatforms: destructible };
  }, [pivotLevel]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    movingPlatforms.forEach((platform) => {
      const body = movingPlatformsRef.current.get(platform.key);
      if (body) {
        try {
          const level = platform.levelIndex;
          const x = Math.sin(time * 0.5 + level) * 10;
          body.setNextKinematicTranslation({ x, y: level * SPACING, z: 0 });
        } catch (e) {}
      }
    });
  });

  const checkpointPosition = useGameStore((state) => state.checkpointPosition);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.frustumCulled = false;
    }
  }, [instances]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.count = instances.length;
      instances.forEach((instance, i) => {
        let color = instance.color;
        if (instance.name === 'checkpoint' && checkpointPosition) {
          const isAtCheckpoint = Math.abs(instance.position[1] - checkpointPosition[1]) < 0.1;
          if (isAtCheckpoint) color = new THREE.Color('#00ff00');
        }
        if (color) meshRef.current?.setColorAt(i, color);
      });
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
      if (meshRef.current.instanceMatrix) meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [instances, checkpointPosition]);

  const flags = useMemo(() => {
    return instances
      .filter((inst) => inst.name === 'checkpoint')
      .map((inst) => (
        <Flag 
          key={`flag-${inst.key}`} 
          position={inst.position as [number, number, number]} 
        />
      ));
  }, [instances]);

  const checkpointInteractables = useMemo(() => {
    return instances
      .filter((inst) => inst.name === 'checkpoint')
      .map((inst) => {
        const pos = inst.position as [number, number, number];
        const jumpPos: [number, number, number] = [pos[0] + 6, pos[1] + 1, pos[2]];
        
        return (
          <group key={`interactable-${inst.key}`}>
            <HiddenJumpPlatform
              position={jumpPos}
            />
            <HintSign
              position={[pos[0], pos[1] + 1, pos[2]]}
              text="더 빨리 올라갈 수 있는 방법이 없을까?"
              rotation={[0, Math.atan2(jumpPos[0] - pos[0], jumpPos[2] - pos[2]), 0]}
            />
          </group>
        );
      });
  }, [instances]);

  return (
    <>
      {/* CRITICAL: key={pivotLevel} forces remount to sync visuals with physics bodies when the window shifts */}
      <InstancedRigidBodies key={pivotLevel} instances={instances} type="fixed" colliders="cuboid">
        <instancedMesh ref={meshRef} args={[undefined, undefined, 1000]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial toneMapped={false} emissive="#ffffff" emissiveIntensity={0.8} />
        </instancedMesh>
      </InstancedRigidBodies>

      {movingPlatforms.map((p) => (
        <RigidBody
          key={p.key}
          ref={(el) => {
            if (el) movingPlatformsRef.current.set(p.key, el);
            else movingPlatformsRef.current.delete(p.key);
          }}
          type="kinematicPosition"
          colliders="cuboid"
          name="platform"
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={p.scale || [6, 0.6, 6]} />
            <meshStandardMaterial color={MOVING_COLOR} emissive={MOVING_COLOR} emissiveIntensity={1.5} />
          </mesh>
        </RigidBody>
      ))}

      {destructiblePlatforms.map((p) => (
        <DestructiblePlatform key={p.key} position={p.position} scale={p.scale} />
      ))}

      {flags}
      {checkpointInteractables}

      {/* Summit Decoration */}
      {instances.find(inst => inst.name === 'ending') && (
        <SummitDecoration position={instances.find(inst => inst.name === 'ending')!.position} />
      )}
    </>
  );
}

function SummitDecoration({ position }: { position: [number, number, number] }) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.y = time * 0.5;
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = time * 0.8;
      ring2Ref.current.rotation.z = time * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = -time * 0.4;
      ring3Ref.current.rotation.x = time * 0.2;
    }
  });

  return (
    <group position={[position[0], position[1] + 2, position[2]]}>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[6, 0.1, 16, 100]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[8, 0.1, 16, 100]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[10, 0.1, 16, 100]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
      </mesh>
      <pointLight intensity={10} distance={20} color="#00ffff" />
    </group>
  );
}
