"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export type DroughtStateType = "Normal" | "Alerta" | "Seca" | "Seca Severa";

export interface LandscapeTheme {
  foliageColor: string;
  trunkColor: string;
  valleyTerrainColor: string;
  valleyShouldersColor: string;
  basinSlopesColor: string;
  basinFloorColor: string;
  downstreamGroundColor: string;
  bedrockColor: string;
  skyColor: string;
  fogColor: string;
}

const LANDSCAPE_THEMES: Record<DroughtStateType, LandscapeTheme> = {
  Normal: {
    foliageColor: "#3f784b", // Verde vivo
    trunkColor: "#75492e",
    valleyTerrainColor: "#5f9257",
    valleyShouldersColor: "#5f9257",
    basinSlopesColor: "#8da96b",
    basinFloorColor: "#b59a69",
    downstreamGroundColor: "#78a86f",
    bedrockColor: "#9a7a48",
    skyColor: "#dcecf1",
    fogColor: "#dcecf1",
  },
  Alerta: {
    foliageColor: "#688636", // Verde oliva / início da estiagem
    trunkColor: "#704d2f",
    valleyTerrainColor: "#7c9354",
    valleyShouldersColor: "#7c9354",
    basinSlopesColor: "#9fa468",
    basinFloorColor: "#bfa370",
    downstreamGroundColor: "#8ea667",
    bedrockColor: "#9a7b49",
    skyColor: "#dfe9ec",
    fogColor: "#dfe9ec",
  },
  Seca: {
    foliageColor: "#967f39", // Folhagem seca / ocre da Caatinga
    trunkColor: "#6a5035",
    valleyTerrainColor: "#9e9156",
    valleyShouldersColor: "#9e9156",
    basinSlopesColor: "#b09f66",
    basinFloorColor: "#c7ab77",
    downstreamGroundColor: "#9c945c",
    bedrockColor: "#987c4c",
    skyColor: "#e8e1d3",
    fogColor: "#e8e1d3",
  },
  "Seca Severa": {
    foliageColor: "#6b5a45", // Caatinga cinzenta / seca extrema
    trunkColor: "#594633",
    valleyTerrainColor: "#8c7855",
    valleyShouldersColor: "#8c7855",
    basinSlopesColor: "#99845f",
    basinFloorColor: "#a38c64",
    downstreamGroundColor: "#857656",
    bedrockColor: "#8f7347",
    skyColor: "#ecdcc9", // Atmosfera árida e empoeirada
    fogColor: "#ecdcc9",
  },
};

