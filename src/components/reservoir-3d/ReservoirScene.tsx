"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.9, 8]} />
        <meshStandardMaterial color="#75492e" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <icosahedronGeometry args={[0.48, 2]} />
        <meshStandardMaterial color="#3f784b" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Water({ level, color }: { level: number; color: string }) {
  const geometry = useMemo(() => {
    // Normaliza o nível entre 0 e 100
    const clampedLevel = Math.max(0, Math.min(100, level));
    const width = 0.58 + clampedLevel * 0.005;
    const reach = 0.72 + clampedLevel * 0.003;
    const depth = 0.08 + clampedLevel * 0.0075;
    const s = new THREE.Shape();

    // A borda de jusante permanece fixa junto à barragem em qualquer volume
    s.moveTo(-2.35 * width, -2.08);
    s.bezierCurveTo(-2.55 * width, -1.25, -1.92 * width, -0.55, -2.38 * width, 0.18 * reach);
    s.bezierCurveTo(-2.82 * width, 0.85 * reach, -2.05 * width, 1.45 * reach, -2.22 * width, 2.05 * reach);
    s.bezierCurveTo(-2.38 * width, 2.72 * reach, -1.28 * width, 3.18 * reach, -0.48 * width, 3.48 * reach);
    s.bezierCurveTo(0.35 * width, 3.72 * reach, 1.02 * width, 3.42 * reach, 1.18 * width, 2.96 * reach);
    s.bezierCurveTo(1.38 * width, 2.42 * reach, 2.42 * width, 2.25 * reach, 2.18 * width, 1.54 * reach);
    s.bezierCurveTo(1.98 * width, 0.92 * reach, 2.68 * width, 0.4 * reach, 2.35 * width, -0.3);
    s.bezierCurveTo(2.1 * width, -0.9, 2.56 * width, -1.48, 2.36 * width, -2.08);
    s.lineTo(-2.35 * width, -2.08);

    return new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 2,
      curveSegments: 32,
    });
  }, [level]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.34, -1.1]} receiveShadow>
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.85}
        roughness={0.08}
        metalness={0.05}
        transmission={0.2}
        thickness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function BasinFloor() {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.55, -2.18);
    s.bezierCurveTo(-2.78, -1.28, -2.12, -0.55, -2.62, 0.2);
    s.bezierCurveTo(-3.02, 0.9, -2.28, 1.5, -2.42, 2.15);
    s.bezierCurveTo(-2.58, 2.9, -1.42, 3.42, -0.52, 3.72);
    s.bezierCurveTo(0.42, 4, 1.25, 3.62, 1.4, 3.12);
    s.bezierCurveTo(1.58, 2.55, 2.66, 2.38, 2.4, 1.6);
    s.bezierCurveTo(2.18, 0.92, 2.92, 0.38, 2.55, -0.35);
    s.bezierCurveTo(2.3, -0.98, 2.78, -1.55, 2.56, -2.18);
    s.lineTo(-2.55, -2.18);
    return new THREE.ExtrudeGeometry(s, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSize: 0.06,
      bevelThickness: 0.04,
      bevelSegments: 2,
      curveSegments: 32,
    });
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.04, -1.1]}
      scale={[0.42, 0.58, 1]}
      receiveShadow
    >
      <meshStandardMaterial color="#b59a69" roughness={1} />
    </mesh>
  );
}

