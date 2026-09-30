/**
 * main.js - Nguyễn Đức Thắng | ducthangnguyen.com
 * Rotating Galaxy / Cosmic Starfield Background Engine & UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo thư viện Lucide Icons
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // 2. Khởi tạo Dải ngân hà xoay êm dịu (Rotating Galaxy / Cosmic Starfield)
  initGalaxyBackground();
});

/**
 * Hiệu ứng Dải ngân hà xoay êm dịu (Rotating Galaxy Background)
 * - Tối ưu 60fps mượt mà, siêu nhẹ, không nóng máy trên cả Mobile (iPhone) và Desktop
 * - Capped devicePixelRatio <= 2 để tiết kiệm pin tối đa
 * - Tự động dừng animation khi tab không hoạt động (Page Visibility API)
 * - Hiệu ứng Parallax 3D nghiêng nhẹ theo chuột (Desktop) và nhịp thở trôi bồng bềnh (Mobile)
 */
function initGalaxyBackground() {
  const canvas = document.getElementById('galaxy-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Cấu hình thông số ngân hà
  let width = 0;
  let height = 0;
  let dpr = 1;
  let centerX = 0;
  let centerY = 0;
  let maxRadius = 0;

  // Số lượng hạt tối ưu (nhẹ, lung linh, không hao pin)
  const isMobile = window.innerWidth < 768;
  const GALAXY_STAR_COUNT = isMobile ? 380 : 520;
  const BG_STAR_COUNT = isMobile ? 90 : 140;
  const NEBULA_CLOUD_COUNT = isMobile ? 14 : 22;

  // Trạng thái góc xoay & Parallax
  let galaxyAngle = 0;
  const ROTATION_SPEED = 0.00038; // Tốc độ xoay chậm rãi, êm dịu
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Quản lý trạng thái hoạt ảnh & hiệu năng
  let animationFrameId = null;
  let isPageVisible = true;
  let lastTimestamp = performance.now();

  // Bảng màu vũ trụ huyền ảo (Deep Space / Cosmic Blue-Purple / Emerald Glow)
  const STAR_COLORS = [
    'rgba(255, 255, 255, ',     // Trắng tinh khôi (lõi ngân hà)
    'rgba(186, 230, 253, ',     // Icy Blue (xanh thiên thanh)
    'rgba(125, 211, 252, ',     // Cyan sáng (công nghệ / IT)
    'rgba(192, 132, 252, ',     // Cosmic Purple (tím vũ trụ)
    'rgba(167, 139, 250, ',     // Nebula Violet (tím mờ ảo)
    'rgba(52, 211, 153, ',      // Emerald starlight (xanh ngọc lục bảo)
    'rgba(96, 165, 250, '       // Soft Blue
  ];

  const NEBULA_PALETTE = [
    { r: 168, g: 85,  b: 247 }, // Cosmic Purple
    { r: 56,  g: 189, b: 248 }, // Cyan Blue
    { r: 16,  g: 185, b: 129 }, // Emerald Glow
    { r: 99,  g: 102, b: 241 }  // Indigo Void
  ];

  // 1. Dữ liệu các hạt sao nền tĩnh & lấp lánh (Background Deep Field Stars)
  let bgStars = [];
  function createBgStars() {
    bgStars = [];
    for (let i = 0; i < BG_STAR_COUNT; i++) {
      bgStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.3 + 0.5,
        baseAlpha: Math.random() * 0.45 + 0.15,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        colorPrefix: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
      });
    }
  }

  // 2. Dữ liệu các hạt sao thuộc nhánh xoắn ốc Ngân hà (Spiral Galaxy Stars)
  let galaxyStars = [];
  function createGalaxyStars() {
    galaxyStars = [];
    const arms = 2; // 2 nhánh xoắn ốc chính cân đối
    const twist = 2.4; // Độ uốn cong của nhánh xoắn ốc

    for (let i = 0; i < GALAXY_STAR_COUNT; i++) {
      // Phân bổ hạt: Mật độ dày đặc ở tâm, thưa dần ra ngoài theo quy luật lũy thừa
      const distRatio = Math.pow(Math.random(), 1.6);
      const r = 18 + distRatio * (maxRadius - 18);

      // Nhánh xoắn ốc đối xứng
      const armIndex = i % arms;
      const armAngle = (armIndex * 2 * Math.PI) / arms;

      // Góc uốn xoắn ốc Logarithmic Spiral
      const spiralAngle = armAngle + Math.log(1 + (r / maxRadius) * 8) * twist;

      // Độ phân tán vuông góc với nhánh xoắn tạo độ dày tự nhiên cho dải mây sao
      const spread = (Math.random() - 0.5) * (18 + r * 0.28);
      const angleOffset = spread / (r + 1);
      const finalAngle = spiralAngle + angleOffset;

      // Tọa độ tương đối so với tâm ngân hà
      const x = Math.cos(finalAngle) * r;
      const y = Math.sin(finalAngle) * r;

      // Kích thước và màu sắc theo vị trí
      let colorIndex;
      if (r < maxRadius * 0.2) {
        // Lõi trong: Phần lớn là sao trắng và cyan sáng
        colorIndex = Math.random() < 0.65 ? 0 : 1;
      } else if (r < maxRadius * 0.65) {
        // Thân nhánh: Tím vũ trụ, xanh ngọc, xanh cyan
        colorIndex = Math.floor(Math.random() * STAR_COLORS.length);
      } else {
        // Rìa ngoài: Tím nhạt và xanh thẫm
        colorIndex = Math.random() < 0.5 ? 3 : 6;
      }

      // Kích thước hạt: Đa số nhỏ li ti, một số ít nổi bật tạo chiều sâu
      const randSize = Math.random();
      const size = randSize < 0.85 ? (0.6 + Math.random() * 0.9) : (1.6 + Math.random() * 1.2);

      galaxyStars.push({
        x,
        y,
        r,
        size,
        baseAlpha: Math.random() * 0.55 + 0.35,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        colorPrefix: STAR_COLORS[colorIndex]
      });
    }
  }

  // 3. Đám mây bụi khí vũ trụ (Nebula Gas Clouds)
  let nebulaClouds = [];
  function createNebulaClouds() {
    nebulaClouds = [];
    const arms = 2;
    for (let i = 0; i < NEBULA_CLOUD_COUNT; i++) {
      const distRatio = 0.15 + Math.random() * 0.7;
      const r = distRatio * maxRadius;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const angle = armAngle + Math.log(1 + (r / maxRadius) * 8) * 2.4 + (Math.random() - 0.5) * 0.4;

      nebulaClouds.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        radius: 40 + Math.random() * 70,
        color: NEBULA_PALETTE[Math.floor(Math.random() * NEBULA_PALETTE.length)],
        alpha: 0.025 + Math.random() * 0.035
      });
    }
  }

  // 4. Sao băng lướt qua bầu trời (Subtle Shooting Star)
  let shootingStar = null;
  let nextShootingStarTime = performance.now() + 5000 + Math.random() * 6000;

  function spawnShootingStar(now) {
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // Chéo 45 độ
    const speed = 7 + Math.random() * 5;
    shootingStar = {
      x: Math.random() * (width * 0.7),
      y: Math.random() * (height * 0.35),
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: 80 + Math.random() * 60,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.015
    };
    nextShootingStarTime = now + 9000 + Math.random() * 9000;
  }

  // Khởi tạo kích thước Canvas và tái tạo dữ liệu
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Khống chế tối đa 2x để nhẹ máy
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Tâm xoay ngân hà:
    // Trên Desktop: Hơi lệch nhẹ góc phải (58% width, 50% height) tạo thế bao bọc lấy các Card bên phải
    // Trên Mobile: Ở trung tâm (50% width, 44% height) bao trùm nhẹ khối Profile
    if (width >= 1024) {
      centerX = width * 0.58;
      centerY = height * 0.50;
      maxRadius = Math.min(width, height) * 0.65;
    } else {
      centerX = width * 0.5;
      centerY = height * 0.44;
      maxRadius = Math.min(width, height) * 0.75;
    }

    createBgStars();
    createGalaxyStars();
    createNebulaClouds();
  }

  // Lắng nghe di chuột / cảm ứng để tạo hiệu ứng 3D Parallax mượt mà
  function onMouseMove(e) {
    const normX = (e.clientX / width) * 2 - 1;
    const normY = (e.clientY / height) * 2 - 1;
    targetTiltX = normX * 26; // Độ lệch trục X (px)
    targetTiltY = normY * 18; // Độ lệch trục Y (px)
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

  // Tối ưu pin: Dừng render khi ẩn tab trình duyệt
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

  // Khởi tạo lần đầu
  resize();

  // Vòng lặp Render chính (60fps mượt mà)
  function render(timestamp) {
    if (!isPageVisible) return;

    // Tính delta time để tốc độ xoay ổn định trên mọi tần số quét màn hình (60Hz, 90Hz, 120Hz ProMotion)
    const dt = Math.min(timestamp - lastTimestamp, 50);
    lastTimestamp = timestamp;

    const timeInSec = timestamp * 0.001;

    // Cập nhật góc xoay ngân hà
    galaxyAngle += ROTATION_SPEED * (dt / 16.666);

    // Nội suy mượt mà (Lerp) góc nghiêng Parallax
    currentTiltX += (targetTiltX - currentTiltX) * 0.04;
    currentTiltY += (targetTiltY - currentTiltY) * 0.04;

    // Trên mobile hoặc khi không rê chuột: Hiệu ứng trôi bồng bềnh nhẹ tự nhiên
    const idleFloatX = Math.sin(timeInSec * 0.4) * 8;
    const idleFloatY = Math.cos(timeInSec * 0.35) * 6;

    const renderCenterX = centerX + currentTiltX + idleFloatX;
    const renderCenterY = centerY + currentTiltY + idleFloatY;

    // 1. Xóa khung hình sạch sẽ
    ctx.clearRect(0, 0, width, height);

    // 2. Vẽ các hạt sao nền tĩnh & lấp lánh (Background Deep Field)
    for (let i = 0; i < bgStars.length; i++) {
      const star = bgStars[i];
      const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.08, star.baseAlpha + twinkle * 0.25);

      ctx.fillStyle = star.colorPrefix + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Thiết lập ma trận biến đổi không gian 3D cho Dải Ngân Hà
    // Đĩa ngân hà nghiêng góc 3D tự nhiên (scale Y ~ 0.56) kèm góc xoay tổng
    ctx.save();
    ctx.translate(renderCenterX, renderCenterY);
    ctx.rotate(-0.35); // Góc nghiêng đĩa thiên hà trong không gian
    ctx.scale(1.0, 0.56); // Phép chiếu elip 3D nghiêng
    ctx.rotate(galaxyAngle); // Xoay chậm rãi theo thời gian

    // 3.1. Vẽ ánh sáng hào quang trung tâm Lõi Ngân Hà (Galactic Core Glow)
    const coreGlowRadius = maxRadius * 0.45;
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreGlowRadius);
    const corePulse = 1 + Math.sin(timeInSec * 0.8) * 0.06;

    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    coreGradient.addColorStop(0.12, 'rgba(192, 132, 252, 0.22)');
    coreGradient.addColorStop(0.35, 'rgba(56, 189, 248, 0.12)');
    coreGradient.addColorStop(0.65, 'rgba(16, 185, 129, 0.04)');
    coreGradient.addColorStop(1, 'rgba(3, 7, 18, 0)');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreGlowRadius * corePulse, 0, Math.PI * 2);
    ctx.fill();

    // 3.2. Vẽ các cụm mây bụi khí vũ trụ (Nebula Gas Clouds)
    for (let i = 0; i < nebulaClouds.length; i++) {
      const neb = nebulaClouds[i];
      const nebGrad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
      nebGrad.addColorStop(0, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, ${neb.alpha})`);
      nebGrad.addColorStop(1, `rgba(${neb.color.r}, ${neb.color.g}, ${neb.color.b}, 0)`);

      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3.3. Vẽ các hạt sao trên nhánh xoắn ốc Ngân Hà (Galaxy Stars)
    for (let i = 0; i < galaxyStars.length; i++) {
      const star = galaxyStars[i];
      const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.12, Math.min(1.0, star.baseAlpha + twinkle * 0.3));

      ctx.fillStyle = star.colorPrefix + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Điểm xuyết vầng sáng nhẹ cho các hạt sao lớn ở lõi
      if (star.size > 2.0 && alpha > 0.6) {
        ctx.fillStyle = star.colorPrefix + (alpha * 0.2).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // 4. Vẽ Sao băng (Shooting Star) thi thoảng vụt qua
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
        grad.addColorStop(0.7, `rgba(167, 139, 250, ${(shootingStar.life * 0.4).toFixed(2)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${(shootingStar.life * 0.85).toFixed(2)})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.stroke();
      }
    }

    // Yêu cầu khung hình tiếp theo
    animationFrameId = requestAnimationFrame(render);
  }

  // Bắt đầu vòng lặp
  animationFrameId = requestAnimationFrame(render);
}