function Tree({
  position,
  scale = 1,
  foliageColor,
  trunkColor,
}: {
  position: [number, number, number];
  scale?: number;
  foliageColor: string;
  trunkColor: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.9, 8]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <icosahedronGeometry args={[0.48, 2]} />
        <meshStandardMaterial color={foliageColor} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Water({ level, color }: { level: number; color: string }) {
  const geometry = useMemo(() => {
    const clampedLevel = Math.max(0, Math.min(100, level));
    const width = 0.58 + clampedLevel * 0.005;
    const reach = 0.72 + clampedLevel * 0.003;
    const depth = 0.08 + clampedLevel * 0.0075;
    const s = new THREE.Shape();

    // A borda de jusante permanece fixa junto à barragem em qualquer volume.
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
        opacity={0.82}
        roughness={0.1}
        metalness={0.03}
        transmission={0.14}
        thickness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function BasinFloor({ color }: { color: string }) {
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
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -1.1]} scale={[0.42, 0.58, 1]} receiveShadow>
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

function ValleyTerrain({ color }: { color: string }) {
  const geometry = useMemo(() => {
    const outer = new THREE.Shape();
    outer.moveTo(-6.2, -2.7);
    outer.lineTo(6.2, -2.7);
    outer.lineTo(6.2, 4.8);
    outer.lineTo(-6.2, 4.8);
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
      bevelEnabled: true,
      bevelSize: 0.08,
      bevelThickness: 0.06,
      bevelSegments: 2,
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
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

function ValleyShoulders({ color }: { color: string }) {
  const geometries = useMemo(() => {
    const left = new THREE.Shape();
    left.moveTo(-6.08, -2.65);
    left.lineTo(-3.35, -2.65);
    left.bezierCurveTo(-3.28, -1.55, -3.55, -0.5, -3.35, 0.55);
    left.bezierCurveTo(-3.18, 1.55, -3.28, 2.65, -3.72, 3.55);
    left.bezierCurveTo(-4.02, 4.15, -4.48, 4.55, -4.95, 4.68);
    left.lineTo(-6.08, 4.68);
    left.closePath();

    const right = new THREE.Shape();
    right.moveTo(3.25, -2.65);
    right.lineTo(6.08, -2.65);
    right.lineTo(6.08, 4.68);
    right.lineTo(4.95, 4.68);
    right.bezierCurveTo(4.48, 4.55, 4.02, 4.15, 3.72, 3.55);
    right.bezierCurveTo(3.28, 2.65, 3.18, 1.55, 3.35, 0.55);
    right.bezierCurveTo(3.55, -0.5, 3.28, -1.55, 3.25, -2.65);
    right.closePath();

    const options = {
      depth: 0.54,
      bevelEnabled: true,
      bevelSize: 0.07,
      bevelThickness: 0.04,
      bevelSegments: 2,
      curveSegments: 24,
    };
    return [new THREE.ExtrudeGeometry(left, options), new THREE.ExtrudeGeometry(right, options)];
  }, []);

  return (
    <group>
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 1.12, -1.1]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function BasinSlopes({ color }: { color: string }) {
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
      // Recuo médio de 1,78 m para 0,83 m de desnível: talude ≈ 25°
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
      <meshStandardMaterial color={color} roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ReleasedRiver({ level }: { level: number }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.8, 0.62, 1.98),
        new THREE.Vector3(-0.72, 0.28, 2.3),
        new THREE.Vector3(-0.35, 0.06, 2.65),
        new THREE.Vector3(0.45, 0.027, 3.3),
        new THREE.Vector3(-0.18, 0.023, 4.1),
        new THREE.Vector3(0.18, 0.02, 4.9),
      ],
      false,
      "centripetal"
    );

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
        color="#31aeca"
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
  theme,
}: {
  level: number;
  color: string;
  releasing: boolean;
  theme: LandscapeTheme;
}) {
  return (
    <group rotation={[0, -0.12, 0]}>
      {/* Base sólida do terreno */}
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <boxGeometry args={[13, 1.3, 12]} />
        <meshStandardMaterial color={theme.bedrockColor} roughness={1} />
      </mesh>

      <ValleyTerrain color={theme.valleyTerrainColor} />
      <ValleyShoulders color={theme.valleyShouldersColor} />

      {/* Cobertura do terreno a jusante, do pé da barragem até a borda */}
      <mesh position={[0, 0.012, 3.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[13, 4.4]} />
        <meshStandardMaterial color={theme.downstreamGroundColor} roughness={1} side={THREE.DoubleSide} />
      </mesh>

      <BasinSlopes color={theme.basinSlopesColor} />
      <BasinFloor color={theme.basinFloorColor} />
      <Water level={level} color={color} />

      {/* Barragem de concreto apoiada no solo e unida sob o vertedouro */}
      <mesh position={[-1.28, 0.8625, 1.45]} castShadow receiveShadow>
        <boxGeometry args={[5.54, 1.725, 0.9]} />
        <meshStandardMaterial color="#a8adab" roughness={0.9} />
      </mesh>
      <mesh position={[3.18, 0.8625, 1.45]} castShadow receiveShadow>
        <boxGeometry args={[1.74, 1.725, 0.9]} />
        <meshStandardMaterial color="#a8adab" roughness={0.9} />
      </mesh>
      <mesh position={[1.9, 0.5375, 1.45]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.075, 0.9]} />
        <meshStandardMaterial color="#a8adab" roughness={0.9} />
      </mesh>
      <mesh position={[-1.3175, 1.77, 1.45]} castShadow>
        <boxGeometry args={[5.615, 0.16, 0.9]} />
        <meshStandardMaterial color="#c5c9c7" roughness={0.82} />
      </mesh>
      <mesh position={[3.2175, 1.77, 1.45]} castShadow>
        <boxGeometry args={[1.815, 0.16, 0.9]} />
        <meshStandardMaterial color="#c5c9c7" roughness={0.82} />
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
      {releasing && (
        <mesh position={[-0.8, 0.62, 2.02]}>
          <circleGeometry args={[0.16, 20]} />
          <meshStandardMaterial color="#30b2d0" side={THREE.DoubleSide} />
        </mesh>
      )}
      {releasing && <ReleasedRiver level={level} />}

      {/* Canal reto em U do vertedouro */}
      <mesh position={[1.9, 1.135, 1.04]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 0.12, 2.42]} />
        <meshStandardMaterial color="#8e9996" />
      </mesh>
      <mesh position={[1.55, 1.365, 1.04]} castShadow>
        <boxGeometry args={[0.12, 0.34, 2.42]} />
        <meshStandardMaterial color="#8e9996" />
      </mesh>
      <mesh position={[2.25, 1.365, 1.04]} castShadow>
        <boxGeometry args={[0.12, 0.34, 2.42]} />
        <meshStandardMaterial color="#8e9996" />
      </mesh>
      {level >= 99 && (
        <mesh position={[1.9, 1.207, 1.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.56, 2.17]} />
          <meshStandardMaterial color="#32b6d3" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Torre de Controle da Tomada d'Água */}
      <mesh position={[-0.8, 1.45, 0.75]} castShadow>
        <cylinderGeometry args={[0.28, 0.38, 1.35, 16]} />
        <meshStandardMaterial color="#d8d3c5" />
      </mesh>
      <mesh position={[-0.8, 2.15, 0.75]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.18, 16]} />
        <meshStandardMaterial color="#696b66" />
      </mesh>

      {/* Vegetação / Árvores decorativas nas margens reativas à seca */}
      {[
        [-5, -3.4],
        [-4.6, 2.9],
        [-3.6, -4],
        [3.8, -3.8],
        [5, -1.5],
        [4.9, 3.5],
        [-4.5, 4],
      ].map(([x, z], i) => (
        <Tree
          key={i}
          position={[x, z > 1.6 ? 0.012 : 1.7, z]}
          scale={0.8 + (i % 3) * 0.14}
          foliageColor={theme.foliageColor}
          trunkColor={theme.trunkColor}
        />
      ))}
    </group>
  );
}

export default function ReservoirScene({
  level,
  color,
  releasing,
  droughtState = "Normal",
}: {
  level: number;
  color: string;
  releasing: boolean;
  droughtState?: DroughtStateType;
}) {
  const theme = useMemo(() => {
    return LANDSCAPE_THEMES[droughtState] || LANDSCAPE_THEMES.Normal;
  }, [droughtState]);

  return (
    <Canvas
      shadows
      camera={{ position: [10, 9, 12], fov: 42 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true }}
      className="w-full h-full"
    >
      <color attach="background" args={[theme.skyColor]} />
      <fog attach="fog" args={[theme.fogColor, 18, 34]} />
      <ambientLight intensity={1.15} />
      <directionalLight
        position={[7, 12, 8]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Model level={level} color={color} releasing={releasing} theme={theme} />
      <OrbitControls
        target={[0, 0.3, 0]}
        minDistance={10}
        maxDistance={24}
        minPolarAngle={0.45}
        maxPolarAngle={1.42}
        enablePan={false}
      />
    </Canvas>
  );
}
