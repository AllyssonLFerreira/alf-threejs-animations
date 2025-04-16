import * as THREE from "three";
import { TweenMax, Power1 } from "gsap";

export function cityAnimation(container, options = {}) {
    const scene = new THREE.Scene();
    const city = new THREE.Object3D();
    const smoke = new THREE.Object3D();
    const town = new THREE.Object3D();

    let createCarPosition = true;
    const uSpeed = 0.001;

    const fogColor = options.color || 0xF02050;
    scene.background = new THREE.Color(fogColor);
    scene.fog = new THREE.Fog(fogColor, 10, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    if (typeof renderer.setPixelRatio === 'function') {
        renderer.setPixelRatio(window.devicePixelRatio);
      }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
        20,
        container.clientWidth / container.clientHeight,
        1,
        500
    );
    camera.position.set(0,2, 14);

    function mathRandom(num = 8) {
        return -Math.random() * num + Math.random() * num;
    }
    
      function setTintColor() {
        return 0x000000;
    }

    function init() {
        const segments = 2;
        for (let i = 1; i < 100; i++) {
          const geometry = new THREE.BoxGeometry(1, 1, 1, segments, segments, segments);
          const material = new THREE.MeshStandardMaterial({
            color: setTintColor(),
            side: THREE.DoubleSide
          });
          const wmaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.03,
            side: THREE.DoubleSide
          });
    
          const cube = new THREE.Mesh(geometry, material);
          const wire = new THREE.Mesh(geometry, wmaterial);
          const floor = new THREE.Mesh(geometry, material);
          const wfloor = new THREE.Mesh(geometry, wmaterial);
    
          cube.add(wfloor);
          cube.castShadow = true;
          cube.receiveShadow = true;
    
          cube.rotationValue = 0.1 + Math.abs(mathRandom(8));
          cube.scale.y = 0.1 + Math.abs(mathRandom(8));
          floor.scale.y = 0.05;
    
          const cubeWidth = 0.9;
          cube.scale.x = cube.scale.z = cubeWidth + mathRandom(1 - cubeWidth);
          cube.position.x = Math.round(mathRandom());
          cube.position.z = Math.round(mathRandom());
    
          floor.position.set(cube.position.x, 0, cube.position.z);
    
          town.add(floor);
          town.add(cube);
        }
    
        // Partículas
        const gmaterial = new THREE.MeshToonMaterial({ color: 0xF89028, side: THREE.DoubleSide });
        const gparticular = new THREE.CircleGeometry(0.01, 3);
    
        for (let h = 0; h < 300; h++) {
          const particular = new THREE.Mesh(gparticular, gmaterial);
          particular.position.set(mathRandom(5), mathRandom(5), mathRandom(5));
          particular.rotation.set(mathRandom(), mathRandom(), mathRandom());
          smoke.add(particular);
        }
    
        // Plano base
        const pmaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            roughness: 10,       
            metalness: 0.6,
            opacity: 0.9,
            transparent: true
        });
        const pgeometry = new THREE.PlaneGeometry(60, 60);
        const pelement = new THREE.Mesh(pgeometry, pmaterial);
        pelement.rotation.x = -Math.PI / 2;
        pelement.position.y = -0.001;
        pelement.receiveShadow = true;
    
        city.add(pelement);
    }

      function createCars(cScale = 2, cPos = 20, cColor = 0xC03830) {
        const cMat = new THREE.MeshToonMaterial({ color: cColor, side: THREE.DoubleSide });
        const cGeo = new THREE.BoxGeometry(1, cScale / 40, cScale / 40);
        const cElem = new THREE.Mesh(cGeo, cMat);
        const cAmp = 3;
    
        if (createCarPosition) {
        createCarPosition = false;
          cElem.position.x = -cPos;
          cElem.position.z = mathRandom(cAmp);
    
          TweenMax.to(cElem.position, 3, {
            x: cPos,
            repeat: -1,
            yoyo: true,
            delay: mathRandom(3)
          });
        } else {
          createCarPosition = true;
          cElem.position.x = mathRandom(cAmp);
          cElem.position.z = -cPos;
          cElem.rotation.y = Math.PI / 2;
    
          TweenMax.to(cElem.position, 5, {
            z: cPos,
            repeat: -1,
            yoyo: true,
            delay: mathRandom(3),
            ease: Power1.easeInOut
          });
        }
    
        cElem.receiveShadow = true;
        cElem.castShadow = true;
        cElem.position.y = Math.abs(mathRandom(5));
        city.add(cElem);
      }
      
      function generateLines() {
        for (let i = 0; i < (options.carCount || 60); i++) {
          createCars(0.1, 20);
        }
      }

    const ambientLight = new THREE.AmbientLight(0xffffff, 4);
    const lightFront = new THREE.SpotLight(0xffffff, 20, 10);
    const lightBack = new THREE.PointLight(0xffffff, 0.5);

    lightFront.position.set(5, 5, 5);
    lightFront.castShadow = true;
    lightFront.shadow.mapSize.width = 6000;
    lightFront.shadow.mapSize.height = 6000;
    lightFront.penumbra = 0.1;

    lightBack.position.set(0, 6, 0);
    smoke.position.y = 2;

    scene.add(ambientLight);
    scene.add(lightBack);
    city.add(lightFront, smoke, town);
    scene.add(city);

    const gridHelper = new THREE.GridHelper(60, 120, 0xff0000, 0x000000);
    city.add(gridHelper);

    const mouse = new THREE.Vector2();
    function onMouseMove(event) {
        mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
    }

    container.addEventListener("mousemove", onMouseMove);

    window.addEventListener("resize", () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
    
        city.rotation.y -= (mouse.x * 8 - camera.rotation.y) * uSpeed;
        city.rotation.x -= (-(mouse.y * 2) - camera.rotation.x) * uSpeed;
        city.rotation.x = Math.max(-0.05, Math.min(1, city.rotation.x));
    
        smoke.rotation.y += 0.01;
        smoke.rotation.x += 0.01;
    
        camera.lookAt(city.position);
        renderer.render(scene, camera);
    }

    generateLines();
    init();
    animate();
}