function ValleyTerrain() {
  const geometry = useMemo(() => {
    const outer = new THREE.Shape();
    outer.moveTo(-5.7, -2.7);
    outer.lineTo(3.15, -2.7);
    outer.lineTo(3.15, -1.7);
    outer.lineTo(2.22, -1.7);
    outer.lineTo(2.22, -0.82);
    outer.lineTo(4.3, -0.82);
    outer.lineTo(4.3, -2.7);
    outer.lineTo(5.7, -2.7);
    outer.lineTo(5.7, 4.45);
    outer.lineTo(-5.7, 4.45);
    outer.closePath();

    const hole = new THREE.Path();
    hole.moveTo(-2.78, -2.3);
    hole.bezierCurveTo(-3.02, -1.3, -2.35, -0.58, -2.86, 0.18);
    hole.bezierCurveTo(-3.28, 0.94, -2.5, 1.62, -2.67, 2.28);
    hole.bezierCurveTo(-2.82, 3.08, -1.58, 3.66, -0.58, 3.98);
    hole.bezierCurveTo(0.48, 4.28, 1.47, 3.82, 1.62, 3.24);
    hole.bezierCurveTo(1.82, 2.66, 2.92, 2.52, 2.66, 1.68);
    hole.bezierCurveTo(2.43, 0.94, 3.18, 0.35, 2.8, -0.42);
    hole.bezierCurveTo(2.52, -1.08, 3.02, -1.68, 2.79, -2.3);
    hole.lineTo(-2.78, -2.3);
    hole.closePath();

    outer.holes.push(hole);
    return new THREE.ExtrudeGeometry(outer, {
      depth: 1.05,
      bevelEnabled: false,
      curveSegments: 36,
    });
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.08, -1.1]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#5f9257" roughness={1} />
    </mesh>
  );
}

