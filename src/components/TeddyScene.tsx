import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";

export type TeddyMode = "walk" | "idle" | "dance" | "sad" | "hidden";

function MiniHeart({
  color = "#F75A8A",
  scale = 1,
}: {
  color?: string;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      <mesh position={[-0.18, 0.12, 0]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0.18, 0.12, 0]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.31, 0.5, 20]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
    </group>
  );
}

function FloatingHearts({ count = 16, active = true }: { count?: number; active?: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const items = useMemo(() => {
    const arr: { pos: [number, number, number]; s: number; speed: number; color: string; offset: number }[] = [];
    const colors = ["#F75A8A", "#FB7BA0", "#FDA4BA", "#F6C88F", "#C084FC", "#7DD3E0"];
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * 14,
          Math.random() * 6 + 0.5,
          (Math.random() - 0.5) * 6 - 1,
        ],
        s: 0.35 + Math.random() * 0.7,
        speed: 0.5 + Math.random() * 1.2,
        color: colors[i % colors.length],
        offset: Math.random() * 10,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const it = items[i];
      if (!it) return;
      child.position.y = it.pos[1] + Math.sin(t * it.speed + it.offset) * 0.5 + (active ? Math.sin(t * 0.3 + it.offset) * 0.2 : 0);
      child.position.x = it.pos[0] + Math.sin(t * 0.4 + it.offset) * 0.4;
      child.rotation.y = Math.sin(t * 0.8 + it.offset) * 0.6;
      child.rotation.z = Math.sin(t * 0.6 + it.offset) * 0.15;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group key={i} position={it.pos}>
          <MiniHeart color={it.color} scale={it.s} />
        </group>
      ))}
    </group>
  );
}

function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <Float speed={1.2} rotationIntensity={0} floatIntensity={0.8}>
      <group position={position} scale={scale}>
        <mesh>
          <sphereGeometry args={[0.7, 20, 20]} />
          <meshStandardMaterial color="white" roughness={1} transparent opacity={0.95} />
        </mesh>
        <mesh position={[0.65, -0.1, 0]}>
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshStandardMaterial color="white" roughness={1} transparent opacity={0.95} />
        </mesh>
        <mesh position={[-0.65, -0.12, 0]}>
          <sphereGeometry args={[0.55, 20, 20]} />
          <meshStandardMaterial color="white" roughness={1} transparent opacity={0.95} />
        </mesh>
        <mesh position={[0.1, 0.35, 0]}>
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshStandardMaterial color="white" roughness={1} transparent opacity={0.95} />
        </mesh>
      </group>
    </Float>
  );
}

