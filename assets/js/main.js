/**
 * main.js - Nguyễn Đức Thắng | ducthangnguyen.com
 * Ultra-Realistic High-Density Andromeda Cosmic Starfield Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo thư viện Lucide Icons
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // 2. Khởi tạo Dải ngân hà siêu mịn 3.500+ hạt sao (Ultra-Slow & High Readability)
  initAndromedaGalaxy();
});

/**
 * Động cơ thiên hà Andromeda đa tầng siêu mịn (Andromeda Starfield Engine)
 * - Mật độ 3.500 - 4.200 hạt sao li ti (0.5px - 1.0px) rải đều khắp không gian bầu trời
 * - Độ mờ đa tầng (0.15 - 0.8) tạo chiều sâu không gian vô tận như quan sát bằng kính thiên văn
 * - Tốc độ xoay siêu chậm êm dịu (Ultra-slow motion: ~0.00014 rad/frame, 1 vòng mất ~15-20 phút)
 * - Lớp phủ Vignette bảo vệ độ tương phản giúp cụm chữ Bio & Card luôn sắc nét, không bị lóa
 * - Tối ưu hoá gom Path (Batch Drawing) giữ vững 60fps mượt mà trên iPhone và Desktop
 */
function initAndromedaGalaxy() {
  const canvas = document.getElementById('galaxy-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Kích thước & Tọa độ
  let width = 0;
  let height = 0;
  let dpr = 1;
  let centerX = 0;
  let centerY = 0;
  let maxRadius = 0;

  // Cấu hình số lượng hạt sao: 3.000 - 4.500 hạt (đa số là hạt li ti rải đều màn hình)
  const isMobile = window.innerWidth < 768;
  const WIDE_SKY_STAR_COUNT = isMobile ? 1500 : 2300; // Lớp sao trải rộng toàn bầu trời đêm
  const GALAXY_ARM_STAR_COUNT = isMobile ? 900 : 1350; // Lớp đĩa xoắn ốc lan tỏa rộng
  const CORE_STAR_COUNT = isMobile ? 250 : 400;        // Lớp lõi sao ấm áp dịu nhẹ
  const NEBULA_CLOUD_COUNT = isMobile ? 12 : 20;       // Đám mây bụi khí tinh vân mờ ảo

  // Tốc độ xoay siêu chậm rãi (Ultra-slow motion: 0.00012 - 0.00016 rad/frame)
  // Giảm 1/4 - 1/5 so với trước để tạo cảm giác vũ trụ tĩnh mịch, an nhiên
  let galaxyAngle = 0;
  const ROTATION_SPEED = 0.00014;

  // Trạng thái Parallax 3D
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Quản lý hoạt ảnh & tiết kiệm pin
  let animationFrameId = null;
  let isPageVisible = true;
  let lastTimestamp = performance.now();

  // Bảng màu sao vũ trụ tinh tế:
  // Giảm độ chói, ưu tiên các tone trắng ngọc, lam băng, tím mờ và vàng ấm dịu
  const STAR_PALETTES = [
    'rgba(255, 255, 255, ',     // Trắng tinh khôi (hạt nhỏ li ti)
    'rgba(224, 242, 254, ',     // Lam băng thanh thoát
    'rgba(186, 230, 253, ',     // Xanh thiên thanh dịu mát
    'rgba(147, 197, 253, ',     // Soft Sky Blue
    'rgba(196, 181, 253, ',     // Tím tinh vân mờ ảo
    'rgba(167, 139, 250, ',     // Nebula Lavender
    'rgba(253, 230, 138, ',     // Vàng ánh kim dịu nhẹ
    'rgba(251, 191, 36, ',      // Hổ phách ấm áp (lõi ngân hà)
    'rgba(110, 231, 183, '      // Emerald starlight điểm xuyết
  ];

  // Màu sắc đám mây bụi khí mờ ảo (độ mờ rất thấp để không lóa mắt)
  const NEBULA_PALETTE = [
    { r: 251, g: 191, b: 36,  a: 0.022 }, // Vàng cam ấm mờ ở lõi
    { r: 168, g: 85,  b: 247, a: 0.018 }, // Tím vũ trụ dọc cánh tay
    { r: 56,  g: 189, b: 248, a: 0.016 }, // Xanh cyan khí hydro mờ
    { r: 16,  g: 185, b: 129, a: 0.012 }  // Xanh ngọc lục bảo viền ngoài
  ];

  // =========================================================================
  // 1. LỚP SAO RẢI ĐỀU TOÀN BẦU TRỜI MÀN HÌNH (WIDE-SKY STARFIELD)
  // 2.300+ hạt li ti (0.4px - 0.9px), độ mờ 0.15 - 0.7 rải đều khắp không gian
  // =========================================================================
  let wideSkyStars = [];
  function createWideSkyStars() {
    wideSkyStars = [];
    for (let i = 0; i < WIDE_SKY_STAR_COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;

      // Đa dạng kích thước: 90% hạt cực nhỏ li ti (0.4px - 0.8px), 10% hạt 0.9px - 1.2px
      const randSize = Math.random();
      const size = randSize < 0.90 ? (0.4 + Math.random() * 0.45) : (0.85 + Math.random() * 0.35);

      // Đa dạng độ mờ: 0.15 đến 0.75 tạo độ sâu thẳm nhiều lớp xa gần
      const baseAlpha = Math.random() * 0.55 + 0.15;

      // Chọn màu: 65% là trắng và lam băng, phần còn lại điểm xuyết tím/vàng nhạt
      let colorPrefix;
      if (randSize < 0.65) {
        colorPrefix = Math.random() < 0.6 ? STAR_PALETTES[0] : STAR_PALETTES[1];
      } else {
        colorPrefix = STAR_PALETTES[Math.floor(Math.random() * STAR_PALETTES.length)];
      }

      wideSkyStars.push({
        x,
        y,
        size,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.018 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        colorPrefix
      });
    }
  }

  // =========================================================================
  // 2. LỚP ĐĨA XOẮN ỐC ANDROMEDA LAN TỎA RỘNG (EXPANSIVE SPIRAL ARMS)
  // 1.350+ hạt uốn lượn tự nhiên theo hàm Logarit, phân tán rộng không dồn cục
  // =========================================================================
  let galaxyStars = [];
  function createGalaxyStars() {
    galaxyStars = [];
    const arms = 4; // 4 nhánh xoắn ốc phân tán rộng
    const twist = 2.4;

    for (let i = 0; i < GALAXY_ARM_STAR_COUNT; i++) {
      // Phân bổ bán kính trải rộng khắp đĩa thiên hà
      const distRatio = Math.pow(Math.random(), 1.35);
      const r = 35 + distRatio * (maxRadius - 35);

      const armIndex = i % arms;
      const armAngle = (armIndex * 2 * Math.PI) / arms;
      const spiralAngle = armAngle + Math.log(1 + (r / maxRadius) * 7.0) * twist;

      // Phân tán rộng vuông góc (Broad Gaussian Dispersion) để tạo dải mây sao mềm mại
      const spread = (Math.random() - 0.5) * (25 + r * 0.38);
      const finalAngle = spiralAngle + spread / (r + 1);

      const x = Math.cos(finalAngle) * r;
      const y = Math.sin(finalAngle) * r;

      // Kích thước hạt: Li ti 0.5px - 1.1px sắc nét
      const size = 0.5 + Math.random() * 0.55;

      // Độ mờ dịu mắt 0.2 - 0.65
      const baseAlpha = 0.18 + Math.random() * 0.45;

      let colorIndex;
      if (r < maxRadius * 0.3) {
        // Nhánh trong: Hòa trộn ánh sáng ấm nhẹ của lõi và lam băng
        colorIndex = Math.random() < 0.5 ? 6 : 1;
      } else if (r < maxRadius * 0.7) {
        // Thân nhánh: Tím mờ, xanh thiên thanh, ngọc lục bảo
        colorIndex = Math.floor(Math.random() * 6);
      } else {
        // Vành ngoài: Lam thẫm và tím mờ dịu
        colorIndex = Math.random() < 0.5 ? 4 : 3;
      }

      galaxyStars.push({
        x,
        y,
        r,
        size,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        colorPrefix: STAR_PALETTES[colorIndex]
      });
    }
  }

  // =========================================================================
  // 3. LỚP LÕI TRUNG TÂM ẤM ÁP DỊU NHẸ (SOFT WARM NUCLEUS)
  // Mật độ hạt vừa phải, ánh vàng hổ phách dịu không gây chói mắt
  // =========================================================================
  let coreStars = [];
  function createCoreStars() {
    coreStars = [];
    const coreRadius = maxRadius * 0.25;

    for (let i = 0; i < CORE_STAR_COUNT; i++) {
      const distRatio = Math.pow(Math.random(), 1.7);
      const r = distRatio * coreRadius;
      const angle = Math.random() * Math.PI * 2;

      // Khối elip hạt nhân dẹt tự nhiên
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * 0.72;

      // Tone màu vàng hổ phách dịu nhẹ
      const colorIndex = Math.random() < 0.4 ? 6 : (Math.random() < 0.7 ? 7 : 0);
      const size = 0.55 + Math.random() * 0.6;
      const baseAlpha = 0.22 + Math.random() * 0.48; // Giảm bớt độ chói

      coreStars.push({
        x,
        y,
        r,
        size,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.022 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        colorPrefix: STAR_PALETTES[colorIndex]
      });
    }
  }

  // =========================================================================
  // 4. CÁC ĐÁM MÂY KHÍ TINH VÂN MỜ DỊU (WHISPER NEBULA CLOUDS)
  // =========================================================================
  let nebulaClouds = [];
  function createNebulaClouds() {
    nebulaClouds = [];
    const arms = 4;
    for (let i = 0; i < NEBULA_CLOUD_COUNT; i++) {
      const distRatio = 0.15 + Math.random() * 0.7;
      const r = distRatio * maxRadius;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const angle = armAngle + Math.log(1 + (r / maxRadius) * 7.0) * 2.4 + (Math.random() - 0.5) * 0.4;

      nebulaClouds.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        radius: 50 + Math.random() * 85,
        color: NEBULA_PALETTE[Math.floor(Math.random() * NEBULA_PALETTE.length)]
      });
    }
  }

  // =========================================================================
  // 5. SAO BĂNG LƯỚT QUA BẦU TRỜI (SUBTLE OCCASIONAL METEOR)
  // =========================================================================
  let shootingStar = null;
  let nextShootingStarTime = performance.now() + 7000 + Math.random() * 8000;

  function spawnShootingStar(now) {
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25;
    const speed = 7 + Math.random() * 4;
    shootingStar = {
      x: Math.random() * (width * 0.75),
      y: Math.random() * (height * 0.3),
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      length: 80 + Math.random() * 60,
      life: 1.0,
      decay: 0.014 + Math.random() * 0.012
    };
    nextShootingStarTime = now + 12000 + Math.random() * 12000;
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
    // Desktop: Đặt lệch nhẹ sang phải (58% width, 50% height) để ôm lấy hệ thống 3 Card bên phải
    // Mobile: Ở giữa (50% width, 44% height) ôm nhẹ khối Profile
    if (width >= 1024) {
      centerX = width * 0.58;
      centerY = height * 0.50;
      maxRadius = Math.min(width, height) * 0.70;
    } else {
      centerX = width * 0.5;
      centerY = height * 0.44;
      maxRadius = Math.min(width, height) * 0.80;
    }

    createWideSkyStars();
    createGalaxyStars();
    createCoreStars();
    createNebulaClouds();
  }

  // =========================================================================
  // TƯƠNG TÁC PARALLAX 3D ÊM ÁI
  // =========================================================================
  function onMouseMove(e) {
    const normX = (e.clientX / width) * 2 - 1;
    const normY = (e.clientY / height) * 2 - 1;
    targetTiltX = normX * 22; // Độ dịch chuyển êm dịu (px)
    targetTiltY = normY * 16;
  }

  function onTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const normX = (touch.clientX / width) * 2 - 1;
      const normY = (touch.clientY / height) * 2 - 1;
      targetTiltX = normX * 14;
      targetTiltY = normY * 10;
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
  // VÒNG LẶP RENDER HOẠT ẢNH (ULTRA-SMOOTH 60FPS WITH BATCHED PATHS)
  // =========================================================================
  function render(timestamp) {
    if (!isPageVisible) return;

    // Delta-time duy trì tốc độ xoay siêu êm ổn định trên mọi tần số quét (60Hz, 120Hz ProMotion)
    const dt = Math.min(timestamp - lastTimestamp, 50);
    lastTimestamp = timestamp;
    const timeInSec = timestamp * 0.001;

    // Xoay toàn bộ hệ thống bằng gia số siêu chậm (Ultra-slow motion)
    galaxyAngle += ROTATION_SPEED * (dt / 16.666);

    // Nội suy mượt mà (Lerp) góc nghiêng Parallax
    currentTiltX += (targetTiltX - currentTiltX) * 0.035;
    currentTiltY += (targetTiltY - currentTiltY) * 0.035;

    // Nhịp thở trôi bồng bềnh cực nhẹ tự nhiên khi đứng yên
    const idleFloatX = Math.sin(timeInSec * 0.3) * 6;
    const idleFloatY = Math.cos(timeInSec * 0.25) * 4.5;

    const renderCenterX = centerX + currentTiltX + idleFloatX;
    const renderCenterY = centerY + currentTiltY + idleFloatY;

    // 1. Xoá khung hình
    ctx.clearRect(0, 0, width, height);

    // 2. VẼ LỚP 1: 2.300+ SAO LI TI RẢI ĐỀU TOÀN MÀN HÌNH (WIDE-SKY STARS)
    for (let i = 0; i < wideSkyStars.length; i++) {
      const star = wideSkyStars[i];
      const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.08, star.baseAlpha + twinkle * 0.18);

      ctx.fillStyle = star.colorPrefix + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. THIẾT LẬP PHÉP CHIẾU 3D ĐĨA THIÊN HÀ ANDROMEDA
    ctx.save();
    ctx.translate(renderCenterX, renderCenterY);
    ctx.rotate(-0.42 + (currentTiltY * 0.0015));
    ctx.scale(1.0, 0.48 + (currentTiltX * 0.0012)); // Độ dẹt elip ~60 độ chuẩn Andromeda
    ctx.rotate(galaxyAngle); // Xoay chậm rãi êm dịu

    // 3.1. VẼ HÀO QUANG LÕI VÀNG ẤM DỊU NHẸ (KHÔNG GÂY CHÓI MẮT)
    const coreGlowRadius = maxRadius * 0.38;
    const corePulse = 1 + Math.sin(timeInSec * 0.6) * 0.04;
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreGlowRadius * corePulse);

    // Tinh chỉnh độ sáng dịu mắt (hạ từ 0.85 xuống 0.42), chuyển màu mềm mại
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.42)');    // Trắng ngọc dịu tại tâm
    coreGradient.addColorStop(0.12, 'rgba(254, 240, 138, 0.24)'); // Vàng ấm nhạt
    coreGradient.addColorStop(0.28, 'rgba(251, 191, 36, 0.14)');  // Hổ phách mờ
    coreGradient.addColorStop(0.50, 'rgba(217, 119, 6, 0.06)');   // Cam mờ ảo
    coreGradient.addColorStop(0.75, 'rgba(168, 85, 247, 0.03)');  // Giao thoa tím vũ trụ
    coreGradient.addColorStop(1, 'rgba(3, 7, 18, 0)');            // Tiêu biến hoàn toàn

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreGlowRadius * corePulse, 0, Math.PI * 2);
    ctx.fill();

    // 3.2. VẼ CÁC ĐÁM MÂY BỤI KHÍ TINH VÂN MỜ DỊU (NEBULA CLOUDS)
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

    // 3.3. VẼ LỚP 2: ĐĨA XOẮN ỐC 1.350+ HẠT SAO LAN TỎA
    for (let i = 0; i < galaxyStars.length; i++) {
      const star = galaxyStars[i];
      const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.10, Math.min(0.75, star.baseAlpha + twinkle * 0.22));

      ctx.fillStyle = star.colorPrefix + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3.4. VẼ LỚP 3: LÕI HẠT NHÂN 400+ HẠT SAO VÀNG ẤM DỊU
    for (let i = 0; i < coreStars.length; i++) {
      const star = coreStars[i];
      const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
      const alpha = Math.max(0.18, Math.min(0.72, star.baseAlpha + twinkle * 0.24));

      ctx.fillStyle = star.colorPrefix + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 4. VẼ LỚP PHỦ VIGNETTE BẢO VỆ ĐỘ TƯƠNG PHẢN KHU VỰC CHỮ & BIO (READABILITY SHIELD)
    // Phủ nhẹ lớp gradient tối ở khu vực profile/tiêu đề để chữ luôn sắc nét và không bị lóa
    const vignetteTargetX = width >= 1024 ? width * 0.32 : width * 0.5;
    const vignetteTargetY = width >= 1024 ? height * 0.5 : height * 0.44;
    const vignetteRadius = Math.max(width, height) * 0.55;

    const textVignette = ctx.createRadialGradient(
      vignetteTargetX, vignetteTargetY, 20,
      vignetteTargetX, vignetteTargetY, vignetteRadius
    );
    textVignette.addColorStop(0, 'rgba(2, 6, 23, 0.40)');    // Vùng chữ: Tối dịu mờ màng
    textVignette.addColorStop(0.55, 'rgba(2, 6, 23, 0.18)'); // Chuyển tiếp mượt
    textVignette.addColorStop(1, 'rgba(2, 6, 23, 0)');       // Giữ trọn vẹn dải sao bên ngoài

    ctx.fillStyle = textVignette;
    ctx.fillRect(0, 0, width, height);

    // 5. VẼ SAO BĂNG LƯỚT QUA BẦU TRỜI
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
        grad.addColorStop(0.65, `rgba(251, 191, 36, ${(shootingStar.life * 0.35).toFixed(2)})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${(shootingStar.life * 0.8).toFixed(2)})`);

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
