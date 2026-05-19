import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import { useKeyboardControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

export default function Player() {
  const body = useRef<RapierRigidBody>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { phase, setGameOver, incrementScore } = useGameStore();
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  const isGrounded = useRef(false);

  /**
   * Reset Position on Restart
   */
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      (state) => state.phase,
      (phase) => {
        if (phase === 'READY') {
          body.current?.setTranslation({ x: 0, y: 1, z: 0 }, true);
          body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
          body.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
        if (phase === 'PLAYING') {
          body.current?.setLinvel({ x: 0, y: 5, z: 0 }, true);
        }
      }
    );
    return unsubscribe;
  }, []);

  useFrame((state, delta) => {
    if (!body.current) return;

    const bodyPosition = body.current.translation();

    if (phase === 'PLAYING') {
      /**
       * Controls / Movement (Camera-Relative)
       */
      const { forward: keyF, backward: keyB, left: keyL, right: keyR, jump } = getKeys();
      
      // 1. Get camera's forward and right vectors in world space
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      
      state.camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0)).normalize();
      
      // 2. Project vectors onto the XZ plane (y=0) to keep movement horizontal
      cameraForward.y = 0;
      cameraForward.normalize();
      // cameraRight is already horizontal since it's cross with (0,1,0)

      const moveVector = new THREE.Vector3(0, 0, 0);
      
      if (keyF) moveVector.add(cameraForward);
      if (keyB) moveVector.sub(cameraForward);
      if (keyL) moveVector.sub(cameraRight);
      if (keyR) moveVector.add(cameraRight);

      if (moveVector.length() > 0) {
        moveVector.normalize();
        
        // Use a consistent impulse strength
        const force = 40 * delta * 60; // Normalize by 60fps for consistency
        
        body.current.applyImpulse({ 
          x: moveVector.x * force, 
          y: 0, 
          z: moveVector.z * force 
        }, true);
      }

      // Manual Jump
      if (jump && isGrounded.current) {
        body.current.setLinvel({ x: body.current.linvel().x, y: 15, z: body.current.linvel().z }, true);
        isGrounded.current = false;
      }

      /**
       * Score & Game Over
       */
      incrementScore(bodyPosition.y);
      
      if (bodyPosition.y < -15) {
        setGameOver();
      }
    }

    /**
     * Camera Center (Follow target only)
     */
    smoothedCameraTarget.lerp(new THREE.Vector3(bodyPosition.x, bodyPosition.y + 2, bodyPosition.z), 5 * delta);
    // Since we use OrbitControls, we just want it to keep following the player's position
    // OrbitControls in Experience.tsx will handle the actual rotation/distance
    state.camera.lookAt(smoothedCameraTarget);
  });

  const onCollisionEnter = ({ other }: any) => {
    if (other.rigidBodyObject?.name === 'platform' || other.rigidBodyObject?.name === 'floor') {
      isGrounded.current = true;
    }
  };

  const onCollisionExit = ({ other }: any) => {
    if (other.rigidBodyObject?.name === 'platform' || other.rigidBodyObject?.name === 'floor') {
      isGrounded.current = false;
    }
  };

  return (
    <group>
      <RigidBody
        ref={body}
        colliders={false}
        enabledRotations={[false, false, false]}
        position={[0, 1, 0]}
        friction={1}
        onCollisionEnter={onCollisionEnter}
        onCollisionExit={onCollisionExit}
      >
        <CuboidCollider args={[0.5, 0.5, 0.5]} />
        <mesh ref={mesh} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </RigidBody>
      
      {/* Blob Shadow - Optimized */}
      <ContactShadows 
        position={[0, -0.45, 0]} 
        opacity={0.4} 
        scale={5} 
        blur={1.5} 
        far={15} 
        resolution={128} 
        color="#000000"
      />
    </group>
  );
}
