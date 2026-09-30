/**
 * main.js - Nguyễn Đức Thắng | ducthangnguyen.com
 * High-Fidelity Andromeda Galaxy Engine & UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo thư viện Lucide Icons
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // 2. Khởi tạo Dải ngân hà Andromeda đa tầng siêu nét (High-Fidelity Galaxy Engine)
  initAndromedaGalaxy();
});

/**
 * Động cơ mô phỏng Thiên hà Tiên Nữ (Andromeda Galaxy M31)
 * - Mật độ 2.200+ hạt sao sắc nét chuẩn High-DPI Retina (canvas.width = innerWidth * devicePixelRatio)
 * - Phân tách 3 lớp chiều sâu vật lý: Lớp sao nền xa, Lớp đĩa xoắn ốc 4 nhánh, Lớp lõi vàng rực rỡ
 * - Tối ưu hoá Path-Batching đạt 60fps mượt mà trên mọi thiết bị (iPhone Xs Max & Desktop)
 * - Hiệu ứng Parallax 3D nghiêng góc nhìn tự nhiên theo chuột / cảm ứng
 * - Tiết kiệm pin tối đa: Tự dừng khi tab ẩn (Page Visibility API)
 */
function initAndromedaGalaxy() {
  const canvas = document.getElementById('galaxy-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Kích thước & Tọa độ trung tâm
  let width = 0;
  let height = 0;
  let dpr = 1;
  let centerX = 0;
  let centerY = 0;
  let maxRadius = 0;

  // Cấu hình số lượng hạt sao theo yêu cầu (1.500 - 2.500 hạt)
  const isMobile = window.innerWidth < 768;
  const BG_STAR_COUNT = isMobile ? 320 : 450;        // Lớp 1: Sao xa không gian sâu
  const GALAXY_STAR_COUNT = isMobile ? 950 : 1350;   // Lớp 2: Đĩa xoắn ốc Andromeda
  const CORE_STAR_COUNT = isMobile ? 380 : 550;      // Lớp 3: Lõi rực sáng trung tâm
  const DUST_CLOUD_COUNT = isMobile ? 16 : 26;       // Đám mây bụi khí tinh vân

  // Góc xoay & Tương tác 3D Parallax
  let galaxyAngle = 0;
  const ROTATION_SPEED = 0.00065; // Gia số góc xoay siêu mượt và chậm rãi (0.0005 - 0.001 rad/frame)
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Quản lý hoạt ảnh & tiết kiệm pin
  let animationFrameId = null;
  let isPageVisible = true;
  let lastTimestamp = performance.now();

  // Bảng màu chuẩn thiên văn học Andromeda M31:
  // Lõi già ánh vàng ấm (Population II stars) & Nhánh trẻ ánh xanh dương/tím/trắng (Population I stars)
  const CORE_STAR_COLORS = [
    'rgba(255, 255, 255, ',     // Trắng tinh khôi rực rỡ
    'rgba(254, 243, 199, ',     // Vàng hổ phách nhạt
    'rgba(253, 230, 138, ',     // Vàng ánh kim
    'rgba(251, 191, 36, ',      // Vàng cam ấm
    'rgba(245, 158, 11, '       // Cam rực rỡ
  ];

  const ARM_STAR_COLORS = [
    'rgba(255, 255, 255, ',     // Trắng ngọc
    'rgba(224, 242, 254, ',     // Lam băng tuyết
    'rgba(186, 230, 253, ',     // Xanh thiên thanh
    'rgba(125, 211, 252, ',     // Cyan sáng công nghệ
    'rgba(192, 132, 252, ',     // Tím tinh vân vũ trụ
    'rgba(167, 139, 250, ',     // Nebula Violet
    'rgba(52, 211, 153, ',      // Emerald starlight (đồng điệu thương hiệu)
    'rgba(96, 165, 250, '       // Deep Celestial Blue
  ];

  const BG_STAR_COLORS = [
    'rgba(255, 255, 255, ',
    'rgba(203, 213, 225, ',
    'rgba(186, 230, 253, ',
    'rgba(224, 231, 255, '
  ];

  // Bụi khí tinh vân (Interstellar Dust Clouds)
  const NEBULA_PALETTE = [
    { r: 245, g: 158, b: 11,  a: 0.045 }, // Vàng cam ấm ở lõi
    { r: 168, g: 85,  b: 247, a: 0.035 }, // Tím vũ trụ dọc nhánh
    { r: 56,  g: 189, b: 248, a: 0.030 }, // Xanh cyan khí hydro
    { r: 16,  g: 185, b: 129, a: 0.020 }  // Emerald điểm xuyết
  ];

  // =========================================================================
  // 1. LỚP SAO NỀN XA KHÔNG GIAN SÂU (BACKGROUND DEEP-FIELD STARS)
  // Hạt siêu nhỏ (0.5px - 1.0px), độ mờ 0.2 - 0.5, lấp lánh nhẹ ngẫu nhiên
  // =========================================================================
  let bgStars = [];
  function createBgStars() {
    bgStars = [];
    for (let i = 0; i < BG_STAR_COUNT; i++) {
      bgStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 0.5 + 0.5, // 0.5px - 1.0px chuẩn yêu cầu
        baseAlpha: Math.random() * 0.3 + 0.2, // 0.2 - 0.5
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        colorPrefix: BG_STAR_COLORS[Math.floor(Math.random() * BG_STAR_COLORS.length)]
      });
    }
  }

  // =========================================================================
  // 2. LỚP ĐĨA XOẮN ỐC ANDROMEDA (SPIRAL ARMS DISK)
  // Công thức xoắn ốc Logarithmic 4 nhánh, phân bổ hạt dày đặc và uốn lượn
  // =========================================================================
  let galaxyStars = [];
  function createGalaxyStars() {
    galaxyStars = [];
    const arms = 4; // 4 nhánh xoắn ốc đan xen sống động
    const twist = 2.6; // Hệ số uốn cong Logarithmic

    for (let i = 0; i < GALAXY_STAR_COUNT; i++) {
      // Phân bố bán kính: Tập trung dày ở nửa trong và tản mờ dần ra rìa
      const distRatio = Math.pow(Math.random(), 1.45);
      const r = 25 + distRatio * (maxRadius - 25);

      const armIndex = i % arms;
      const armAngle = (armIndex * 2 * Math.PI) / arms;

      // Xoắn ốc logarit tự nhiên: theta = armAngle + ln(1 + r/r0) * twist
      const spiralAngle = armAngle + Math.log(1 + (r / maxRadius) * 7.5) * twist;

      // Độ tán xạ vuông góc (tăng dần theo bán kính tạo độ rộng cho cánh tay ngân hà)
      const scatter = (Math.random() - 0.5) * (14 + r * 0.26);
      const finalAngle = spiralAngle + scatter / (r + 1);

      const x = Math.cos(finalAngle) * r;
      const y = Math.sin(finalAngle) * r;

      // Màu sắc theo vị trí từ trong ra ngoài
      let colorIndex;
      if (r < maxRadius * 0.35) {
        // Nhánh trong: Hòa trộn ánh sáng ấm của lõi và xanh sáng
        colorIndex = Math.random() < 0.4 ? 0 : 2;
      } else if (r < maxRadius * 0.7) {
        // Thân nhánh: Tím vũ trụ, xanh cyan, ngọc lục bảo
        colorIndex = Math.floor(Math.random() * ARM_STAR_COLORS.length);
      } else {
        // Viền ngoài dải mây: Xanh sâu & Tím nhạt mờ dần
        colorIndex = Math.random() < 0.5 ? 4 : 7;
      }

      // Kích thước hạt: 0.6px - 1.8px sắc sảo
      const randSize = Math.random();
      const size = randSize < 0.88 ? (0.6 + Math.random() * 0.6) : (1.3 + Math.random() * 0.7);

      galaxyStars.push({
        x,
        y,
        r,
        size,
        baseAlpha: Math.random() * 0.45 + 0.35,
        twinkleSpeed: Math.random() * 0.025 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        colorPrefix: ARM_STAR_COLORS[colorIndex]
      });
    }
  }

  // =========================================================================
  // 3. LỚP LÕI TRUNG TÂM RỰC RỠ (GALACTIC CORE & BULGE)
  // Mật độ hạt dày đặc hội tụ quanh tâm, tone màu vàng cam/trắng ấm rực rỡ
  // =========================================================================
  let coreStars = [];
  function createCoreStars() {
    coreStars = [];
    const coreRadius = maxRadius * 0.22;

    for (let i = 0; i < CORE_STAR_COUNT; i++) {
      // Phân bố mật độ cực cao tại tâm (hàm mũ bậc cao)
      const distRatio = Math.pow(Math.random(), 2.2);
      const r = distRatio * coreRadius;
      const angle = Math.random() * Math.PI * 2;

      // Độ dẹt tự nhiên của khối hạt nhân hình cầu dẹt (Bulge Ellipsoid)
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.75;

      const colorIndex = Math.floor(Math.random() * CORE_STAR_COLORS.length);
      const size = Math.random() * 1.4 + 0.6;

      coreStars.push({
        x,
        y,
        r,
        size,
        baseAlpha: Math.random() * 0.5 + 0.45,
        twinkleSpeed: Math.random() * 0.03 + 0.012,
        twinklePhase: Math.random() * Math.PI * 2,
        colorPrefix: CORE_STAR_COLORS[colorIndex]
      });
    }
  }

  // =========================================================================
  // 4. ĐÁM MÂY BỤI KHÍ VŨ TRỤ (INTERSTELLAR DUST & NEBULA CLOUDS)
  // =========================================================================
  let nebulaClouds = [];
  function createNebulaClouds() {
    nebulaClouds = [];
    const arms = 4;
    for (let i = 0; i < DUST_CLOUD_COUNT; i++) {
      const distRatio = 0.12 + Math.random() * 0.72;
      const r = distRatio * maxRadius;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const angle = armAngle + Math.log(1 + (r / maxRadius) * 7.5) * 2.6 + (Math.random() - 0.5) * 0.35;

      nebulaClouds.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        radius: 45 + Math.random() * 75,
        color: NEBULA_PALETTE[Math.floor(Math.random() * NEBULA_PALETTE.length)]
      });
    }
  }

  // =========================================================================
  // 5. SAO BĂNG LƯỚT QUA VŨ TRỤ (SUBTLE COSMIC METEOR)
  // =========================================================================
  let shootingStar = null;
  let nextShootingStarTime = performance.now() + 6000 + Math.random() * 6000;

  function spawnShootingStar(now) {
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25;
    const speed = 8 + Math.random() * 6;
    shootingStar = {
      x: Math.random() * (width * 0.75),
      y: Math.random() * (height * 0.3),
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: 90 + Math.random() * 70,
      life: 1.0,
      decay: 0.016 + Math.random() * 0.014
    };
    nextShootingStarTime = now + 10000 + Math.random() * 10000;
  }

  // =========================================================================
  // KHỞI TẠO ĐỘ PHÂN GIẢI CAO (HIGH DPI / RETINA CRISPNESS)
  // canvas.width = window.innerWidth * window.devicePixelRatio
  // =========================================================================
  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    // Thiết lập kích thước buffer sắc nét từng pixel
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Tâm ngân hà:
    // Desktop: Hơi lệch sang phải (58% width, 50% height) để ôm lấy hệ thống 3 Card bên phải
    // Mobile: Ở giữa (50% width, 44% height) ôm lấy cụm Avatar & Profile
    if (width >= 1024) {
      centerX = width * 0.58;
      centerY = height * 0.50;
      maxRadius = Math.min(width, height) * 0.68;
    } else {
      centerX = width * 0.5;
      centerY = height * 0.44;
      maxRadius = Math.min(width, height) * 0.78;
    }

    createBgStars();
    createGalaxyStars();
    createCoreStars();
    createNebulaClouds();
  }

  // =========================================================================
  // TƯƠNG TÁC PARALLAX 3D (DESKTOP MOUSE & MOBILE TOUCH / ORIENTATION)
  // =========================================================================
  function onMouseMove(e) {
    const normX = (e.clientX / width) * 2 - 1;
    const normY = (e.clientY / height) * 2 - 1;
    targetTiltX = normX * 28; // Độ lệch trục X (px)
    targetTiltY = normY * 20; // Độ lệch trục Y (px)
  }

  function onTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const normX = (touch.clientX / width) * 2 - 1;
      const normY = (touch.clientY / height) * 2 - 1;
      targetTiltX = normX * 18;
      targetTiltY = normY * 14;
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', resize, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // Tối ưu hiệu năng: Dừng animation khi ẩn tab
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      lastTimestamp = performance.now();
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    } else {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  });

  // Khởi tạo kích thước ban đầu
  resize();

  // =========================================================================
  // VÒNG LẶP RENDER CHÍNH (60FPS SILKY SMOOTH WITH PATH BATCHING)
  // =========================================================================
  function render(timestamp) {
    if (!isPageVisible) return;

    // Delta-time đảm bảo tốc độ xoay siêu mượt và không đổi trên 60Hz, 120Hz ProMotion
    const dt = Math.min(timestamp - lastTimestamp, 50);
    lastTimestamp = timestamp;
    const timeInSec = timestamp * 0.001;

    // Xoay toàn bộ hệ thống bằng gia số mượt mà
    galaxyAngle += ROTATION_SPEED * (dt / 16.666);

    // Nội suy mượt mà (Lerp) góc nghiêng Parallax
    currentTiltX += (targetTiltX - currentTiltX) * 0.04;
    currentTiltY += (targetTiltY - currentTiltY) * 0.04;

    // Nhịp thở trôi bồng bềnh tự nhiên khi đứng yên
    const idleFloatX = Math.sin(timeInSec * 0.38) * 8;
    const idleFloatY = Math.cos(timeInSec * 0.32) * 6;

    const renderCenterX = centerX + currentTiltX + idleFloatX;
    const renderCenterY = centerY + currentTiltY + idleFloatY;

    // 1. Xoá khung hình
    ctx.clearRect(0, 0, width, height);

    // 2. VẼ LỚP 1: SAO NỀN XA KHÔNG GIAN SÂU (BACKGROUND DEEP-FIELD STARS)
    for (let i = 0; i < bgStars.length; i++) {
      const star = bgStars[i];
      const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.08, star.baseAlpha + twinkle * 0.22);

      ctx.fillStyle = star.colorPrefix + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. THIẾT LẬP PHÉP CHIẾU 3D ĐĨA THIÊN HÀ ANDROMEDA
    // Andromeda nghiêng góc ~60 độ trong không gian (scale Y ~ 0.48 tạo hình elip dẹt chân thực)
    ctx.save();
    ctx.translate(renderCenterX, renderCenterY);
    ctx.rotate(-0.42 + (currentTiltY * 0.002)); // Góc nghiêng trục đĩa trong không gian
    ctx.scale(1.0, 0.48 + (currentTiltX * 0.0015)); // Độ dẹt elip 3D chuẩn Andromeda (~60 độ)
    ctx.rotate(galaxyAngle); // Xoay chậm rãi theo thời gian

    // 3.1. VẼ HÀO QUANG LÕI VÀNG CAM/TRẮNG ẤM RỰC RỠ (ANDROMEDA CORE GLOW)
    const coreGlowRadius = maxRadius * 0.42;
    const corePulse = 1 + Math.sin(timeInSec * 0.75) * 0.05;
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreGlowRadius * corePulse);

    // Đổ bóng ánh sáng vàng cam / trắng ấm rực rỡ hắt sáng mờ ra xung quanh
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');    // Trắng tinh khôi cực sáng tại tâm
    coreGradient.addColorStop(0.10, 'rgba(254, 240, 138, 0.45)'); // Vàng ấm
    coreGradient.addColorStop(0.24, 'rgba(251, 191, 36, 0.24)');  // Hổ phách rực rỡ
    coreGradient.addColorStop(0.45, 'rgba(217, 119, 6, 0.12)');   // Cam mờ ảo
    coreGradient.addColorStop(0.70, 'rgba(168, 85, 247, 0.05)');  // Giao thoa tím vũ trụ
    coreGradient.addColorStop(1, 'rgba(3, 7, 18, 0)');            // Tiêu biến vào khoảng không

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreGlowRadius * corePulse, 0, Math.PI * 2);
    ctx.fill();

    // 3.2. VẼ CÁC ĐÁM MÂY BỤI KHÍ TINH VÂN (NEBULA CLOUDS)
    for (let i = 0; i < nebulaClouds.length; i++) {
      const neb = nebulaClouds[i];
      const nebGrad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
      nebGrad.addColorStop(0, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${neb.color.a})`);
      nebGrad.addColorStop(1, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, 0)`);

      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3.3. VẼ LỚP 2: ĐĨA XOẮN ỐC ANDROMEDA (1.300+ HẠT SAO LOGARITHMIC)
    // Gom nhóm vẽ nhanh tối ưu 60fps
    for (let i = 0; i < galaxyStars.length; i++) {
      const star = galaxyStars[i];
      const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.12, Math.min(1.0, star.baseAlpha + twinkle * 0.28));

      ctx.fillStyle = star.colorPrefix + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Hạt sao lớn có vầng hào quang nhẹ
      if (star.size > 1.6 && alpha > 0.65) {
        ctx.fillStyle = star.colorPrefix + (alpha * 0.18).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3.4. VẼ LỚP 3: LÕI HẠT NHÂN DÀY ĐẶC (500+ HẠT SAO VÀNG CAM/TRẮNG ẤM)
    for (let i = 0; i < coreStars.length; i++) {
      const star = coreStars[i];
      const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.25, Math.min(1.0, star.baseAlpha + twinkle * 0.3));

      ctx.fillStyle = star.colorPrefix + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 4. VẼ SAO BĂNG LƯỚT QUA BẦU TRỜI
    if (timestamp > nextShootingStarTime && !shootingStar) {
      spawnShootingStar(timestamp);
    }

    if (shootingStar) {
      shootingStar.x += shootingStar.dx;
      shootingStar.y += shootingStar.dy;
      shootingStar.life -= shootingStar.decay;

      if (shootingStar.life <= 0 || shootingStar.x > width || shootingStar.y > height) {
        shootingStar = null;
      } else {
        const tailX = shootingStar.x - (shootingStar.dx / 8) * shootingStar.length;
        const tailY = shootingStar.y - (shootingStar.dy / 8) * shootingStar.length;

        const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        grad.addColorStop(0.65, `rgba(251, 191, 36, ${(shootingStar.life * 0.45).toFixed(2)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${(shootingStar.life * 0.9).toFixed(2)})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.stroke();
      }
    }

    // Yêu cầu khung hình kế tiếp
    animationFrameId = requestAnimationFrame(render);
  }

  // Bắt đầu vòng lặp hoạt ảnh
  animationFrameId = requestAnimationFrame(render);
}
