import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
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

      const moveVector = new THREE.Vector3(0, 0, 0);
      
      if (keyF) moveVector.add(cameraForward);
      if (keyB) moveVector.sub(cameraForward);
      if (keyL) moveVector.sub(cameraRight);
      if (keyR) moveVector.add(cameraRight);

      if (moveVector.length() > 0) {
        moveVector.normalize();
        
        // Reverted to 1% impulse strength (0.15)
        const impulseStrength = 0.15 * delta * 60;
        
        body.current.applyImpulse({ 
          x: moveVector.x * impulseStrength, 
          y: 0, 
          z: moveVector.z * impulseStrength 
        }, true);
      }

      // Manual Jump
      if (jump && isGrounded.current) {
        body.current.setLinvel({ x: body.current.linvel().x, y: 10, z: body.current.linvel().z }, true);
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
        canSleep={false}
        position={[0, 1, 0]}
        friction={1}
        linearDamping={1.0}
        angularDamping={1.0}
        onCollisionEnter={onCollisionEnter}
        onCollisionExit={onCollisionExit}
      >
        <BallCollider args={[0.4]} />
        <mesh ref={mesh} castShadow>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#3498db" roughness={0.1} metalness={0.5} />
        </mesh>
      </RigidBody>
      
      {/* Blob Shadow - Optimized */}
      <ContactShadows 
        position={[0, -0.4, 0]} 
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
