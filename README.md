# alf-animations

Animações 3D interativas e responsivas com [three.js](https://threejs.org/), prontas para serem usadas em aplicações web modernas (Angular, React, Vanilla, etc). A lib é escrita em JavaScript puro e oferece efeitos visuais como cidades dinâmicas, cubos animados e mais.

## 📦 Instalação

```bash
npm install alf-design-animations three gsap

# 🚀 exemplo de como usar

import { createAnimation } from 'three-city-animation';

const container = document.getElementById('canvas-container');

createAnimation('city', container, {
  color: 0x151515,
  carColor: 0xff0000,
  carCount: 60,
  cameraPosition: { x: 0, y: 2, z: 14 },
});

🧩 Integração com Angular
Crie uma div com #container no seu componente:
<div #container class="canvas-container"></div>

🔧 Requisitos
three.js v0.150+ (ou compatível)
gsap para animações Tween