function TeddyBear({ mode }: { mode: TeddyMode }) {
  const root = useRef<THREE.Group>(null!);
  const bob = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Mesh>(null!);
  const eyeR = useRef<THREE.Mesh>(null!);
  const heldHeart = useRef<THREE.Group>(null!);
  const mouth = useRef<THREE.Mesh>(null!);
  const notes = useRef<THREE.Group>(null!);
  const targetX = useRef(-7);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!root.current) return;

    // walking target
    if (mode === "walk") targetX.current = 0;
    else if (mode === "hidden") targetX.current = -8;
    else targetX.current = 0;

    const clampedDelta = Math.min(delta, 0.05);
    root.current.position.x = THREE.MathUtils.damp(root.current.position.x, targetX.current, 1.6, clampedDelta);
    const dist = Math.abs(root.current.position.x - targetX.current);
    const isWalking = mode === "walk" && dist > 0.15;

    if (isWalking) {
      const w = t * 9;
      bob.current.position.y = 1.25 + Math.abs(Math.sin(w)) * 0.22;
      bob.current.rotation.z = Math.sin(w) * 0.06;
      bob.current.rotation.y = Math.sin(w * 0.5) * 0.12;
      root.current.rotation.y = Math.sin(w * 0.5) * 0.08;
      armL.current.rotation.x = Math.sin(w) * 0.9;
      armR.current.rotation.x = -Math.sin(w) * 0.9;
      armL.current.rotation.z = 0.25;
      armR.current.rotation.z = -0.25;
      legL.current.rotation.x = -Math.sin(w) * 0.85;
      legR.current.rotation.x = Math.sin(w) * 0.85;
      head.current.rotation.z = Math.sin(w) * 0.06;
      head.current.rotation.x = 0;
      head.current.position.y = 1.02;
    } else if (mode === "dance") {
      const d = t * 6;
      bob.current.position.y = 1.25 + Math.abs(Math.sin(d)) * 0.55;
      bob.current.rotation.y = Math.sin(t * 2.2) * 0.5;
      bob.current.rotation.z = Math.sin(d * 0.5) * 0.12;
      root.current.rotation.y = Math.sin(t * 1.2) * 0.35;
      armL.current.rotation.z = 2.4 + Math.sin(d) * 0.35;
      armR.current.rotation.z = -2.4 - Math.sin(d + 1) * 0.35;
      armL.current.rotation.x = Math.sin(d * 0.7) * 0.4;
      armR.current.rotation.x = -Math.sin(d * 0.7) * 0.4;
      legL.current.rotation.x = Math.sin(d) * 0.5 - 0.15;
      legR.current.rotation.x = -Math.sin(d) * 0.5 - 0.15;
      head.current.rotation.z = Math.sin(d * 0.5) * 0.18;
      head.current.rotation.x = -0.12;
      head.current.position.y = 1.02 + Math.sin(d) * 0.05;
    } else if (mode === "sad") {
      bob.current.position.y = THREE.MathUtils.damp(bob.current.position.y, 1.05, 3, clampedDelta);
      bob.current.rotation.z = THREE.MathUtils.damp(bob.current.rotation.z, 0, 3, clampedDelta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, 0.38, 3, clampedDelta);
      head.current.position.y = THREE.MathUtils.damp(head.current.position.y, 0.92, 3, clampedDelta);
      armL.current.rotation.x = THREE.MathUtils.damp(armL.current.rotation.x, 0.15, 3, clampedDelta);
      armR.current.rotation.x = THREE.MathUtils.damp(armR.current.rotation.x, 0.15, 3, clampedDelta);
      armL.current.rotation.z = THREE.MathUtils.damp(armL.current.rotation.z, 0.12, 3, clampedDelta);
      armR.current.rotation.z = THREE.MathUtils.damp(armR.current.rotation.z, -0.12, 3, clampedDelta);
      legL.current.rotation.x = 0;
      legR.current.rotation.x = 0;
      root.current.rotation.y = Math.sin(t * 0.8) * 0.05;
    } else {
      // idle — breathing, gentle sway
      bob.current.position.y = 1.25 + Math.sin(t * 2) * 0.06;
      bob.current.rotation.z = Math.sin(t * 1.2) * 0.02;
      bob.current.rotation.y = Math.sin(t * 0.8) * 0.08;
      root.current.rotation.y = Math.sin(t * 0.6) * 0.12;
      armL.current.rotation.x = Math.sin(t * 2) * 0.08;
      armR.current.rotation.x = -Math.sin(t * 2) * 0.08;
      armL.current.rotation.z = 0.35 + Math.sin(t * 1.5) * 0.05;
      armR.current.rotation.z = -0.35 - Math.sin(t * 1.5) * 0.05;
      legL.current.rotation.x = 0;
      legR.current.rotation.x = 0;
      head.current.rotation.z = Math.sin(t * 1.1) * 0.08;
      head.current.rotation.x = Math.sin(t * 0.9) * 0.05;
      head.current.position.y = 1.02 + Math.sin(t * 2) * 0.02;
    }

    // blink
    const blink = t % 3.4 < 0.12 ? 0.12 : 1;
    if (eyeL.current) {
      eyeL.current.scale.y = blink;
      eyeR.current.scale.y = blink;
    }
    // held heart beat
    if (heldHeart.current) {
      const beat = 1 + (mode === "dance" ? Math.abs(Math.sin(t * 6)) * 0.35 : Math.sin(t * 3) * 0.07 + 0.07);
      heldHeart.current.scale.setScalar(beat);
      heldHeart.current.rotation.y = Math.sin(t * 1.5) * 0.25;
      heldHeart.current.position.y = 0.12 + Math.sin(t * 2.2) * 0.05;
    }

    // singing mouth
    if (mouth.current) {
      if (mode === "dance") {
        mouth.current.visible = true;
        const open = 0.55 + Math.abs(Math.sin(t * 9)) * 0.85;
        mouth.current.scale.set(1.05, open, 1);
      } else {
        mouth.current.visible = false;
      }
    }

    // floating music notes
    if (notes.current) {
      notes.current.visible = mode === "dance";
      if (mode === "dance") {
        notes.current.children.forEach((child, i) => {
          const life = ((t * (0.55 + i * 0.07) + i * 0.8) % 2.4);
          const k = life / 2.4;
          child.position.set(
            Math.sin(i * 1.7 + t) * 0.55 + (i % 2 === 0 ? 0.55 : -0.55),
            1.7 + k * 1.8,
            0.4 + Math.cos(i) * 0.2
          );
          child.rotation.z = Math.sin(t * 2 + i) * 0.4;
          child.scale.setScalar(0.35 + (1 - k) * 0.45);
          child.visible = true;
        });
      }
    }
  });

  const fur = "#D29A6B";
  const furDark = "#B97F4E";
  const cream = "#FFE8D1";

  return (
    <group ref={root} position={[-7, 0, 0]}>
      <group ref={bob} position={[0, 1.25, 0]}>
        {/* BODY */}
        <mesh castShadow position={[0, 0, 0]} scale={[1, 1.12, 0.88]}>
          <sphereGeometry args={[0.78, 32, 32]} />
          <meshStandardMaterial color={fur} roughness={0.65} />
        </mesh>
        {/* BELLY */}
        <mesh position={[0, -0.12, 0.52]} scale={[0.72, 0.82, 0.45]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color={cream} roughness={0.8} />
        </mesh>
        {/* belly heart patch */}
        <group position={[0, -0.05, 0.88]} scale={0.55}>
          <MiniHeart color="#F75A8A" scale={0.55} />
        </group>

        {/* ARMS */}
        <group ref={armL} position={[-0.72, 0.28, 0]}>
          <mesh castShadow position={[-0.12, -0.3, 0]} rotation={[0, 0, 0.35]}>
            <capsuleGeometry args={[0.2, 0.45, 8, 16]} />
            <meshStandardMaterial color={fur} roughness={0.65} />
          </mesh>
          <mesh position={[-0.22, -0.55, 0.05]}>
            <sphereGeometry args={[0.19, 20, 20]} />
            <meshStandardMaterial color={furDark} roughness={0.7} />
          </mesh>
        </group>
        <group ref={armR} position={[0.72, 0.28, 0]}>
          <mesh castShadow position={[0.12, -0.3, 0]} rotation={[0, 0, -0.35]}>
            <capsuleGeometry args={[0.2, 0.45, 8, 16]} />
            <meshStandardMaterial color={fur} roughness={0.65} />
          </mesh>
          <mesh position={[0.22, -0.55, 0.05]}>
            <sphereGeometry args={[0.19, 20, 20]} />
            <meshStandardMaterial color={furDark} roughness={0.7} />
          </mesh>
        </group>

        {/* LEGS */}
        <group ref={legL} position={[-0.36, -0.68, 0]}>
          <mesh castShadow position={[0, -0.18, 0.1]}>
            <capsuleGeometry args={[0.24, 0.3, 8, 16]} />
            <meshStandardMaterial color={fur} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.32, 0.32]} scale={[1, 0.75, 0.9]}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color={cream} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.32, 0.38]} scale={[0.55, 0.4, 0.3]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={furDark} roughness={0.8} />
          </mesh>
        </group>
        <group ref={legR} position={[0.36, -0.68, 0]}>
          <mesh castShadow position={[0, -0.18, 0.1]}>
            <capsuleGeometry args={[0.24, 0.3, 8, 16]} />
            <meshStandardMaterial color={fur} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.32, 0.32]} scale={[1, 0.75, 0.9]}>
            <sphereGeometry args={[0.26, 20, 20]} />
            <meshStandardMaterial color={cream} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.32, 0.38]} scale={[0.55, 0.4, 0.3]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={furDark} roughness={0.8} />
          </mesh>
        </group>

        {/* HEAD */}
        <group ref={head} position={[0, 1.02, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.62, 32, 32]} />
            <meshStandardMaterial color={fur} roughness={0.65} />
          </mesh>
          {/* EARS */}
          <group position={[-0.45, 0.42, -0.05]}>
            <mesh castShadow>
              <sphereGeometry args={[0.24, 20, 20]} />
              <meshStandardMaterial color={fur} roughness={0.65} />
            </mesh>
            <mesh position={[0, 0.02, 0.14]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={cream} roughness={0.8} />
            </mesh>
          </group>
          <group position={[0.45, 0.42, -0.05]}>
            <mesh castShadow>
              <sphereGeometry args={[0.24, 20, 20]} />
              <meshStandardMaterial color={fur} roughness={0.65} />
            </mesh>
            <mesh position={[0, 0.02, 0.14]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={cream} roughness={0.8} />
            </mesh>
          </group>
          {/* BOW */}
          <group position={[0.48, 0.52, 0.18]} rotation={[0, 0.4, 0.2]}>
            <mesh position={[-0.11, 0, 0]} rotation={[0, 0, 0.5]}>
              <coneGeometry args={[0.11, 0.18, 4]} />
              <meshStandardMaterial color="#F75A8A" roughness={0.5} />
            </mesh>
            <mesh position={[0.11, 0, 0]} rotation={[0, 0, -0.5]}>
              <coneGeometry args={[0.11, 0.18, 4]} />
              <meshStandardMaterial color="#F75A8A" roughness={0.5} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#D63D6E" roughness={0.5} />
            </mesh>
          </group>

          {/* EYES */}
          <mesh ref={eyeL} position={[-0.22, 0.12, 0.5]}>
            <sphereGeometry args={[0.095, 20, 20]} />
            <meshStandardMaterial color="#2B1A12" roughness={0.2} />
          </mesh>
          <mesh ref={eyeR} position={[0.22, 0.12, 0.5]}>
            <sphereGeometry args={[0.095, 20, 20]} />
            <meshStandardMaterial color="#2B1A12" roughness={0.2} />
          </mesh>
          <mesh position={[-0.19, 0.16, 0.58]}>
            <sphereGeometry args={[0.032, 12, 12]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh position={[0.25, 0.16, 0.58]}>
            <sphereGeometry args={[0.032, 12, 12]} />
            <meshBasicMaterial color="white" />
          </mesh>
          {/* BLUSH */}
          <mesh position={[-0.38, -0.08, 0.44]} scale={[1, 0.65, 0.4]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#FF8FA3" roughness={0.9} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0.38, -0.08, 0.44]} scale={[1, 0.65, 0.4]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#FF8FA3" roughness={0.9} transparent opacity={0.85} />
          </mesh>
          {/* MUZZLE */}
          <mesh position={[0, -0.15, 0.42]} scale={[1, 0.72, 0.62]}>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial color={cream} roughness={0.8} />
          </mesh>
          {/* NOSE */}
          <mesh position={[0, -0.06, 0.62]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshStandardMaterial color="#4A2C1F" roughness={0.4} />
          </mesh>
          <mesh position={[0.02, -0.04, 0.67]}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshBasicMaterial color="white" />
          </mesh>
          {/* MOUTH */}
          <mesh position={[-0.07, -0.24, 0.58]} rotation={[0, 0, Math.PI * 0.08]}>
            <torusGeometry args={[0.09, 0.018, 10, 20, Math.PI]} />
            <meshStandardMaterial color="#4A2C1F" roughness={0.6} />
          </mesh>
          <mesh position={[0.07, -0.24, 0.58]} rotation={[0, 0, Math.PI * 0.92]}>
            <torusGeometry args={[0.09, 0.018, 10, 20, Math.PI]} />
            <meshStandardMaterial color="#4A2C1F" roughness={0.6} />
          </mesh>
          {/* SINGING MOUTH */}
          <mesh ref={mouth} position={[0, -0.3, 0.58]} visible={false}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#4A2C1F" roughness={0.45} />
          </mesh>
        </group>

        {/* MUSIC NOTES */}
        <group ref={notes} visible={false}>
          {[0, 1, 2, 3, 4].map((i) => (
            <group key={i} position={[0.4, 1.6, 0.3]}>
              <mesh>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial color={i % 2 ? "#F75A8A" : "#EAB16E"} roughness={0.4} />
              </mesh>
              <mesh position={[0.06, 0.22, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.4, 8]} />
                <meshStandardMaterial color={i % 2 ? "#F75A8A" : "#EAB16E"} roughness={0.4} />
              </mesh>
              <mesh position={[0.14, 0.38, 0]} rotation={[0, 0, -0.5]}>
                <boxGeometry args={[0.16, 0.07, 0.03]} />
                <meshStandardMaterial color={i % 2 ? "#F75A8A" : "#EAB16E"} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>

        {/* HELD HEART */}
        <group ref={heldHeart} position={[0, 0.12, 0.95]}>
          <MiniHeart color={mode === "sad" ? "#C9B8C5" : "#F75A8A"} scale={0.9} />
        </group>
      </group>
    </group>
  );
}

function GiftBox() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.y = 0.35 + Math.sin(t * 2) * 0.06;
      ref.current.rotation.y = Math.sin(t * 0.7) * 0.2;
    }
  });
  return (
    <group ref={ref} position={[2.1, 0.35, 0.4]}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.55, 0.7]} />
        <meshStandardMaterial color="#F75A8A" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.78, 0.14, 0.78]} />
        <meshStandardMaterial color="#D63D6E" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.16, 0.6, 0.74]} />
        <meshStandardMaterial color="#FFE4EC" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.74, 0.6, 0.16]} />
        <meshStandardMaterial color="#FFE4EC" roughness={0.6} />
      </mesh>
      <group position={[0, 0.52, 0]}>
        <mesh position={[-0.12, 0, 0]} rotation={[0, 0, 0.6]}>
          <torusGeometry args={[0.12, 0.045, 12, 24]} />
          <meshStandardMaterial color="#FFE4EC" roughness={0.5} />
        </mesh>
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, -0.6]}>
          <torusGeometry args={[0.12, 0.045, 12, 24]} />
          <meshStandardMaterial color="#FFE4EC" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export default function TeddyScene({
  mode,
  hearts = 16,
}: {
  mode: TeddyMode;
  hearts?: number;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 2.6, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#fff5f7", "#f6c88f", 0.7]} />
      <directionalLight
        position={[4, 7, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color="#fff2e2"
      />
      <pointLight position={[-4, 3, 3]} intensity={12} color="#FDA4BA" distance={12} />
      <pointLight position={[3, 2, -2]} intensity={8} color="#7DD3E0" distance={10} />

      {/* ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <circleGeometry args={[7.5, 48]} />
        <meshStandardMaterial color="#FFE9F0" roughness={1} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.34, 0]}>
        <ringGeometry args={[2.1, 2.35, 48]} />
        <meshBasicMaterial color="#FECDD8" transparent opacity={0.9} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.33, 0]}>
        <ringGeometry args={[3.2, 3.3, 48]} />
        <meshBasicMaterial color="white" transparent opacity={0.7} />
      </mesh>

      <TeddyBear mode={mode} />
      {(mode === "idle" || mode === "dance") && <GiftBox />}

      <FloatingHearts count={hearts} active={mode !== "sad"} />

      <Cloud position={[-4.5, 4.2, -3]} scale={1.1} />
      <Cloud position={[4.2, 5, -4]} scale={1.4} />
      <Cloud position={[0.5, 5.6, -6]} scale={0.9} />

      <Sparkles count={70} scale={[12, 6, 6]} position={[0, 3, -2]} size={4} speed={0.5} color="#F9A8B8" opacity={0.8} />
      <Sparkles count={30} scale={[10, 4, 4]} position={[0, 1.5, 1]} size={6} speed={0.8} color="#FFE58A" opacity={0.9} />

      <ContactShadows position={[0, -0.33, 0]} opacity={0.32} scale={12} blur={2.6} far={4} color="#C96A8A" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.9}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
        target={[0, 1.4, 0]}
        makeDefault
      />
    </Canvas>
  );
}
