/**
 * Main Application Script
 * Handles language switching, animations, network canvas, and UI interactions
 */

class ApplicationManager {
  constructor() {
    this.languages = {
      en: 'en',
      ar: 'ar'
    };

    this.currentLang = localStorage.getItem('language') || this.languages.en;
    this.setupLanguage();
    this.setupNavigation();
    this.setupAnimations();
    this.setupInteractions();
    this.setupNetworkCanvas();
    this.setupDeadlineCounter();
    this.loadCommitteeMembers();
    this.loadQueries();
  }

  // ========== LANGUAGE MANAGEMENT ==========
  setupLanguage() {
    const langToggle = document.getElementById('langToggle');
    document.documentElement.setAttribute('lang', this.currentLang);
    if (this.currentLang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
    this.updateLangButton();
    this.updatePageContent();
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: this.currentLang } }));
    
    langToggle.addEventListener('click', () => this.toggleLanguage());
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === this.languages.en ? this.languages.ar : this.languages.en;
    document.documentElement.setAttribute('lang', this.currentLang);
    if (this.currentLang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.removeAttribute('dir');
    }
    localStorage.setItem('language', this.currentLang);
    this.updateLangButton();
    this.updatePageContent();
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: this.currentLang } }));
    if (this.queries) {
      const activeIndex = Math.max(0, Array.from(document.querySelectorAll('.query-btn')).findIndex(btn => btn.classList.contains('active')));
      this.selectQuery(this.queries, activeIndex, document.getElementById('terminalQuestion'), document.getElementById('terminalAnswer'));
    }
  }

  updateLangButton() {
    const langToggle = document.getElementById('langToggle');
    langToggle.textContent = this.currentLang === this.languages.en ? 'AR' : 'EN';
  }

  updatePageContent() {
    document.querySelectorAll('[data-en][data-ar]').forEach(element => {
      const text = this.currentLang === this.languages.en ? element.getAttribute('data-en') : element.getAttribute('data-ar');
      element.textContent = text;
    });

    document.querySelectorAll('[data-placeholder-en][data-placeholder-ar]').forEach(element => {
      const text = this.currentLang === this.languages.en ? element.getAttribute('data-placeholder-en') : element.getAttribute('data-placeholder-ar');
      element.setAttribute('placeholder', text);
    });

    document.querySelectorAll('[data-label-en][data-label-ar]').forEach(element => {
      const text = this.currentLang === this.languages.en ? element.getAttribute('data-label-en') : element.getAttribute('data-label-ar');
      element.setAttribute('data-label', text);
    });
  }

  // ========== NAVIGATION ==========
  setupNavigation() {
    const preloader = document.getElementById('preloader');
    const navbar = document.getElementById('navbar');
    const navLinks = document.getElementById('navLinks');
    const menuButton = document.getElementById('menuButton');
    const backTop = document.getElementById('backTop');

    // Preloader
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hide'), 550);
    });

    // Mobile menu toggle
    menuButton.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuButton.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuButton.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 40;
      navbar.classList.toggle('scrolled', scrolled);
      backTop.classList.toggle('show', window.scrollY > 520);
      this.updateActiveLink();
    });

    // Back to top button
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = 'home';
    
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 140) {
        current = section.id;
      }
    });

    document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // ========== ANIMATIONS ==========
  setupAnimations() {
    // Cursor halo
    const cursorHalo = document.getElementById('cursorHalo');
    document.addEventListener('mousemove', event => {
      cursorHalo.style.opacity = 1;
      cursorHalo.style.left = event.clientX + 'px';
      cursorHalo.style.top = event.clientY + 'px';
    });

    document.addEventListener('mouseleave', () => {
      cursorHalo.style.opacity = 0;
    });

    // Reveal observer
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13 });

    document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

    // Counter animation
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(counter => counterObserver.observe(counter));
  }

  animateCounter(counter) {
    const target = Number(counter.dataset.target);
    const prefix = counter.dataset.prefix || '';
    const suffix = counter.dataset.suffix || '';
    const start = performance.now();
    const duration = 1250;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
      counter.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  // ========== DEADLINE COUNTER ==========
  setupDeadlineCounter() {
    const updateDeadline = () => {
      const deadline = new Date('2026-04-26T23:59:00+01:00').getTime();
      const now = Date.now();
      let diff = Math.max(deadline - now, 0);

      const d = Math.floor(diff / 86400000); diff %= 86400000;
      const h = Math.floor(diff / 3600000); diff %= 3600000;
      const m = Math.floor(diff / 60000); diff %= 60000;
      const s = Math.floor(diff / 1000);

      document.getElementById('days').textContent = String(d).padStart(2, '0');
      document.getElementById('hours').textContent = String(h).padStart(2, '0');
      document.getElementById('minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    };

    updateDeadline();
    setInterval(updateDeadline, 1000);
  }

  // ========== COMMITTEE & QUERIES DATA ==========
  loadCommitteeMembers() {
    const committeeMembers = [
      ['Yassine Aniba', 'General Chair', 'الرئيس العام', 'IEEE RAS Tunisia Chapter', 'فرع IEEE RAS تونس'],
      ['Jinene Ben Said', 'General Chair', 'الرئيسة العامة', 'IEEE RAS SAC', 'لجنة أنشطة الطلبة في IEEE RAS'],
      ['Ahmed Aouididi', 'General Chair', 'الرئيس العام', 'IEEE RAS Tunisia Chapter', 'فرع IEEE RAS تونس'],
      ['Mohamed Amine Louati', 'Treasurer', 'أمين المال', 'IEEE RAS Tunisia Chapter', 'فرع IEEE RAS تونس'],
      ['Mohamed Amine Ben Helal', 'Technical Committee Chair', 'رئيس اللجنة التقنية', 'IEEE RAS Tunisia Chapter', 'فرع IEEE RAS تونس'],
      ['Wyssem Neila', 'Social Media Lead', 'مسؤول التواصل الاجتماعي', 'IEEE RAS Tunisia Chapter', 'فرع IEEE RAS تونس'],
      ['Azizi Hbaili', 'Branding Lead', 'مسؤول الهوية البصرية', 'IEEE ESPRIT SB', 'فرع IEEE الطلابي في ESPRIT'],
      ['Maryem Yousfi', 'Logistics Committee', 'لجنة اللوجستيك', 'IEEE ENICarthage SB', 'فرع IEEE الطلابي في ENICarthage'],
      ['Ahmed hihi', 'Logistics Committee', 'لجنة اللوجستيك', 'IEEE INSAT SB', 'فرع IEEE الطلابي في INSAT'],
      ['Yessmine Sallemi', 'Participants Coordinator', 'منسقة المشاركين', 'IEEE ENETCOM SB', 'فرع IEEE الطلابي في ENETCOM'],
      ['Yassine Soussi', 'Industry & Academic Coordinator', 'منسق الصناعة والأوساط الأكاديمية', 'IEEE ENIT SB', 'فرع IEEE الطلابي في ENIT'],
      ['Baha eddine Hammou', 'Program Committee', 'لجنة البرنامج', 'IEEE ENSIT SB', 'فرع IEEE الطلابي في ENSIT'],
      ['Mohamed Aziz Ben Slima', 'Program Committee', 'لجنة البرنامج', 'IEEE ESPRIT SB', 'فرع IEEE الطلابي في ESPRIT'],
      ['Nadine Jellali', 'Secretary', 'الكاتبة العامة', 'IEEE Tunisia Section', 'قسم IEEE تونس']
    ];

    const committeeGrid = document.getElementById('committeeGrid');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13 });

    committeeMembers.forEach((member, index) => {
      const initials = member[0].split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
      const card = document.createElement('article');
      card.className = 'committee-card glass reveal';
      card.style.transitionDelay = Math.min(index * 0.03, 0.3) + 's';
      card.innerHTML = `<div class="avatar">${initials}</div><h3>${member[0]}</h3><div class="role-tag" data-en="${member[1]}" data-ar="${member[2]}">${member[1]}</div><p data-en="${member[3]}" data-ar="${member[4]}">${member[3]}</p>`;
      committeeGrid.appendChild(card);
      revealObserver.observe(card);
    });

    this.updatePageContent();
  }

  loadQueries() {
    const queries = [
      ['QUERY_001', 'Who should attend the ICRA Satellite School?', 'من يمكنه حضور مدرسة ICRA الفضائية؟', 'Students, researchers, young professionals, IEEE members, and robotics enthusiasts interested in robotics, automation, AI, and intelligent systems.', 'الطلبة والباحثون والمهنيون الشباب وأعضاء IEEE والمهتمون بالروبوتات والأتمتة والذكاء الاصطناعي والأنظمة الذكية.'],
      ['QUERY_002', 'Will I receive a certificate of completion?', 'هل سأحصل على شهادة إتمام؟', 'Certificates may be provided to participants who attend the program and complete the required activities.', 'يمكن توفير شهادات للمشاركين الذين يحضرون البرنامج ويكملون الأنشطة المطلوبة.'],
      ['QUERY_003', 'What is included in the registration fee?', 'ماذا تشمل رسوم التسجيل؟', 'The registration fee can cover access to sessions, workshops, school activities, networking moments, and official event materials depending on the final package.', 'يمكن أن تشمل رسوم التسجيل حضور الجلسات وورش العمل وأنشطة المدرسة وفرص التواصل والمواد الرسمية للفعالية حسب الحزمة النهائية.'],
      ['QUERY_004', 'Will the sessions be recorded?', 'هل سيتم تسجيل الجلسات؟', 'Recording availability depends on the organizers and speakers. Follow official announcements for final details.', 'يعتمد توفر التسجيلات على المنظمين والمتحدثين. تابع الإعلانات الرسمية للحصول على التفاصيل النهائية.'],
      ['QUERY_005', 'Will there be networking opportunities?', 'هل توجد فرص للتواصل؟', 'Yes. The program includes networking with participants, mentors, IEEE representatives, researchers, and industry professionals.', 'نعم. يتضمن البرنامج فرص تواصل مع المشاركين والموجهين وممثلي IEEE والباحثين والمهنيين من القطاع.'],
      ['QUERY_006', 'What equipment do I need to bring?', 'ما المعدات التي يجب أن أحضرها؟', 'A laptop is strongly recommended for practical workshops, labs, and interactive technical sessions.', 'ينصح بشدة بإحضار حاسوب محمول لورش العمل التطبيقية والمخابر والجلسات التقنية التفاعلية.']
    ];
    this.queries = queries;

    const queryList = document.getElementById('queryList');
    const terminalQuestion = document.getElementById('terminalQuestion');
    const terminalAnswer = document.getElementById('terminalAnswer');

    // Create query buttons
    queries.forEach((query, index) => {
      const button = document.createElement('button');
      button.className = 'query-btn' + (index === 0 ? ' active' : '');
      button.type = 'button';
      button.innerHTML = `<strong>${query[0]}</strong><span data-en="${query[1]}" data-ar="${query[2]}">${query[1]}</span>`;
      button.addEventListener('click', () => this.selectQuery(queries, index, terminalQuestion, terminalAnswer));
      queryList.appendChild(button);
    });

    // Direct query button
    document.getElementById('directButton').addEventListener('click', () => {
      const value = document.getElementById('directInput').value.trim();
      terminalQuestion.textContent = this.currentLang === this.languages.en ? 'DIRECT_SYSTEM_QUERY' : 'استعلام مباشر';
      const answer = value
        ? (this.currentLang === this.languages.en ? 'Query not found in knowledge base. Contact support at icra-tep@ieee.tn for direct assistance.' : 'لم يتم العثور على هذا السؤال في قاعدة المعرفة. تواصل مع الدعم عبر icra-tep@ieee.tn للحصول على مساعدة مباشرة.')
        : (this.currentLang === this.languages.en ? 'Please type a question first.' : 'يرجى كتابة سؤال أولا.');
      this.typeText(terminalAnswer, answer);
    });

    // Load first query
    this.updatePageContent();
    this.selectQuery(queries, 0, terminalQuestion, terminalAnswer);
  }

  selectQuery(queries, index, terminalQuestion, terminalAnswer) {
    document.querySelectorAll('.query-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.query-btn')[index].classList.add('active');
    const question = this.currentLang === this.languages.en ? queries[index][1] : queries[index][2];
    const answer = this.currentLang === this.languages.en ? queries[index][3] : queries[index][4];
    terminalQuestion.textContent = queries[index][0] + ' :: ' + question;
    this.typeText(terminalAnswer, answer);
  }

  typeText(element, text) {
    element.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 12);
  }

  // ========== INTERACTIONS ==========
  setupInteractions() {
    // Tabs
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.program-panel').forEach(panel => panel.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
      });
    });

    // Modal
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');

    document.querySelectorAll('.coming-soon').forEach(button => {
      button.addEventListener('click', () => modal.classList.add('open'));
    });

    closeModal.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', event => {
      if (event.target === modal) modal.classList.remove('open');
    });
  }

  // ========== NETWORK CANVAS ==========
  setupNetworkCanvas() {
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    let points = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 17000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38
      }));
    };

    const drawNetwork = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 59, 77, 0.58)';
      ctx.strokeStyle = 'rgba(255, 59, 77, 0.14)';

      // Draw points
      for (const point of points) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

        ctx.beginPath();
        ctx.arc(point.x, point.y, 1.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.globalAlpha = 1 - dist / 130;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(drawNetwork);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawNetwork();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ApplicationManager();
});
