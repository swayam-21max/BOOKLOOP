import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const BookModel = ({ position, rotation, color = '#2563EB', title = 'Knowledge' }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  // Floating animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.1;
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group 
      position={position} 
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setActive(!active)}
    >
      <mesh ref={meshRef} scale={hovered ? 1.1 : 1}>
        <boxGeometry args={[0.8, 1.1, 0.2]} />
        <meshStandardMaterial 
          color={color} 
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
          roughness={0.3}
        />
      </mesh>
      {/* Pages detail */}
      <mesh position={[0.03, 0, 0]}>
        <boxGeometry args={[0.75, 1.05, 0.18]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
};

export default BookModel;