function BasinSlopes() {
  const geometry = useMemo(() => {
    const contour = new THREE.Shape();
    contour.moveTo(-2.78, -2.3);
    contour.bezierCurveTo(-3.02, -1.3, -2.35, -0.58, -2.86, 0.18);
    contour.bezierCurveTo(-3.28, 0.94, -2.5, 1.62, -2.67, 2.28);
    contour.bezierCurveTo(-2.82, 3.08, -1.58, 3.66, -0.58, 3.98);
    contour.bezierCurveTo(0.48, 4.28, 1.47, 3.82, 1.62, 3.24);
    contour.bezierCurveTo(1.82, 2.66, 2.92, 2.52, 2.66, 1.68);
    contour.bezierCurveTo(2.43, 0.94, 3.18, 0.35, 2.8, -0.42);
    contour.bezierCurveTo(2.52, -1.08, 3.02, -1.68, 2.79, -2.3);
    contour.lineTo(-2.78, -2.3);

    const outer = contour.getSpacedPoints(128);
    const positions: number[] = [];
    const indices: number[] = [];

    for (const point of outer) {
      positions.push(point.x, 1.08, -point.y - 1.1);
      // Talude a ~25° de inclinação natural
      positions.push(point.x * 0.42, 0.25, -(point.y * 0.58) - 1.1);
    }

    const n = outer.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const a = i * 2;
      const b = a + 1;
      const c = j * 2;
      const d = c + 1;
      indices.push(a, c, b, c, d, b);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#8da96b" roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ReleasedRiver({ level, color }: { level: number; color: string }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.8, 0.5, 1.92),
      new THREE.Vector3(-0.35, 0.49, 2.65),
      new THREE.Vector3(0.45, 0.47, 3.25),
      new THREE.Vector3(-0.18, 0.45, 4.15),
      new THREE.Vector3(0.18, 0.43, 5.7),
    ]);
    const points = curve.getPoints(52);
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const base = 0.09 + level * 0.0022;

    points.forEach((point, i) => {
      const tangent = curve.getTangent(i / (points.length - 1));
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const width = base * (0.65 + (i / (points.length - 1)) * 0.7);
      const left = point.clone().addScaledVector(side, width);
      const right = point.clone().addScaledVector(side, -width);

      positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, i / (points.length - 1), 1, i / (points.length - 1));

      if (i < points.length - 1) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        indices.push(a, c, b, c, d, b);
      }
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [level]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.9}
        roughness={0.15}
        metalness={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Model({
  level,
  color,
  releasing,
}: {
  level: number;
  color: string;
  releasing: boolean;
}) {
  return (
    <group rotation={[0, -0.12, 0]}>
      {/* Base sólida do terreno */}
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <boxGeometry args={[12, 1.3, 10]} />
        <meshStandardMaterial color="#9a7a48" roughness={1} />
      </mesh>

      <ValleyTerrain />

      {/* Platôs e topo do vertedouro */}
      <mesh position={[3.72, 0.665, 1.35]} rotation={[-Math.PI / 2, 0, 0.06]} receiveShadow>
        <planeGeometry args={[1.12, 3.1]} />
        <meshStandardMaterial color="#5f9257" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[3.1, 0.665, 0.18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.62, 0.76]} />
        <meshStandardMaterial color="#5f9257" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      <BasinSlopes />
      <BasinFloor />
      <Water level={level} color={color} />

      {/* Barragem Principal */}
      <mesh position={[0, 1.05, 1.45]} castShadow receiveShadow>
        <boxGeometry args={[8.1, 1.35, 0.9]} />
        <meshStandardMaterial color="#b66c2f" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.77, 1.45]} castShadow>
        <boxGeometry args={[8.25, 0.16, 0.9]} />
        <meshStandardMaterial color="#df9a52" />
      </mesh>

      {/* Tubulação e Válvula da Descarga de Fundo */}
      <mesh position={[-0.8, 0.62, 1.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.2, 20]} />
        <meshStandardMaterial color="#777c78" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[-0.8, 0.62, 1.98]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.2, 0.055, 10, 24]} />
        <meshStandardMaterial color="#555b59" metalness={0.45} roughness={0.48} />
      </mesh>

      {/* Água saindo da descarga de fundo */}
      {releasing && (
        <mesh position={[-0.8, 0.62, 2.02]}>
          <circleGeometry args={[0.16, 20]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      )}
      {releasing && <ReleasedRiver level={level} color={color} />}

      {/* Vertedouro (Calha e soleira) */}
      <mesh position={[3.72, 0.87, 1.35]} rotation={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.82, 0.38, 3.05]} />
        <meshStandardMaterial color="#8e9996" />
      </mesh>
      <mesh position={[3.1, 0.87, 0.18]} castShadow>
        <boxGeometry args={[1.55, 0.36, 0.72]} />
        <meshStandardMaterial color="#8e9996" />
      </mesh>

      {/* Água vertendo se nível for >= 99% (Sangria) */}
      {level >= 99 && (
        <>
          <mesh position={[3.72, 1.075, 1.35]} rotation={[-Math.PI / 2, 0, 0.06]}>
            <planeGeometry args={[0.48, 2.8]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[3.1, 1.075, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.3, 0.42]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Torre de Controle da Barragem */}
      <mesh position={[-0.8, 1.45, 0.75]} castShadow>
        <cylinderGeometry args={[0.28, 0.38, 1.35, 16]} />
        <meshStandardMaterial color="#d8d3c5" />
      </mesh>
      <mesh position={[-0.8, 2.15, 0.75]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.18, 16]} />
        <meshStandardMaterial color="#696b66" />
      </mesh>

      {/* Vegetação / Árvores decorativas nas margens */}
      {[
        [-5, -3.4],
        [-4.6, 2.9],
        [-3.6, -4],
        [3.8, -3.8],
        [5, -1.5],
        [4.9, 3.5],
        [-4.5, 4],
      ].map(([x, z], i) => (
        <Tree key={i} position={[x, z > 1.6 ? 0.02 : 1.12, z]} scale={0.8 + (i % 3) * 0.14} />
      ))}
    </group>
  );
}

export default function ReservoirScene({
  level,
  color,
  releasing,
}: {
  level: number;
  color: string;
  releasing: boolean;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [10, 9, 12], fov: 42 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true }}
      className="w-full h-full"
    >
      {/* Céu limpo e iluminado sem neblina escura */}
      <color attach="background" args={["#eaf3f7"]} />
      <fog attach="fog" args={["#eaf3f7", 22, 45]} />
      <ambientLight intensity={1.25} />
      <directionalLight
        position={[7, 12, 8]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Model level={level} color={color} releasing={releasing} />
      <OrbitControls
        target={[0, 0.3, 0]}
        minDistance={8}
        maxDistance={25}
        minPolarAngle={0.4}
        maxPolarAngle={1.42}
        enablePan={false}
      />
    </Canvas>
  );
}
