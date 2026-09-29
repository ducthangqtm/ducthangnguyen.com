/**
 * main.js - Nguyễn Đức Thắng | ducthangnguyen.com
 * Logic điều hướng, menu mobile, Lucide Icons và hiệu ứng tương tác
 */

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo thư viện Lucide Icons
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // Xử lý bật/tắt Mobile Navigation Drawer
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Đóng menu khi bấm vào bất kỳ mục liên kết nào
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Xử lý cuộn mượt mà (Smooth scroll) cho các liên kết anchor nội bộ
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Hiệu ứng thanh Header khi cuộn trang
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('shadow-lg', 'shadow-slate-950/40', 'border-slate-800');
        header.classList.remove('border-slate-800/80');
      } else {
        header.classList.remove('shadow-lg', 'shadow-slate-950/40');
        header.classList.add('border-slate-800/80');
      }
    });
  }
});
