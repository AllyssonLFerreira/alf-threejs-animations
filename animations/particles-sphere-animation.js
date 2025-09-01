import * as THREE from "three";

function fibonacci(n) {
    return (n <= 1) ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

export function particlesSphereAnimation(container, options = {}) {
    // --- Opções Padrão ---
    const numParticles = options.numParticles !== undefined ? options.numParticles : 222222;
    const particleSize = options.particleSize !== undefined ? options.particleSize : 2;
    const sphereRadius = options.sphereRadius !== undefined ? options.sphereRadius : 400;
    const cameraZ = options.cameraZ !== undefined ? options.cameraZ : 500;
    const spriteUrl = options.spriteUrl !== undefined ? options.spriteUrl : 'https://threejs.org/examples/textures/sprites/circle.png';
    const alphaTestValue = options.alphaTest !== undefined ? options.alphaTest : 0.5;
    const cameraOrbitRadius = options.cameraOrbitRadius !== undefined ? options.cameraOrbitRadius : 750;
    const thresholdDistance = options.thresholdDistance !== undefined ? options.thresholdDistance : 100;

    // REMOVIDO: Variáveis particleColorOption e usePositionColoring

    // --- Cena, Câmera, Renderizador ---
    const scene = new THREE.Scene();

    // >>> Definir Cor de Fundo <<<
    scene.background = new THREE.Color(0x1a1717); // Cor #1a1717

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = cameraZ;
    const renderer = new THREE.WebGLRenderer();
    // >>> Opcional: Limpar cor do renderer se o fundo da cena for suficiente <<<
    // renderer.setClearColor(0x000000, 0); // Se quiser fundo transparente no canvas
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // --- Geometria e Cores ---
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    let fibonacciIndex = 0;

    for (let i = 0; i < numParticles; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = sphereRadius;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        positions.push(x, y, z);

        const color = new THREE.Color();

        // --- Lógica de Cor HSL Ajustada ---
        // Mantém a variação do matiz (H) com base na posição x
        const h = ((x / sphereRadius) + 1) / 2; // Normaliza x para [0, 1]
        // Ajusta Saturação (S) e Luminosidade (L) para o tom #ede5ce
        const s = 0.35; // Saturação baixa para cor 'lavada'/bege
        const l = 0.8; // Luminosidade alta para cor clara
        color.setHSL(h, s, l);
        // --- Fim da Lógica de Cor ---

        colors.push(color.r, color.g, color.b);

        // --- Pontos Fibonacci Extras ---
        if (i % 5 === 0) {
            const fibFactor = (fibonacciIndex % 10) + 1;
            const fibValue = fibonacci(fibFactor) / 200;
            const dx = fibValue * Math.sin(theta + phi);
            const dy = fibValue * Math.cos(theta + phi);
            const dz = fibValue * Math.sin(theta - phi);
            const fx = x + dx;
            const fy = y + dy;
            const fz = z + dz;
            positions.push(fx, fy, fz);
            fibonacciIndex++;

            // Recalcula a cor HSL para a nova posição (fx) com os mesmos S e L
            const fh = ((fx / sphereRadius) + 1) / 2; // Usa a posição x do ponto fibonacci
            // Usa os mesmos s e l definidos acima
            color.setHSL(fh, s, l);
            colors.push(color.r, color.g, color.b);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // --- Material (vertexColors: true é essencial) ---
    const material = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true, // Crucial para usar as cores do atributo 'color'
        alphaTest: alphaTestValue,
        transparent: true, // Mantenha transparente para ver o fundo escuro
        depthWrite: false,
        blending: THREE.AdditiveBlending, // Pode ajustar se necessário (Additive fica bom em fundos escuros)
        map: new THREE.TextureLoader().load(spriteUrl)
    });

    // --- Sistema de Partículas ---
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- Animação e Redimensionamento (sem alterações) ---
    function animate() {
        requestAnimationFrame(animate);
        const time = performance.now() * 0.0005;
        const positionsArray = geometry.attributes.position.array;

        // ... (lógica de movimento das partículas - sem alterações) ...
         for (let i = 0; i < positionsArray.length; i += 3) {
            let x = positionsArray[i];
            let y = positionsArray[i + 1];
            let z = positionsArray[i + 2];

             // Pula pontos "removidos"
             if (x > 9000) continue;

            const r = Math.sqrt(x * x + y * y + z * z);
            // Evita divisão por zero ou valores muito pequenos
             if (r < 0.01) continue;

            const force = new THREE.Vector3(-x, -y, -z).multiplyScalar(1000 / (r * r * r));

            const rotation = new THREE.Euler(
                y * 0.01,
                x * 0.01 + time,
                0
            );

            const position = new THREE.Vector3(x, y, z)
                .add(force)
                .applyEuler(rotation);

            const camPos = camera.position;
            const dx = position.x - camPos.x;
            const dy = position.y - camPos.y;
            const dz = position.z - camPos.z;
            const distanceFromCameraSq = dx * dx + dy * dy + dz * dz; // Use quadrado para performance

            if (distanceFromCameraSq < thresholdDistance * thresholdDistance) {
                positionsArray[i] = 9999; // Marca para ignorar (melhor que mudar tamanho)
                positionsArray[i + 1] = 9999;
                positionsArray[i + 2] = 9999;
            } else {
                positionsArray[i] = position.x;
                positionsArray[i + 1] = position.y;
                positionsArray[i + 2] = position.z;
            }
        }
        // ... (fim da lógica de movimento) ...

        geometry.attributes.position.needsUpdate = true;

        camera.position.x = cameraOrbitRadius * Math.sin(time * 0.5) * Math.cos(time * 0.3);
        camera.position.y = cameraOrbitRadius * Math.sin(time * 0.5) * Math.sin(time * 0.3);
        camera.position.z = cameraOrbitRadius * Math.cos(time * 0.5);
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate();
    window.addEventListener('resize', onWindowResize, false);

    return { scene, camera, renderer, particles };
}