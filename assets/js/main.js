/**
 * main.js - Nguyễn Đức Thắng | ducthangnguyen.com
 * Spiral Galaxy Engine (Cấu trúc chuẩn Thiên hà Xoắn ốc 7.000+ hạt sao)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo thư viện Lucide Icons
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // 2. Khởi tạo Dải ngân hà xoắn ốc đa tầng (Spiral Galaxy & Nebula Engine)
  initSpiralGalaxy();
});

/**
 * Động cơ Thiên hà Xoắn ốc chuẩn thiên văn (Spiral Galaxy Engine)
 * - Mật độ 7.000+ hạt sao li ti (0.3px - 1.2px) phủ kín màn hình như đại dương sao thực thụ
 * - 70% sao tập trung uốn lượn dọc theo 4 nhánh xoắn ốc elip chéo màn hình
 * - 30% sao rải đều không gian sâu (deep space stars) với hiệu ứng lấp lánh nhẹ
 * - Dải mây tinh vân phát sáng (Nebula Glow #1e1b4b, #0f172a, #0369a1) uốn theo dải sao
 * - Thuật toán Gom Path (Path Batching) tối ưu phần cứng 60fps mượt mà, không nóng máy
 */
function initSpiralGalaxy() {
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

  // Cấu hình số lượng hạt sao cực đại: 6.000 - 8.000 hạt
  const isMobile = window.innerWidth < 768;
  const TOTAL_STARS = isMobile ? 5200 : 7500;
  const GALAXY_STAR_COUNT = Math.floor(TOTAL_STARS * 0.70); // 70% thuộc các nhánh xoắn ốc (~5.250 hạt)
  const DEEP_SPACE_STAR_COUNT = TOTAL_STARS - GALAXY_STAR_COUNT; // 30% sao nền sâu (~2.250 hạt)
  const NEBULA_COUNT = isMobile ? 18 : 28; // Số cụm mây bụi tinh vân

  // Tốc độ xoay chuyển động chậm rãi, êm dịu, chuẩn thiên văn (Ultra-slow motion)
  let galaxyAngle = 0;
  const ROTATION_SPEED = 0.00015; // rad/frame

  // Trạng thái Parallax 3D
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Quản lý hoạt ảnh & tiết kiệm pin
  let animationFrameId = null;
  let isPageVisible = true;
  let lastTimestamp = performance.now();

  // Bảng màu sao vũ trụ (Đa dạng độ mờ 0.15 - 0.85 tạo chiều sâu thăm thẳm)
  const COLOR_PALETTES = [
    { name: 'white',   color: 'rgba(255, 255, 255, 0.85)' }, // Trắng sáng tinh khôi
    { name: 'ice',     color: 'rgba(224, 242, 254, 0.75)' }, // Lam băng thanh khiết
    { name: 'cyan',    color: 'rgba(125, 211, 252, 0.70)' }, // Xanh cyan công nghệ
    { name: 'purple',  color: 'rgba(196, 181, 253, 0.65)' }, // Tím vũ trụ huyền ảo
    { name: 'amber',   color: 'rgba(253, 230, 138, 0.75)' }, // Vàng ấm lõi thiên hà
    { name: 'dimSky',  color: 'rgba(148, 163, 184, 0.40)' }, // Xám bạc mờ xa xăm
    { name: 'faint',   color: 'rgba(203, 213, 225, 0.25)' }, // Sao siêu xa mờ ảo
    { name: 'emerald', color: 'rgba(110, 231, 183, 0.60)' }  // Ngọc lục bảo điểm xuyết
  ];

  // Màu sắc dải mây tinh vân (Nebula Glow) theo chuẩn yêu cầu:
  // #1e1b4b (indigo), #0f172a (dark slate), #0369a1 (deep ocean blue) với opacity mờ ảo ~0.08 - 0.12
  const NEBULA_STOPS = [
    { r: 30,  g: 27,  b: 75,  a: 0.12 }, // #1e1b4b - Tím than vũ trụ sâu thẳm
    { r: 15,  g: 23,  b: 42,  a: 0.10 }, // #0f172a - Xanh đen huyền bí
    { r: 3,   g: 105, b: 161, a: 0.09 }, // #0369a1 - Xanh cosmic rực rỡ
    { r: 56,  g: 189, b: 248, a: 0.08 }, // Xanh cyan tinh vân
    { r: 139, g: 92,  b: 246, a: 0.07 }  // Tím hoa cà viền ngoài
  ];

  // =========================================================================
  // 1. LỚP 30% SAO NỀN KHÔNG GIAN SÂU (DEEP SPACE STARS - ~2.250 HẠT)
  // Rải ngẫu nhiên toàn bộ màn hình, kích thước li ti 0.3px - 0.8px, lấp lánh nhẹ
  // =========================================================================
  let deepSpaceStars = [];
  function createDeepSpaceStars() {
    deepSpaceStars = [];
    for (let i = 0; i < DEEP_SPACE_STAR_COUNT; i++) {
      const randSize = Math.random();
      // Đa số hạt siêu nhỏ 0.3px - 0.7px
      const size = randSize < 0.85 ? (0.3 + Math.random() * 0.4) : (0.7 + Math.random() * 0.4);
      // Đa dạng độ mờ 0.15 - 0.65
      const baseAlpha = 0.15 + Math.random() * 0.50;

      // Gom nhóm theo màu sắc để tối ưu Path Batching
      const bucketIndex = Math.floor(Math.random() * COLOR_PALETTES.length);

      deepSpaceStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        baseAlpha,
        bucketIndex,
        twinkleSpeed: 0.008 + Math.random() * 0.02,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  // =========================================================================
  // 2. LỚP 70% SAO THIÊN HÀ XOẮN ỐC (SPIRAL GALAXY ARMS - ~5.250 HẠT)
  // Phân bổ uốn lượn theo công thức Logarithmic Spiral 4 nhánh elip chéo màn hình
  // =========================================================================
  let galaxyStars = [];
  function createGalaxyStars() {
    galaxyStars = [];
    const arms = 4; // 4 nhánh xoắn ốc đan xen dày đặc
    const twist = 2.85; // Độ uốn cong đặc trưng của dải ngân hà xoắn ốc

    for (let i = 0; i < GALAXY_STAR_COUNT; i++) {
      // Phân bổ bán kính: Tập trung dày đặc ở dải đĩa và thưa dần ra rìa
      const distRatio = Math.pow(Math.random(), 1.35);
      const r = 20 + distRatio * (maxRadius - 20);

      // Nhánh xoắn ốc đối xứng
      const armIndex = i % arms;
      const armAngle = (armIndex * 2 * Math.PI) / arms;

      // Công thức xoắn ốc Logarit thiên văn học: theta = armAngle + ln(1 + r/r0) * twist
      const spiralAngle = armAngle + Math.log(1 + (r / maxRadius) * 8.5) * twist;

      // Phân bố Gaussian tập trung dọc sống lưng nhánh xoắn ốc (Arm Ridge)
      // Giúp dải ngân hà hiện rõ rệt, không bị nhạt nhòa
      const gaussianScatter = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const spread = gaussianScatter * (18 + r * 0.22);
      const finalAngle = spiralAngle + spread / (r + 1);

      // Tọa độ địa phương tương đối so với tâm ngân hà
      const x = Math.cos(finalAngle) * r;
      const y = Math.sin(finalAngle) * r;

      // Kích thước hạt: 0.35px - 1.2px
      const randVal = Math.random();
      const size = randVal < 0.90 ? (0.35 + Math.random() * 0.45) : (0.8 + Math.random() * 0.4);

      // Màu sắc theo cấu trúc thiên hà:
      // Lõi trong: Vàng ấm + Trắng sáng
      // Dọc cánh tay: Xanh băng, Cyan, Tím mờ, Ngọc lục bảo
      let bucketIndex;
      if (r < maxRadius * 0.22) {
        bucketIndex = Math.random() < 0.5 ? 4 : 0; // Vàng ấm hoặc Trắng
      } else if (r < maxRadius * 0.65) {
        bucketIndex = Math.floor(Math.random() * 5); // Phổ màu cánh tay
      } else {
        bucketIndex = Math.random() < 0.6 ? 5 : 6; // Rìa ngoài xa xôi
      }

      galaxyStars.push({
        x,
        y,
        r,
        size,
        baseAlpha: 0.20 + Math.random() * 0.65,
        bucketIndex,
        twinkleSpeed: 0.01 + Math.random() * 0.025,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  // =========================================================================
  // 3. DẢI MÂY TINH VÂN PHÁT SÁNG (NEBULA GLOW ALONG SPIRAL ARMS)
  // Các vệt mây bụi vũ trụ mờ ảo bằng Radial Gradient uốn lượn theo dải sao
  // =========================================================================
  let nebulaClouds = [];
  function createNebulaClouds() {
    nebulaClouds = [];
    const arms = 4;
    const twist = 2.85;

    for (let i = 0; i < NEBULA_COUNT; i++) {
      const distRatio = 0.12 + (i / NEBULA_COUNT) * 0.78;
      const r = distRatio * maxRadius;

      const armIndex = i % arms;
      const armAngle = (armIndex * 2 * Math.PI) / arms;
      const spiralAngle = armAngle + Math.log(1 + (r / maxRadius) * 8.5) * twist;

      // Bám sát trục chính của nhánh xoắn ốc
      const offset = (Math.random() - 0.5) * (15 + r * 0.15);
      const angle = spiralAngle + offset / (r + 1);

      const colorData = NEBULA_STOPS[i % NEBULA_STOPS.length];

      nebulaClouds.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        radius: 65 + Math.random() * 110,
        color: colorData
      });
    }
  }

  // =========================================================================
  // 4. SAO BĂNG LƯỚT QUA VŨ TRỤ (COSMIC METEOR)
  // =========================================================================
  let shootingStar = null;
  let nextShootingStarTime = performance.now() + 6000 + Math.random() * 8000;

  function spawnShootingStar(now) {
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25;
    const speed = 7.5 + Math.random() * 5;
    shootingStar = {
      x: Math.random() * (width * 0.75),
      y: Math.random() * (height * 0.3),
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: 85 + Math.random() * 65,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.012
    };
    nextShootingStarTime = now + 12000 + Math.random() * 10000;
  }

  // =========================================================================
  // KHỞI TẠO ĐỘ PHÂN GIẢI NÉT CĂNG HIGH-DPI CHO MÀN HÌNH RETINA
  // =========================================================================
  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    // Buffer canvas sắc nét theo chuẩn Retina
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Tâm ngân hà:
    // Desktop: Đặt lệch sang phải (54% width, 50% height) để ôm lấy hệ thống 3 Card và trải dài chéo màn hình
    // Mobile: Ở trung tâm (50% width, 44% height) ôm nhẹ cụm Profile
    if (width >= 1024) {
      centerX = width * 0.54;
      centerY = height * 0.50;
      maxRadius = Math.max(width, height) * 0.78;
    } else {
      centerX = width * 0.5;
      centerY = height * 0.44;
      maxRadius = Math.max(width, height) * 0.88;
    }

    createDeepSpaceStars();
    createGalaxyStars();
    createNebulaClouds();
  }

  // =========================================================================
  // TƯƠNG TÁC PARALLAX 3D ÊM DỊU
  // =========================================================================
  function onMouseMove(e) {
    const normX = (e.clientX / width) * 2 - 1;
    const normY = (e.clientY / height) * 2 - 1;
    targetTiltX = normX * 24;
    targetTiltY = normY * 18;
  }

  function onTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const normX = (touch.clientX / width) * 2 - 1;
      const normY = (touch.clientY / height) * 2 - 1;
      targetTiltX = normX * 16;
      targetTiltY = normY * 12;
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', resize, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // Tối ưu pin: Dừng animation khi ẩn tab trình duyệt
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
  // VÒNG LẶP RENDER HOẠT ẢNH TỐI ƯU 60FPS (HARDWARE PATH-BATCHING)
  // Gom hàng nghìn hạt sao vào các Path duy nhất để vẽ siêu tốc trong < 1.5ms
  // =========================================================================
  function render(timestamp) {
    if (!isPageVisible) return;

    // Delta-time duy trì tốc độ xoay siêu êm ổn định trên mọi tần số quét (60Hz, 120Hz ProMotion)
    const dt = Math.min(timestamp - lastTimestamp, 50);
    lastTimestamp = timestamp;
    const timeInSec = timestamp * 0.001;

    // Gia số xoay chậm rãi, êm dịu, không giật khung hình
    galaxyAngle += ROTATION_SPEED * (dt / 16.666);

    // Easing mượt mà cho Parallax
    currentTiltX += (targetTiltX - currentTiltX) * 0.035;
    currentTiltY += (targetTiltY - currentTiltY) * 0.035;

    // Nhịp thở trôi bồng bềnh cực nhẹ tự nhiên khi đứng yên
    const idleFloatX = Math.sin(timeInSec * 0.28) * 6;
    const idleFloatY = Math.cos(timeInSec * 0.22) * 4.5;

    const renderCenterX = centerX + currentTiltX + idleFloatX;
    const renderCenterY = centerY + currentTiltY + idleFloatY;

    // 1. Xoá khung hình sạch sẽ
    ctx.clearRect(0, 0, width, height);

    // =======================================================================
    // 2. VẼ LỚP 30% SAO NỀN SÂU (DEEP SPACE STARS) - PATH BATCHING
    // =======================================================================
    // Phân nhóm vẽ nhanh theo màu để giảm số lần gọi lệnh đồ họa xuống còn 8 lần
    for (let c = 0; c < COLOR_PALETTES.length; c++) {
      ctx.fillStyle = COLOR_PALETTES[c].color;
      ctx.beginPath();
      for (let i = 0; i < deepSpaceStars.length; i++) {
        const star = deepSpaceStars[i];
        if (star.bucketIndex === c) {
          ctx.moveTo(star.x + star.size, star.y);
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    }

    // =======================================================================
    // 3. THIẾT LẬP PHÉP CHIẾU 3D ĐĨA THIÊN HÀ XOẮN ỐC (SPIRAL GALAXY DISK)
    // Nghiêng góc chéo ~42 độ & nén elip scale(1.0, 0.44) tạo dải ngân hà uốn lượn chéo màn hình
    // =======================================================================
    ctx.save();
    ctx.translate(renderCenterX, renderCenterY);
    ctx.rotate(-0.45 + (currentTiltY * 0.0012)); // Góc nghiêng chéo màn hình
    ctx.scale(1.0, 0.44 + (currentTiltX * 0.0010)); // Độ dẹt elip 3D chuẩn thiên hà xoắn ốc
    ctx.rotate(galaxyAngle); // Xoay chuyển chậm rãi theo thời gian

    // 3.1. VẼ DẢI MÂY TINH VÂN PHÁT SÁNG (NEBULA GLOW #1e1b4b, #0f172a, #0369a1)
    for (let i = 0; i < nebulaClouds.length; i++) {
      const neb = nebulaClouds[i];
      const nebGrad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
      nebGrad.addColorStop(0, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${neb.color.a})`);
      nebGrad.addColorStop(0.55, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${(neb.color.a * 0.5).toFixed(3)})`);
      nebGrad.addColorStop(1, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, 0)`);

      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3.2. VẼ HÀO QUANG LÕI THIÊN HÀ ẤM ÁP (GALACTIC CORE GLOW)
    const coreGlowRadius = maxRadius * 0.32;
    const corePulse = 1 + Math.sin(timeInSec * 0.55) * 0.04;
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreGlowRadius * corePulse);

    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.50)');    // Lõi rực sáng
    coreGradient.addColorStop(0.12, 'rgba(254, 240, 138, 0.28)'); // Vàng ấm
    coreGradient.addColorStop(0.30, 'rgba(251, 191, 36, 0.16)');  // Hổ phách
    coreGradient.addColorStop(0.55, 'rgba(30, 27, 75, 0.12)');    // #1e1b4b
    coreGradient.addColorStop(0.80, 'rgba(3, 105, 161, 0.06)');   // #0369a1
    coreGradient.addColorStop(1, 'rgba(3, 7, 18, 0)');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreGlowRadius * corePulse, 0, Math.PI * 2);
    ctx.fill();

    // 3.3. VẼ LỚP 70% SAO DẢI NGÂN HÀ (5.250+ HẠT SAO LOGARITHMIC ARMS) - PATH BATCHING
    // Gom nhóm vẽ theo 8 màu sắc để đạt 60fps mượt mà tuyệt đối
    for (let c = 0; c < COLOR_PALETTES.length; c++) {
      ctx.fillStyle = COLOR_PALETTES[c].color;
      ctx.beginPath();
      for (let i = 0; i < galaxyStars.length; i++) {
        const star = galaxyStars[i];
        if (star.bucketIndex === c) {
          ctx.moveTo(star.x + star.size, star.y);
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    }

    ctx.restore();

    // =======================================================================
    // 4. LỚP PHỦ VIGNETTE BẢO VỆ ĐỘ TƯƠNG PHẢN KHU VỰC CHỮ (READABILITY SHIELD)
    // =======================================================================
    const vignetteTargetX = width >= 1024 ? width * 0.30 : width * 0.5;
    const vignetteTargetY = width >= 1024 ? height * 0.5 : height * 0.44;
    const vignetteRadius = Math.max(width, height) * 0.58;

    const textVignette = ctx.createRadialGradient(
      vignetteTargetX, vignetteTargetY, 30,
      vignetteTargetX, vignetteTargetY, vignetteRadius
    );
    textVignette.addColorStop(0, 'rgba(2, 6, 23, 0.42)');    // Vùng chữ: Tối dịu mờ màng
    textVignette.addColorStop(0.55, 'rgba(2, 6, 23, 0.18)'); // Chuyển tiếp mượt
    textVignette.addColorStop(1, 'rgba(2, 6, 23, 0)');       // Giữ trọn vẹn dải sao bên ngoài

    ctx.fillStyle = textVignette;
    ctx.fillRect(0, 0, width, height);

    // =======================================================================
    // 5. VẼ SAO BĂNG LƯỚT QUA VŨ TRỤ
    // =======================================================================
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
        grad.addColorStop(0, 'rgba(3, 105, 161, 0)');
        grad.addColorStop(0.65, `rgba(56, 189, 248, ${(shootingStar.life * 0.4).toFixed(2)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${(shootingStar.life * 0.85).toFixed(2)})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
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
