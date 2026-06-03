import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

export default function Player() {
  const body = useRef<RapierRigidBody>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { phase, setGameOver, incrementScore } = useGameStore();
  
  // Camera state
  const [cameraOffset] = useState(() => new THREE.Vector3(10, 10, 10));
  const [smoothedCameraPosition] = useState(() => new THREE.Vector3(10, 10, 10));
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
          body.current?.setTranslation({ x: 0, y: 5, z: 0 }, true);
          body.current?.setLinvel({ x: 0, y: 0, z: 0 }, true);
          body.current?.setAngvel({ x: 0, y: 0, z: 0 }, true);
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
      
      const cameraForward = new THREE.Vector3();
      const cameraRight = new THREE.Vector3();
      
      state.camera.getWorldDirection(cameraForward);
      cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0)).normalize();
      
      cameraForward.y = 0;
      cameraForward.normalize();

      const moveVector = new THREE.Vector3(0, 0, 0);
      
      if (keyF) moveVector.add(cameraForward);
      if (keyB) moveVector.sub(cameraForward);
      if (keyL) moveVector.sub(cameraRight);
      if (keyR) moveVector.add(cameraRight);

      if (moveVector.length() > 0) {
        moveVector.normalize();
        const impulseStrength = 0.6 * delta * 60;
        
        body.current.applyImpulse({ 
          x: moveVector.x * impulseStrength, 
          y: 0, 
          z: moveVector.z * impulseStrength 
        }, true);
      }

      // Jump
      if (jump && isGrounded.current) {
        body.current.applyImpulse({ x: 0, y: 12, z: 0 }, true);
        isGrounded.current = false;
      }

      /**
       * Score & Game Over
       */
      incrementScore(bodyPosition.y);
      
      if (bodyPosition.y < -10) {
        setGameOver();
      }
    }

    /**
     * Camera Follow
     */
    const targetPosition = new THREE.Vector3(bodyPosition.x, bodyPosition.y, bodyPosition.z);
    
    // Smoothly follow the player height
    smoothedCameraTarget.lerp(new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), 5 * delta);
    
    // Update camera position to maintain distance but follow height
    const desiredCameraPosition = new THREE.Vector3().copy(state.camera.position);
    desiredCameraPosition.y = targetPosition.y + 10; // Maintain vertical offset
    
    // We don't want to force camera position if using OrbitControls, 
    // but we need to follow the player. 
    // Let's just update the target of OrbitControls in Experience.tsx instead.
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
        canSleep={false}
        position={[0, 5, 0]}
        friction={1}
        linearDamping={0.5}
        angularDamping={0.5}
        gravityScale={2.5}
        onCollisionEnter={onCollisionEnter}
        onCollisionExit={onCollisionExit}
        name="player"
      >
        <BallCollider args={[0.5]} />
        <mesh castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000" 
            emissiveIntensity={2} 
            roughness={0} 
            metalness={1} 
          />
        </mesh>
        
        {/* Inner glow effect */}
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.2} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </RigidBody>
      
      {/* Point light attached to player for neon effect */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#ff0000" distance={5} />
    </group>
  );
}
