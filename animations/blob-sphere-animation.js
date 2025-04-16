import * as THREE from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

export function blobSphereAnimation(container, options = {}) {
    let scene, camera, renderer, controls, particles;
    const noise = new ImprovedNoise();
    const boundingSphereRadius = 1.2;
    const basePointSize = 0.0038;

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color("#000000");

        camera = new THREE.PerspectiveCamera(
            75,
            container.offsetWidth / container.offsetHeight,
            0.1,
            1000
        );

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(renderer.domElement);

        //controls = new OrbitControls(camera, renderer.domElement);
        //controls.autoRotate = false;

        const colorStart = new THREE.Color("#1A76D2");
        const colorEnd = new THREE.Color("#0041EA");

        const radius = 1;
        const widthSegments = 512;
        const heightSegments = 512;
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const numVertices = geometry.attributes.position.count;
        const positions = new Float32Array(numVertices * 3);
        const colors = new Float32Array(numVertices * 3); // Agora o tamanho de colors é correto
        const sizes = new Float32Array(numVertices);

        const vertex = new THREE.Vector3();
        const normalizedVertex = new THREE.Vector3();

        for (let i = 0; i < numVertices; i++) {
            vertex.fromBufferAttribute(geometry.attributes.position, i);
            positions[i * 3] = vertex.x;
            positions[i * 3 + 1] = vertex.y;
            positions[i * 3 + 2] = vertex.z;

            normalizedVertex.copy(vertex).normalize();
            const gradientFactor = (normalizedVertex.y + 1) / 2; // Mapeia a coordenada Y (-1 a 1) para um fator de 0 a 1

            const interpolatedColor = new THREE.Color();
            interpolatedColor.lerpColors(colorStart, colorEnd, gradientFactor);
            interpolatedColor.toArray(colors, i * 3);

            const sizeVariation = 0.5 + Math.sin(vertex.x * 5 + vertex.y * 5 + vertex.z * 5) * 0.5;
            sizes[i] = basePointSize * (0.8 + sizeVariation * 0.4);
        }

        const pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pointGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        pointGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: basePointSize,
            vertexColors: true,
            sizeAttenuation: true
        });

        particles = new THREE.Points(pointGeometry, material);
        scene.add(particles);

        camera.position.z = 2;
    }

    function onWindowResize() {
        console.log("Resizing to:", container.offsetWidth, container.offsetHeight); // Adicione esta linha
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    function update() {
        const time = performance.now() * 0.001;
        const positions = particles.geometry.attributes.position.array;
        const sizes = particles.geometry.attributes.size.array;
        let vertex = new THREE.Vector3();

        for (let i = 0; i < positions.length; i += 3) {
            vertex.set(positions[i], positions[i + 1], positions[i + 2]);
            const displacement = 0.3 * noise.noise(vertex.x * 2 + time * 1.0, vertex.y * 2 + time * 1.0, vertex.z * 2 + time * 1.0);
            vertex.normalize().multiplyScalar(1 + displacement);

            if (vertex.length() > boundingSphereRadius) {
                vertex.normalize().multiplyScalar(boundingSphereRadius);
            }

            positions[i] = vertex.x;
            positions[i + 1] = vertex.y;
            positions[i + 2] = vertex.z;

            const timeScale = 2.0;
            const sizeVariation = 0.5 + Math.sin(vertex.x * 5 + vertex.y * 5 + vertex.z * 5 + time * timeScale) * 0.5;
            sizes[i] = basePointSize * (0.8 + sizeVariation * 0.4);
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.size.needsUpdate = true;
    }

    function animate() {
        requestAnimationFrame(animate);
        //controls.update();
        update();
        renderer.render(scene, camera);
    }

    init();
    animate();

    return {
        scene,
        camera,
        renderer,
        stop: () => {
            window.removeEventListener('resize', onWindowResize);
            renderer.dispose();
            particles.geometry.dispose();
            particles.material.dispose();
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
            scene = null;
            camera = null;
            renderer = null;
            particles = null;
        }
    };
}