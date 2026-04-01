import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createBookMesh } from './BookMesh';

const Hero3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = null; 
    
    const camera = new THREE.PerspectiveCamera(40, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting (Clean & Intentional) ---
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0x2563EB, 0.8);
    accentLight.position.set(-5, 5, 5);
    scene.add(accentLight);

    // --- Main Central Hub ---
    const hubBook = createBookMesh(0x2563EB, true);
    scene.add(hubBook);

    // --- 3-Book Orbit System ---
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const books = [];
    const count = 3; 
    const radius = 5;
    const colors = [0x10B981, 0x2563EB, 0x10B981];

    for (let i = 0; i < count; i++) {
      const book = createBookMesh(colors[i]);
      orbitGroup.add(book);
      
      const angle = (i / count) * Math.PI * 2;
      books.push({ mesh: book, angle: angle });
    }

    // --- Glow Rings (Representing Loop) ---
    const ringGeo = new THREE.RingGeometry(4.98, 5.02, 128);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x2563EB, 
      transparent: true, 
      opacity: 0.1, 
      side: THREE.DoubleSide 
    });
    
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = ring1.clone();
    ring2.rotation.y = Math.PI / 6;
    ring2.scale.set(1.1, 1.1, 1.1);
    ring2.material = ringMat.clone();
    ring2.material.opacity = 0.05;
    scene.add(ring2);

    // --- Mouse Parallax ---
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- Animation Loop ---
    let animationId;
    const animate = () => {
      const time = Date.now() * 0.0004;
      
      // Central Hub Motion
      hubBook.rotation.y = time * 0.3;
      hubBook.rotation.z = Math.sin(time) * 0.05;
      hubBook.position.y = Math.sin(time * 0.5) * 0.2;

      // Orbital System
      books.forEach((b, i) => {
        const orbitAngle = b.angle + time * 0.8;
        b.mesh.position.x = Math.cos(orbitAngle) * radius;
        b.mesh.position.y = Math.sin(orbitAngle * 0.5) * 0.5; // Slight wave
        b.mesh.position.z = Math.sin(orbitAngle) * radius;

        b.mesh.rotation.y = -orbitAngle + Math.PI / 2;
        b.mesh.rotation.x = Math.sin(time + i) * 0.1;
      });

      // Rings spin
      ring1.rotation.z = time * 0.2;
      ring2.rotation.z = -time * 0.1;

      // Camera Parallax
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX * 1.5, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseY * 1.5, 0.05);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement.parentNode) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
      });
    };
  }, []);

  return <div ref={containerRef} className="hero-3d-scene" />;
};

export default Hero3D;
