(() => {
  const SOURCE_URL = './christmas_tree_touch%26gesture.html';

  function replaceOnce(source, search, replacement, label) {
    if (!source.includes(search)) {
      throw new Error(`Không tìm thấy đoạn cần cập nhật: ${label}`);
    }
    return source.replace(search, replacement);
  }

  async function start() {
    const response = await fetch(`${SOURCE_URL}?gallery=2`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Không tải được trang cây thông (${response.status})`);
    }

    let html = (await response.text()).replace(/\r\n/g, '\n');

    html = replaceOnce(
      html,
      `<div class="hint-text">Touch: Drag | Click Photo | Press 'S' for Stats</div>`,
      `<div class="hint-text">Open Palm: 3D Gallery | Fist: Tree | Pinch: Focus</div>`,
      'dòng hướng dẫn thao tác'
    );

    html = replaceOnce(
      html,
      `<div class="mode-btn" onclick="setMode('SCATTER')" title="Scatter Mode">✨</div>`,
      `<div class="mode-btn" onclick="setMode('GALLERY')" title="3D Photo Gallery">🖼️</div>`,
      'nút chế độ gallery'
    );

    html = replaceOnce(
      html,
      `if (mode === 'TREE') STATE.focusTarget = null;`,
      `if (mode === 'TREE' || mode === 'GALLERY' || mode === 'SCATTER') STATE.focusTarget = null;`,
      'xóa ảnh focus khi đổi chế độ'
    );

    html = replaceOnce(
      html,
      `this.posTree = new THREE.Vector3(); this.posScatter = new THREE.Vector3();`,
      `this.posTree = new THREE.Vector3(); this.posScatter = new THREE.Vector3(); this.posGallery = new THREE.Vector3();`,
      'tọa độ gallery của ảnh'
    );

    html = replaceOnce(
      html,
      `let target = (mode === 'SCATTER') ? this.posScatter : this.posTree;`,
      `let target = this.posTree;
                if (mode === 'SCATTER') target = this.posScatter;
                else if (mode === 'GALLERY' && this.type === 'PHOTO') target = this.posGallery;`,
      'đích di chuyển gallery'
    );

    html = replaceOnce(
      html,
      `                if (mode === 'SCATTER') {
                    this.mesh.rotation.x += this.spinSpeed.x * dt;
                    this.mesh.rotation.y += this.spinSpeed.y * dt;
                    this.mesh.rotation.z += this.spinSpeed.z * dt; 
                } else if (mode === 'TREE') {
                    if (this.type === 'PHOTO') {
                        this.mesh.lookAt(0, this.mesh.position.y, 0);
                        this.mesh.rotateY(Math.PI);
                    } else {
                        this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, dt);
                        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt);
                        this.mesh.rotation.y += 0.5 * dt; 
                    }
                }`,
      `                if (mode === 'SCATTER') {
                    this.mesh.rotation.x += this.spinSpeed.x * dt;
                    this.mesh.rotation.y += this.spinSpeed.y * dt;
                    this.mesh.rotation.z += this.spinSpeed.z * dt;
                } else if (mode === 'GALLERY') {
                    if (this.type === 'PHOTO') {
                        this.mesh.lookAt(camera.position);
                        this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, Math.min(1, 8 * dt));
                        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, Math.min(1, 8 * dt));
                    } else {
                        this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, dt);
                        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt);
                        this.mesh.rotation.y += 0.25 * dt;
                    }
                } else if (mode === 'TREE') {
                    if (this.type === 'PHOTO') {
                        this.mesh.lookAt(0, this.mesh.position.y, 0);
                        this.mesh.rotateY(Math.PI);
                    } else {
                        this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, 0, dt);
                        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, 0, dt);
                        this.mesh.rotation.y += 0.5 * dt;
                    }
                }`,
      'xoay ảnh đứng thẳng trong gallery'
    );

    html = replaceOnce(
      html,
      `                    if (mode === 'TREE') s = 0; 
                } else if (mode === 'SCATTER' && this.type === 'PHOTO') s = this.baseScale * 2.5; 
                else if (mode === 'FOCUS') {`,
      `                    if (mode === 'TREE' || mode === 'GALLERY') s = 0;
                } else if (mode === 'SCATTER' && this.type === 'PHOTO') s = this.baseScale * 2.5;
                else if (mode === 'GALLERY' && this.type === 'PHOTO') s = this.baseScale * 3.6;
                else if (mode === 'FOCUS') {`,
      'kích thước ảnh gallery'
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

            const rowCount = Math.min(4, Math.max(1, Math.ceil(count / 8)));
            const perRow = Math.ceil(count / rowCount);
            const rowGap = rowCount === 1 ? 0 : Math.min(5, 15 / (rowCount - 1));
            const topY = ((rowCount - 1) * rowGap) / 2;

            photos.forEach((p, i) => {
                const row = Math.floor(i / perRow);
                const indexInRow = i % perRow;
                const itemsInRow = Math.min(perRow, count - row * perRow);
                const useFullRing = itemsInRow > 12;
                const angleSpan = useFullRing
                    ? Math.PI * 2
                    : Math.min(Math.PI * 1.05, Math.max(0.45, (itemsInRow - 1) * 0.42));
                const angle = itemsInRow === 1
                    ? 0
                    : useFullRing
                        ? (indexInRow / itemsInRow) * Math.PI * 2
                        : -angleSpan / 2 + (indexInRow / (itemsInRow - 1)) * angleSpan;
                const neededRadius = useFullRing
                    ? (itemsInRow * 4.2) / (Math.PI * 2)
                    : (itemsInRow * 4.2) / Math.max(angleSpan, 0.9);
                const radius = Math.min(27, Math.max(13, neededRadius));
                const y = topY - row * rowGap;

                p.posGallery.set(
                    Math.sin(angle) * radius,
                    y,
                    Math.cos(angle) * radius
                );
            });
        }`;

    html = replaceOnce(html, oldLayout, newLayout, 'bố cục ảnh nhiều hàng ngang');

    html = replaceOnce(
      html,
      `const frameGeo = new THREE.BoxGeometry(1.4, 1.4, 0.05);`,
      `const frameGeo = new THREE.BoxGeometry(1.4, 1.4, 0.16);`,
      'độ dày khung ảnh 3D'
    );

    html = replaceOnce(
      html,
      `const frameMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.champagneGold, metalness: 1.0, roughness: 0.1 });`,
      `const frameMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.champagneGold, metalness: 1.0, roughness: 0.12, emissive: 0x332200, emissiveIntensity: 0.45 });`,
      'vật liệu khung ảnh 3D'
    );

    html = replaceOnce(
      html,
      `photo.position.z = 0.04;`,
      `photo.position.z = 0.09;`,
      'vị trí ảnh trên khung'
    );

    html = replaceOnce(
      html,
      `            if(!files.length) return;
            Array.from(files).forEach(f => {`,
      `            if(!files.length) return;
            showMsg(\`Loading \${files.length} photos... Open your palm for the 3D gallery.\`);
            Array.from(files).forEach(f => {`,
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
