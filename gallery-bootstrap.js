(() => {
  const SOURCE_URL = './christmas_tree_touch%26gesture.html';

  function replaceOnce(source, search, replacement, label) {
    if (!source.includes(search)) {
      throw new Error(`Không tìm thấy đoạn cần cập nhật: ${label}`);
    }
    return source.replace(search, replacement);
  }

  async function start() {
    const response = await fetch(`${SOURCE_URL}?gallery=3`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Không tải được trang cây thông (${response.status})`);
    }

    let html = (await response.text()).replace(/\r\n/g, '\n');

    html = replaceOnce(
      html,
      `<div class="hint-text">Touch: Drag | Click Photo | Press 'S' for Stats</div>`,
      `<div class="hint-text">Open Palm: Dreamy 3D Gallery | Fist: Tree | Pinch: Focus</div>`,
      'dòng hướng dẫn thao tác'
    );

    html = replaceOnce(
      html,
      `<div class="mode-btn" onclick="setMode('SCATTER')" title="Scatter Mode">✨</div>`,
      `<div class="mode-btn" onclick="setMode('GALLERY')" title="Dreamy 3D Photo Gallery">🖼️</div>`,
      'nút chế độ gallery'
    );

    html = replaceOnce(
      html,
      `let scene, camera, renderer, composer;`,
      `let scene, camera, renderer, composer, bloomPass;`,
      'biến hiệu ứng bloom'
    );

    html = replaceOnce(
      html,
      `let caneTexture; `,
      `let caneTexture;\n        let galleryGlowTexture; `,
      'texture phát sáng gallery'
    );

    html = replaceOnce(
      html,
      `if (mode === 'TREE') STATE.focusTarget = null;`,
      `if (mode === 'TREE' || mode === 'GALLERY' || mode === 'SCATTER') STATE.focusTarget = null;`,
      'xóa ảnh focus khi đổi chế độ'
    );

    html = replaceOnce(
      html,
      `const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);`,
      `bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);`,
      'cho phép điều khiển bloom khi trình chiếu'
    );

    html = replaceOnce(
      html,
      `            caneTexture.repeat.set(3, 3);\n        }`,
      `            caneTexture.repeat.set(3, 3);\n\n            const glowCanvas = document.createElement('canvas');\n            glowCanvas.width = 128; glowCanvas.height = 128;\n            const glowCtx = glowCanvas.getContext('2d');\n            const glowGradient = glowCtx.createRadialGradient(64, 64, 0, 64, 64, 64);\n            glowGradient.addColorStop(0, 'rgba(255,255,255,1)');\n            glowGradient.addColorStop(0.18, 'rgba(255,244,190,0.95)');\n            glowGradient.addColorStop(0.48, 'rgba(255,202,90,0.42)');\n            glowGradient.addColorStop(1, 'rgba(255,170,40,0)');\n            glowCtx.fillStyle = glowGradient;\n            glowCtx.fillRect(0, 0, 128, 128);\n            galleryGlowTexture = new THREE.CanvasTexture(glowCanvas);\n            galleryGlowTexture.colorSpace = THREE.SRGBColorSpace;\n        }`,
      'tạo texture halo lung linh'
    );

    html = replaceOnce(
      html,
      `this.posTree = new THREE.Vector3(); this.posScatter = new THREE.Vector3();`,
      `this.posTree = new THREE.Vector3(); this.posScatter = new THREE.Vector3(); this.posGallery = new THREE.Vector3(); this.posGalleryAnimated = new THREE.Vector3();`,
      'tọa độ gallery của ảnh'
    );

    html = replaceOnce(
      html,
      `let target = (mode === 'SCATTER') ? this.posScatter : this.posTree;`,
      `let target = this.posTree;\n                if (mode === 'SCATTER') target = this.posScatter;\n                else if (mode === 'GALLERY' && this.type === 'PHOTO') {\n                    const dreamyTime = clock.elapsedTime * 0.9 + this.mesh.id * 0.19;\n                    this.posGalleryAnimated.copy(this.posGallery);\n                    this.posGalleryAnimated.x += Math.cos(dreamyTime * 0.7) * 0.32;\n                    this.posGalleryAnimated.y += Math.sin(dreamyTime) * 0.75;\n                    this.posGalleryAnimated.z += Math.sin(dreamyTime * 0.55) * 0.28;\n                    target = this.posGalleryAnimated;\n                }`,
      'đích di chuyển gallery thơ mộng'
    );

    html = replaceOnce(
      html,
      `const lerpSpeed = (mode === 'FOCUS' && this.mesh === focusTargetMesh) ? 5.0 : 2.0; `,
      `const lerpSpeed = (mode === 'FOCUS' && this.mesh === focusTargetMesh) ? 5.0 : ((mode === 'GALLERY' && this.type === 'PHOTO') ? 3.2 : 2.0); `,
      'tốc độ bay vào gallery'
    );

    html = replaceOnce(
      html,
      `                if (mode === 'SCATTER') {\n                    this.mesh.rotation.x += this.spinSpeed.x * dt;\n                    this.mesh.rotation.y += this.spinSpeed.y * dt;\n                    this.mesh.rotation.z += this.spinSpeed.z * dt; \n                } else if (mode === 'TREE') {\n                    if (this.type === 'PHOTO') {\n                        this.mesh.lookAt(0, this.mesh.position.y, 0);\n                        this.mesh.rotateY(Math.PI);\n                    } else {\n                        this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, dt);\n                        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt);\n                        this.mesh.rotation.y += 0.5 * dt; \n                    }\n                }`,
      `                if (mode === 'SCATTER') {\n                    this.mesh.rotation.x += this.spinSpeed.x * dt;\n                    this.mesh.rotation.y += this.spinSpeed.y * dt;\n                    this.mesh.rotation.z += this.spinSpeed.z * dt;\n                } else if (mode === 'GALLERY') {\n                    if (this.type === 'PHOTO') {\n                        const dreamyTime = clock.elapsedTime * 0.9 + this.mesh.id * 0.19;\n                        this.mesh.lookAt(camera.position);\n                        this.mesh.rotation.x += Math.sin(dreamyTime * 0.65) * 0.0008;\n                        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, Math.sin(dreamyTime * 0.8) * 0.025, Math.min(1, 4 * dt));\n                    } else {\n                        this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, dt);\n                        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt);\n                        this.mesh.rotation.y += 0.18 * dt;\n                    }\n                } else if (mode === 'TREE') {\n                    if (this.type === 'PHOTO') {\n                        this.mesh.lookAt(0, this.mesh.position.y, 0);\n                        this.mesh.rotateY(Math.PI);\n                    } else {\n                        this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, dt);\n                        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt);\n                        this.mesh.rotation.y += 0.5 * dt;\n                    }\n                }`,
      'ảnh đứng thẳng và lơ lửng trong gallery'
    );

    html = replaceOnce(
      html,
      `                if (mode === 'FOCUS' && this.mesh === focusTargetMesh) this.mesh.lookAt(camera.position); `,
      `                if (this.type === 'PHOTO') {\n                    const galleryActive = mode === 'GALLERY';\n                    const dreamyTime = clock.elapsedTime + this.mesh.id * 0.17;\n                    this.mesh.children.forEach((child) => {\n                        if (child.userData.galleryGlow) {\n                            child.visible = galleryActive;\n                            child.material.opacity = galleryActive ? 0.42 + Math.sin(dreamyTime * 1.8) * 0.13 : 0;\n                            child.material.rotation = dreamyTime * 0.08;\n                        } else if (child.userData.gallerySparkles) {\n                            child.visible = galleryActive;\n                            child.rotation.z = dreamyTime * child.userData.spinSpeed;\n                            child.rotation.y = Math.sin(dreamyTime * 0.45) * 0.25;\n                            child.material.opacity = galleryActive ? 0.55 + Math.sin(dreamyTime * 2.6) * 0.3 : 0;\n                            child.material.size = child.userData.baseSize * (0.82 + 0.32 * Math.sin(dreamyTime * 3.1));\n                        } else if (child.userData.galleryFrame && child.material.emissiveIntensity !== undefined) {\n                            child.material.emissiveIntensity = galleryActive ? 0.85 + Math.sin(dreamyTime * 2.1) * 0.35 : 0.45;\n                        }\n                    });\n                }\n                if (mode === 'FOCUS' && this.mesh === focusTargetMesh) this.mesh.lookAt(camera.position); `,
      'halo và hạt sáng quanh ảnh'
    );

    html = replaceOnce(
      html,
      `                    if (mode === 'TREE') s = 0; \n                } else if (mode === 'SCATTER' && this.type === 'PHOTO') s = this.baseScale * 2.5; \n                else if (mode === 'FOCUS') {`,
      `                    if (mode === 'TREE') s = 0;\n                    else if (mode === 'GALLERY') s = this.baseScale * (1.15 + 0.35 * Math.sin(clock.elapsedTime * 2.2 + this.mesh.id));\n                } else if (mode === 'SCATTER' && this.type === 'PHOTO') s = this.baseScale * 2.5;\n                else if (mode === 'GALLERY' && this.type === 'PHOTO') s = this.baseScale * 10.8;\n                else if (mode === 'FOCUS') {`,
      'ảnh lớn gấp ba và bụi sáng gallery'
    );

    const oldLayout = `        function updatePhotoLayout() {
            const photos = particleSystem.filter(p => p.type === 'PHOTO');
            const count = photos.length;
            if (count === 0) return;
            const h = CONFIG.particles.treeHeight * 0.9;
            const bottomY = -h/2; const stepY = h / count; const loops = 3;
            photos.forEach((p, i) => {
                const y = bottomY + stepY * i + stepY/2;
                const normalizedH = (y + h/2) / CONFIG.particles.treeHeight; 
                const r = Math.max(1.0, CONFIG.particles.treeRadius * (1.0 - normalizedH)) + 3.0; 
                const angle = normalizedH * Math.PI * 2 * loops + (Math.PI/4); 
                p.posTree.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
            });
        }`;

    const newLayout = `        function updatePhotoLayout() {
            const photos = particleSystem.filter(p => p.type === 'PHOTO');
            const count = photos.length;
            if (count === 0) return;

            const h = CONFIG.particles.treeHeight * 0.9;
            const bottomY = -h / 2;
            const stepY = h / count;
            const loops = 3;

            photos.forEach((p, i) => {
                const y = bottomY + stepY * i + stepY / 2;
                const normalizedH = (y + h / 2) / CONFIG.particles.treeHeight;
                const r = Math.max(1.0, CONFIG.particles.treeRadius * (1.0 - normalizedH)) + 3.0;
                const angle = normalizedH * Math.PI * 2 * loops + Math.PI / 4;
                p.posTree.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
            });

            const rowCount = Math.min(8, Math.max(1, Math.ceil(count / 8)));
            const perRow = Math.ceil(count / rowCount);
            const rowGap = rowCount === 1 ? 0 : Math.min(10.5, 72 / (rowCount - 1));
            const topY = ((rowCount - 1) * rowGap) / 2;

            photos.forEach((p, i) => {
                const row = Math.floor(i / perRow);
                const indexInRow = i % perRow;
                const itemsInRow = Math.min(perRow, count - row * perRow);
                const useFullRing = itemsInRow > 10;
                const angleSpan = useFullRing
                    ? Math.PI * 2
                    : Math.min(Math.PI * 1.15, Math.max(0.7, (itemsInRow - 1) * 0.55));
                const angle = itemsInRow === 1
                    ? 0
                    : useFullRing
                        ? (indexInRow / itemsInRow) * Math.PI * 2
                        : -angleSpan / 2 + (indexInRow / (itemsInRow - 1)) * angleSpan;
                const neededRadius = useFullRing
                    ? (itemsInRow * 12.5) / (Math.PI * 2)
                    : (itemsInRow * 12.5) / Math.max(angleSpan, 1.1);
                const radius = Math.min(65, Math.max(24, neededRadius));
                const y = topY - row * rowGap;

                p.posGallery.set(
                    Math.sin(angle) * radius,
                    y,
                    Math.cos(angle) * radius
                );
            });
        }`;

    html = replaceOnce(html, oldLayout, newLayout, 'bố cục ảnh lớn theo hàng ngang');

    html = replaceOnce(
      html,
      `const frameGeo = new THREE.BoxGeometry(1.4, 1.4, 0.05);`,
      `const frameGeo = new THREE.BoxGeometry(1.4, 1.4, 0.22);`,
      'độ dày khung ảnh 3D'
    );

    html = replaceOnce(
      html,
      `const frameMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.champagneGold, metalness: 1.0, roughness: 0.1 });`,
      `const frameMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.champagneGold, metalness: 1.0, roughness: 0.1, emissive: 0x553300, emissiveIntensity: 0.45 });`,
      'vật liệu khung ảnh phát sáng'
    );

    html = replaceOnce(
      html,
      `photo.position.z = 0.04;`,
      `photo.position.z = 0.13;`,
      'vị trí ảnh trên khung'
    );

    html = replaceOnce(
      html,
      `            const group = new THREE.Group();\n            group.add(frame); group.add(photo);\n            frame.scale.set(width/1.2, height/1.2, 1);\n            const s = 0.8; group.scale.set(s,s,s);`,
      `            const group = new THREE.Group();\n            group.add(frame); group.add(photo);\n            frame.userData.galleryFrame = true;\n\n            const glowMaterial = new THREE.SpriteMaterial({\n                map: galleryGlowTexture,\n                color: 0xffd977,\n                transparent: true,\n                opacity: 0,\n                blending: THREE.AdditiveBlending,\n                depthWrite: false,\n                depthTest: true\n            });\n            const glow = new THREE.Sprite(glowMaterial);\n            glow.position.z = -0.08;\n            glow.scale.set(Math.max(2.6, width * 3.0), Math.max(2.6, height * 3.0), 1);\n            glow.visible = false;\n            glow.userData.galleryGlow = true;\n            group.add(glow);\n\n            const sparklePositions = [];\n            const sparkleCount = 18;\n            for (let i = 0; i < sparkleCount; i++) {\n                const angle = (i / sparkleCount) * Math.PI * 2;\n                const wobble = 0.88 + (i % 3) * 0.12;\n                sparklePositions.push(\n                    Math.cos(angle) * width * wobble,\n                    Math.sin(angle) * height * wobble,\n                    0.18 + (i % 2) * 0.06\n                );\n            }\n            const sparkleGeo = new THREE.BufferGeometry();\n            sparkleGeo.setAttribute('position', new THREE.Float32BufferAttribute(sparklePositions, 3));\n            const sparkleMat = new THREE.PointsMaterial({\n                map: galleryGlowTexture,\n                color: 0xfff4bf,\n                size: 0.075,\n                transparent: true,\n                opacity: 0,\n                blending: THREE.AdditiveBlending,\n                depthWrite: false,\n                sizeAttenuation: true\n            });\n            const sparkles = new THREE.Points(sparkleGeo, sparkleMat);\n            sparkles.visible = false;\n            sparkles.userData.gallerySparkles = true;\n            sparkles.userData.spinSpeed = 0.08 + Math.random() * 0.08;\n            sparkles.userData.baseSize = sparkleMat.size;\n            group.add(sparkles);\n\n            frame.scale.set(width/1.2, height/1.2, 1);\n            const s = 0.8; group.scale.set(s,s,s);`,
      'halo và sao lấp lánh quanh khung ảnh'
    );

    html = replaceOnce(
      html,
      `            if(!files.length) return;\n            Array.from(files).forEach(f => {`,
      `            if(!files.length) return;\n            showMsg(\`Loading \${files.length} photos... Open your palm for the dreamy 3D gallery.\`);\n            Array.from(files).forEach(f => {`,
      'thông báo tải thư mục ảnh'
    );

    html = replaceOnce(
      html,
      `STATE.mode = (STATE.mode === 'SCATTER') ? 'TREE' : 'SCATTER';`,
      `STATE.mode = (STATE.mode === 'GALLERY') ? 'TREE' : 'GALLERY';`,
      'chạm hai lần để mở gallery'
    );

    html = replaceOnce(
      html,
      `} else if (extensionRatio > 1.7) { STATE.mode = 'SCATTER'; STATE.focusTarget = null; }`,
      `} else if (extensionRatio > 1.7) { STATE.mode = 'GALLERY'; STATE.focusTarget = null; }`,
      'bàn tay mở kích hoạt gallery'
    );

    html = replaceOnce(
      html,
      `if (STATE.mode === 'SCATTER') {`,
      `if (STATE.mode === 'SCATTER' || STATE.mode === 'GALLERY') {`,
      'điều khiển gallery bằng vị trí bàn tay'
    );

    html = replaceOnce(
      html,
      `            mainGroup.rotation.y = STATE.rotation.y;\n            mainGroup.rotation.x = STATE.rotation.x;\n            particleSystem.forEach(p => p.update(dt, STATE.mode, STATE.focusTarget));`,
      `            const galleryActive = STATE.mode === 'GALLERY';\n            const galleryPhotoCount = particleSystem.filter(p => p.type === 'PHOTO').length;\n            const targetCameraZ = galleryActive ? Math.min(110, 60 + Math.max(0, galleryPhotoCount - 6) * 0.28) : CONFIG.camera.z;\n            camera.position.z += (targetCameraZ - camera.position.z) * Math.min(1, 2.2 * dt);\n            if (scene.fog) {\n                const targetFogDensity = galleryActive ? 0.0065 : 0.015;\n                scene.fog.density += (targetFogDensity - scene.fog.density) * Math.min(1, 2.0 * dt);\n            }\n            if (bloomPass) {\n                const dreamyPulse = 1 + Math.sin(clock.elapsedTime * 1.15) * 0.12;\n                const targetBloomStrength = galleryActive ? 1.15 * dreamyPulse : 0.5;\n                const targetBloomRadius = galleryActive ? 0.72 : 0.4;\n                bloomPass.strength += (targetBloomStrength - bloomPass.strength) * Math.min(1, 2.5 * dt);\n                bloomPass.radius += (targetBloomRadius - bloomPass.radius) * Math.min(1, 2.5 * dt);\n            }\n            const targetExposure = galleryActive ? 2.55 : 2.2;\n            renderer.toneMappingExposure += (targetExposure - renderer.toneMappingExposure) * Math.min(1, 2.0 * dt);\n\n            mainGroup.rotation.y = STATE.rotation.y;\n            mainGroup.rotation.x = STATE.rotation.x;\n            particleSystem.forEach(p => p.update(dt, STATE.mode, STATE.focusTarget));`,
      'camera, fog và bloom thơ mộng'
    );

    document.open();
    document.write(html);
    document.close();
  }

  start().catch((error) => {
    console.error(error);
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;background:#050d1a;color:#fceea7;font-family:system-ui;padding:24px;text-align:center">
        <div>
          <h1>Không thể khởi động gallery 3D</h1>
          <p>${String(error.message || error)}</p>
          <p><a style="color:#ffd966" href="${SOURCE_URL}">Mở phiên bản cây thông gốc</a></p>
        </div>
      </main>`;
  });
})();
