/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import "./Loader3D.css";

interface Loader3DProps {
  progress?: number; // 0 to 100
  onComplete?: () => void;
}

export function Loader3D({ progress = 0, onComplete }: Loader3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Handle Exit Animation Trigger
  useEffect(() => {
    if (progress >= 100 && !isExiting) {
      setIsExiting(true);
      setTimeout(() => {
        if (onCompleteRef.current) onCompleteRef.current();
      }, 800); // 800ms exit transition
    }
  }, [progress, isExiting]);

  // Three.js Atom Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const getCanvasSize = () => {
      if (window.innerWidth < 768) return 100;
      if (window.innerWidth < 1024) return 120;
      return 140;
    };

    let canvasSize = getCanvasSize();
    let animationId: number;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 250;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasSize, canvasSize);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Atom Rings
    const rings: THREE.Mesh[] = [];
    const ringGeometry = new THREE.TorusGeometry(60, 1.5, 16, 100, Math.PI * 2);
    
    // Create glowing material
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeometry, material);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.y = (Math.PI / 3) * i;
      rings.push(ring);
      group.add(ring);
    }

    // Center Core Glow
    const coreGeometry = new THREE.SphereGeometry(12, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const handleResize = () => {
      const newSize = getCanvasSize();
      if (newSize !== canvasSize) {
        canvasSize = newSize;
        renderer.setSize(canvasSize, canvasSize);
      }
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.015;
      
      // Accelerate if exiting
      const speedMultiplier = progress >= 100 ? 3 : 1;

      group.rotation.x = Math.sin(time * 0.5) * 0.2;
      group.rotation.y += 0.02 * speedMultiplier;
      group.rotation.z = Math.cos(time * 0.3) * 0.1;

      rings.forEach((ring, index) => {
        ring.rotation.x += 0.015 * speedMultiplier * (index % 2 === 0 ? 1 : -1);
        ring.rotation.y += 0.01 * speedMultiplier;
      });

      // Pulse core
      const pulse = 1 + Math.sin(time * 4) * 0.1;
      core.scale.set(pulse, pulse, pulse);
      coreMaterial.opacity = 0.6 + Math.sin(time * 4) * 0.3;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      ringGeometry.dispose();
      material.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
    };
  }, [progress]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="up-loader-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="up-content-wrapper">
            {/* 3D Loader Container */}
            <div className="up-canvas-wrapper">
              <div ref={mountRef} className="up-canvas" />
            </div>

            {/* Progress Bar */}
            <motion.div
              className="up-progress-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="up-progress-bar-bg">
                <motion.div
                  className="up-progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="up-progress-shimmer" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
