import * as THREE from "three";

function fibonacci(n) {
    return (n <= 1) ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

export function particlesSphereAnimation(container, options = {}) {
    // Opções padrão
    const numParticles = options.numParticles !== undefined ? options.numParticles : 222222;
    const particleSize = options.particleSize !== undefined ? options.particleSize : 2;
    const sphereRadius = options.sphereRadius !== undefined ? options.sphereRadius : 400;
    const cameraZ = options.cameraZ !== undefined ? options.cameraZ : 500;
    const spriteUrl = options.spriteUrl !== undefined ? options.spriteUrl : 'https://threejs.org/examples/textures/sprites/circle.png';
    const alphaTestValue = options.alphaTest !== undefined ? options.alphaTest : 0.5;
    const cameraOrbitRadius = options.cameraOrbitRadius !== undefined ? options.cameraOrbitRadius : 750;
    const thresholdDistance = options.thresholdDistance !== undefined ? options.thresholdDistance : 100;

    // Criar cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = cameraZ;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Geometria das partículas
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
        color.setHSL((x + 500) / 1000, 0.5, 0.5);
        colors.push(color.r, color.g, color.b);

        if (i % 5 === 0) {
            const fibFactor = (fibonacciIndex % 10) + 1;
            const fibValue = fibonacci(fibFactor) / 200;
            const dx = fibValue * Math.sin(theta + phi);
            const dy = fibValue * Math.cos(theta + phi);
            const dz = fibValue * Math.sin(theta - phi);
            positions.push(x + dx, y + dy, z + dz);
            fibonacciIndex++;

            color.setHSL((x + dx + 500) / 1000, 0.5, 0.5);
            colors.push(color.r, color.g, color.b);
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Material das partículas
    const material = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true,
        alphaTest: alphaTestValue,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: new THREE.TextureLoader().load(spriteUrl)
    });

    // Criar sistema de partículas
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animação
    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.0005;
        const positionsArray = geometry.attributes.position.array;

        for (let i = 0; i < positionsArray.length; i += 3) {
            let x = positionsArray[i];
            let y = positionsArray[i + 1];
            let z = positionsArray[i + 2];

            const r = Math.sqrt(x * x + y * y + z * z);
            const force = new THREE.Vector3(-x, -y, -z).multiplyScalar(1000 / (r * r * r));

            const rotation = new THREE.Euler(
                y * 0.01,
                x * 0.01 + time,
                0
            );

            const position = new THREE.Vector3(x, y, z)
                .add(force)
                .applyEuler(rotation);

            const distanceFromCamera = new THREE.Vector3(
                position.x - camera.position.x,
                position.y - camera.position.y,
                position.z - camera.position.z
            ).length();

            if (distanceFromCamera < thresholdDistance) {
                positionsArray[i] = 9999;
                positionsArray[i + 1] = 9999;
                positionsArray[i + 2] = 9999;
            } else {
                positionsArray[i] = position.x;
                positionsArray[i + 1] = position.y;
                positionsArray[i + 2] = position.z;
            }
        }

        geometry.attributes.position.needsUpdate = true;

        camera.position.x = cameraOrbitRadius * Math.sin(time * 0.5) * Math.cos(time * 0.3);
        camera.position.y = cameraOrbitRadius * Math.sin(time * 0.5) * Math.sin(time * 0.3);
        camera.position.z = cameraOrbitRadius * Math.cos(time * 0.5);
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    // Função para lidar com o redimensionamento da janela
    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    return { scene, camera, renderer, particles };
}