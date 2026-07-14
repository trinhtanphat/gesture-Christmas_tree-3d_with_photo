(() => {
  const GALLERY_BOOTSTRAP_URL = './gallery-bootstrap.js?heart=1';

  function replaceOnce(source, search, replacement, label) {
    if (!source.includes(search)) {
      throw new Error(`Không tìm thấy đoạn cần cập nhật hiệu ứng tim: ${label}`);
    }
    return source.replace(search, replacement);
  }

  function addHeartEffects(html) {
    html = html.replace(/\r\n/g, '\n');

    html = replaceOnce(
      html,
      `<div class="hint-text">Open Palm: Dreamy 3D Gallery | Fist: Tree | Pinch: Focus</div>`,
      `<div class="hint-text">Open Palm: Gallery | Finger Heart / Two-hand Heart: Love Effect</div>`,
      'hướng dẫn cử chỉ trái tim'
    );

    html = replaceOnce(
      html,
      `let scene, camera, renderer, composer, bloomPass;`,
      `let scene, camera, renderer, composer, bloomPass;
        let heartGroup = new THREE.Group();
        let heartTexture;
        let heartParticles = [];
        let heartEnergy = 0;
        let lastHeartTrigger = 0;`,
      'biến hiệu ứng trái tim'
    );

    html = replaceOnce(
      html,
      `            galleryGlowTexture = new THREE.CanvasTexture(glowCanvas);
            galleryGlowTexture.colorSpace = THREE.SRGBColorSpace;`,
      `            galleryGlowTexture = new THREE.CanvasTexture(glowCanvas);
            galleryGlowTexture.colorSpace = THREE.SRGBColorSpace;

            const heartCanvas = document.createElement('canvas');
            heartCanvas.width = 256; heartCanvas.height = 256;
            const heartCtx = heartCanvas.getContext('2d');
            heartCtx.clearRect(0, 0, 256, 256);
            const heartGradient = heartCtx.createRadialGradient(128, 116, 8, 128, 128, 118);
            heartGradient.addColorStop(0, 'rgba(255,255,255,1)');
            heartGradient.addColorStop(0.18, 'rgba(255,205,224,1)');
            heartGradient.addColorStop(0.52, 'rgba(255,58,126,0.96)');
            heartGradient.addColorStop(1, 'rgba(170,0,65,0)');
            heartCtx.fillStyle = heartGradient;
            heartCtx.shadowColor = 'rgba(255,80,150,0.95)';
            heartCtx.shadowBlur = 22;
            heartCtx.beginPath();
            heartCtx.moveTo(128, 218);
            heartCtx.bezierCurveTo(112, 198, 35, 151, 35, 91);
            heartCtx.bezierCurveTo(35, 43, 92, 25, 128, 70);
            heartCtx.bezierCurveTo(164, 25, 221, 43, 221, 91);
            heartCtx.bezierCurveTo(221, 151, 144, 198, 128, 218);
            heartCtx.closePath();
            heartCtx.fill();
            heartTexture = new THREE.CanvasTexture(heartCanvas);
            heartTexture.colorSpace = THREE.SRGBColorSpace;`,
      'texture trái tim phát sáng'
    );

    html = replaceOnce(
      html,
      `            mainGroup = new THREE.Group();
            scene.add(mainGroup);`,
      `            mainGroup = new THREE.Group();
            scene.add(mainGroup);
            scene.add(heartGroup);`,
      'thêm nhóm trái tim vào scene'
    );

    html = replaceOnce(
      html,
      `runningMode: "VIDEO", numHands: 1`,
      `runningMode: "VIDEO", numHands: 2`,
      'nhận diện đồng thời hai tay'
    );

    html = replaceOnce(
      html,
      `        let lastVideoTime = -1;`,
      `        function heartDistance(a, b) {
            return Math.hypot(a.x - b.x, a.y - b.y);
        }

        function handScale(lm) {
            return Math.max(0.001, heartDistance(lm[0], lm[9]));
        }

        function isFingerHeart(lm) {
            if (!lm || lm.length < 21) return false;
            const scale = handScale(lm);
            const thumbIndex = heartDistance(lm[4], lm[8]) / scale;
            const curledFingers = [12, 16, 20].filter((tipIndex) => {
                return heartDistance(lm[tipIndex], lm[0]) / scale < 1.72;
            }).length;
            const indexVisible = heartDistance(lm[8], lm[0]) / scale > 1.05;
            return thumbIndex < 0.48 && curledFingers >= 2 && indexVisible;
        }

        function isTwoHandHeart(first, second) {
            if (!first || !second || first.length < 21 || second.length < 21) return false;
            const scale = (handScale(first) + handScale(second)) * 0.5;
            const thumbGap = heartDistance(first[4], second[4]) / scale;
            const indexGap = heartDistance(first[8], second[8]) / scale;
            const wristGap = heartDistance(first[0], second[0]) / scale;
            const firstFingerSpan = heartDistance(first[4], first[8]) / scale;
            const secondFingerSpan = heartDistance(second[4], second[8]) / scale;
            return thumbGap < 1.28 && indexGap < 1.55 && wristGap > 1.0 && wristGap < 5.2 && firstFingerSpan > 0.42 && secondFingerSpan > 0.42;
        }

        function spawnHeartParticle(strength, index, total) {
            const material = new THREE.SpriteMaterial({
                map: heartTexture,
                color: [0xff2f78, 0xff70a8, 0xffb0cf, 0xffffff][index % 4],
                transparent: true,
                opacity: 1,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(material);
            const angle = (index / Math.max(1, total)) * Math.PI * 2 + Math.random() * 0.35;
            const radius = 1.5 + Math.random() * (strength > 1 ? 8 : 5);
            sprite.position.set(
                Math.cos(angle) * radius,
                -3 + Math.random() * 7,
                12 + Math.random() * 14
            );
            const baseScale = (strength > 1 ? 1.7 : 1.15) + Math.random() * (strength > 1 ? 2.6 : 1.7);
            sprite.scale.set(baseScale, baseScale, 1);
            heartGroup.add(sprite);
            heartParticles.push({
                sprite,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * (2.4 + Math.random() * 4.2) * strength,
                    3.4 + Math.random() * 6.2 * strength,
                    (Math.random() - 0.5) * 2.2
                ),
                life: 0,
                maxLife: 2.8 + Math.random() * 2.4,
                baseScale,
                phase: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 2.4
            });
        }

        function triggerHeartEffect(kind) {
            const strong = kind === 'TWO_HAND';
            const count = strong ? 92 : 48;
            const strength = strong ? 1.25 : 0.82;
            for (let i = 0; i < count; i++) spawnHeartParticle(strength, i, count);

            for (let i = 0; i < (strong ? 5 : 2); i++) {
                const material = new THREE.SpriteMaterial({
                    map: heartTexture,
                    color: i % 2 ? 0xffffff : 0xff4f91,
                    transparent: true,
                    opacity: 0.95,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });
                const sprite = new THREE.Sprite(material);
                sprite.position.set((i - (strong ? 2 : 0.5)) * 3.5, 2 + Math.sin(i) * 2, 22 + i * 0.4);
                const baseScale = strong ? 8.5 + i * 0.8 : 6.2 + i * 0.6;
                sprite.scale.set(baseScale, baseScale, 1);
                heartGroup.add(sprite);
                heartParticles.push({
                    sprite,
                    velocity: new THREE.Vector3((i - 2) * 0.18, 1.25 + i * 0.14, 0),
                    life: 0,
                    maxLife: strong ? 2.7 : 2.1,
                    baseScale,
                    phase: i * 0.8,
                    spin: (i % 2 ? 1 : -1) * 0.2
                });
            }

            heartEnergy = Math.max(heartEnergy, strong ? 1.0 : 0.7);
            showMsg(strong ? 'Two-hand heart detected ❤️ Love explosion!' : 'Finger heart detected 💗');
        }

        function updateHeartEffects(dt) {
            heartEnergy = Math.max(0, heartEnergy - dt * 0.34);
            for (let i = heartParticles.length - 1; i >= 0; i--) {
                const heart = heartParticles[i];
                heart.life += dt;
                const progress = heart.life / heart.maxLife;
                if (progress >= 1) {
                    heartGroup.remove(heart.sprite);
                    heart.sprite.material.dispose();
                    heartParticles.splice(i, 1);
                    continue;
                }
                heart.velocity.x += Math.sin(clock.elapsedTime * 1.9 + heart.phase) * dt * 0.75;
                heart.velocity.y += dt * 0.42;
                heart.sprite.position.addScaledVector(heart.velocity, dt);
                heart.sprite.material.rotation += heart.spin * dt;
                heart.sprite.material.opacity = Math.pow(1 - progress, 0.72) * (0.78 + Math.sin(clock.elapsedTime * 5 + heart.phase) * 0.22);
                const pulse = 1 + Math.sin(clock.elapsedTime * 4.2 + heart.phase) * 0.13;
                const scale = heart.baseScale * pulse * (1 + progress * 0.22);
                heart.sprite.scale.set(scale, scale, 1);
            }
            if (heartEnergy > 0 && bloomPass) {
                bloomPass.strength = Math.max(bloomPass.strength, 1.25 + heartEnergy * 1.45);
                bloomPass.radius = Math.max(bloomPass.radius, 0.76);
                renderer.toneMappingExposure = Math.max(renderer.toneMappingExposure, 2.45 + heartEnergy * 0.55);
            }
        }

        let lastVideoTime = -1;`,
      'hàm tạo và cập nhật hiệu ứng trái tim'
    );

    html = replaceOnce(
      html,
      `        function processGestures(result) {
            if (result.landmarks && result.landmarks.length > 0) {
                STATE.hand.detected = true;
                const lm = result.landmarks[0];`,
      `        function processGestures(result) {
            const hands = result.landmarks || [];
            if (hands.length > 0) {
                const twoHandHeart = hands.length >= 2 && isTwoHandHeart(hands[0], hands[1]);
                const oneHandHeart = !twoHandHeart && hands.some(isFingerHeart);
                if (twoHandHeart || oneHandHeart) {
                    STATE.hand.detected = true;
                    const centerHand = hands[0];
                    STATE.hand.x = (centerHand[9].x - 0.5) * 2;
                    STATE.hand.y = (centerHand[9].y - 0.5) * 2;
                    const now = performance.now();
                    const cooldown = twoHandHeart ? 1750 : 1450;
                    if (now - lastHeartTrigger > cooldown) {
                        triggerHeartEffect(twoHandHeart ? 'TWO_HAND' : 'ONE_HAND');
                        lastHeartTrigger = now;
                    }
                    debugInfo.innerText = twoHandHeart ? 'Gesture: Two-hand Heart ❤️' : 'Gesture: Finger Heart 💗';
                    return;
                }

                STATE.hand.detected = true;
                const lm = hands[0];`,
      'ưu tiên nhận diện cử chỉ trái tim'
    );

    html = replaceOnce(
      html,
      `            particleSystem.forEach(p => p.update(dt, STATE.mode, STATE.focusTarget));
            updateSnow();
            composer.render();`,
      `            particleSystem.forEach(p => p.update(dt, STATE.mode, STATE.focusTarget));
            updateSnow();
            updateHeartEffects(dt);
            composer.render();`,
      'cập nhật mưa trái tim mỗi khung hình'
    );

    return html;
  }

  const originalOpen = document.open.bind(document);
  const originalWrite = document.write.bind(document);
  const originalClose = document.close.bind(document);

  function patchedWrite(html) {
    originalWrite(addHeartEffects(String(html)));
  }

  document.open = (...args) => {
    const result = originalOpen(...args);
    document.write = patchedWrite;
    document.close = originalClose;
    return result;
  };
  document.write = patchedWrite;

  fetch(GALLERY_BOOTSTRAP_URL, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`Không tải được gallery bootstrap (${response.status})`);
      return response.text();
    })
    .then((source) => {
      (0, eval)(source);
    })
    .catch((error) => {
      console.error(error);
      document.body.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;background:#050d1a;color:#fceea7;font-family:system-ui;padding:24px;text-align:center"><div><h1>Không thể khởi động hiệu ứng trái tim</h1><p>${String(error.message || error)}</p></div></main>`;
    });
})();
