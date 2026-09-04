  (function () {
    'use strict';

    /* ---------- Gallery data ---------- */
    let CATS = { portrait: 'Портрет', couple: 'Пары', wedding: 'Свадьба', family: 'Семья', featured: 'Избранное' };
    const items = [
      { url: 'assets/portfolio/04.jpg', cat: 'family', r: '3/2', title: 'Мирослава с семьёй' },
      { url: 'assets/portfolio/01.jpg', cat: 'portrait', r: '3/2', title: 'Анна в одуванчиках' },
      { url: 'assets/portfolio/66.webp', cat: 'featured', r: '2/3', title: 'Анна в вечернем свете' },
      { url: 'assets/portfolio/32.webp', cat: 'couple', r: '2/3', title: 'Алекс и Алеся — вместе' },
      { url: 'assets/portfolio/18.webp', cat: 'portrait', r: '2/3', title: 'Алиса — портрет' },
      { url: 'assets/portfolio/71.webp', cat: 'featured', r: '2/3', title: 'Прикосновение' },
      { url: 'assets/portfolio/38.webp', cat: 'wedding', r: '2/3', title: 'Николай и Анастасия — поцелуй' },
      { url: 'assets/portfolio/05.jpg', cat: 'portrait', r: '3/2', title: 'Алиса на закате' },
      { url: 'assets/portfolio/68.webp', cat: 'featured', r: '2/3', title: 'Эвелина у мельницы' },
      { url: 'assets/portfolio/43.webp', cat: 'family', r: '2/3', title: 'Семья Мирославы' },
      { url: 'assets/portfolio/19.webp', cat: 'portrait', r: '2/3', title: 'Анна — солнечный вечер' },
      { url: 'assets/portfolio/73.webp', cat: 'featured', r: '2/3', title: 'Маленький фотограф' },
      { url: 'assets/portfolio/35.webp', cat: 'couple', r: '2/3', title: 'Кристиян и Лиза — близко' },
      { url: 'assets/portfolio/09.jpg', cat: 'portrait', r: '3/2', title: 'Эвелина' },
      { url: 'assets/portfolio/41.webp', cat: 'wedding', r: '2/3', title: 'Сергей и Мария — прогулка' },
      { url: 'assets/portfolio/20.webp', cat: 'portrait', r: '2/3', title: 'Анна в воде' },
      { url: 'assets/portfolio/46.webp', cat: 'family', r: '2/3', title: 'Анна и Дамир — прогулка' },
      { url: 'assets/portfolio/11.jpg', cat: 'portrait', r: '2/3', title: 'Анна у моря' },
      { url: 'assets/portfolio/67.webp', cat: 'featured', r: '2/3', title: 'Алиса в сумерках' },
      { url: 'assets/portfolio/17.webp', cat: 'couple', r: '2/3', title: 'Алекс и Алеся — взгляд' },
      { url: 'assets/portfolio/22.webp', cat: 'portrait', r: '2/3', title: 'Эвелина у мельницы' },
      { url: 'assets/portfolio/03.jpg', cat: 'wedding', r: '2/3', title: 'Начало свадебного дня' },
      { url: 'assets/portfolio/12.jpg', cat: 'portrait', r: '2/3', title: 'Стефания' },
      { url: 'assets/portfolio/50.webp', cat: 'family', r: '3/2', title: 'Папа с малышом' },
      { url: 'assets/portfolio/72.webp', cat: 'featured', r: '2/3', title: 'Перед праздником' },
      { url: 'assets/portfolio/28.webp', cat: 'portrait', r: '2/3', title: 'В ожидании' },
      { url: 'assets/portfolio/02.jpg', cat: 'couple', r: '3/2', title: 'Кристиян и Лиза' },
      { url: 'assets/portfolio/14.jpg', cat: 'portrait', r: '2/3', title: 'Материнство' },
      { url: 'assets/portfolio/06.jpg', cat: 'wedding', r: '2/3', title: 'Сергей и Мария' },
      { url: 'assets/portfolio/55.webp', cat: 'family', r: '2/3', title: 'Таня и Вова с малышом' },
      { url: 'assets/portfolio/33.webp', cat: 'couple', r: '2/3', title: 'Алекс и Алеся — у моря' },
      { url: 'assets/portfolio/26.webp', cat: 'wedding', r: '2/3', title: 'Николай и Анастасия' },
      { url: 'assets/portfolio/59.webp', cat: 'family', r: '2/3', title: 'Первое знакомство' },
      { url: 'assets/portfolio/36.webp', cat: 'couple', r: '2/3', title: 'Кристиян и Лиза — на берегу' },
      { url: 'assets/portfolio/42.webp', cat: 'wedding', r: '2/3', title: 'Сергей и Мария — счастье' },
      { url: 'assets/portfolio/62.webp', cat: 'family', r: '2/3', title: 'Мамины объятия' },
      { url: 'assets/portfolio/34.webp', cat: 'couple', r: '2/3', title: 'Алекс и Алеся — нежность' },
      { url: 'assets/portfolio/27.webp', cat: 'wedding', r: '2/3', title: 'У алтаря' },
      { url: 'assets/portfolio/23.webp', cat: 'family', r: '2/3', title: 'Ирина и Стефания' },
      { url: 'assets/portfolio/37.webp', cat: 'couple', r: '2/3', title: 'Кристиян и Лиза — в воде' },
      { url: 'assets/portfolio/39.webp', cat: 'wedding', r: '2/3', title: 'Николай и Анастасия — тихий момент' },
      { url: 'assets/portfolio/08.jpg', cat: 'family', r: '2/3', title: 'Анна и Дамир' },
      { url: 'assets/portfolio/07.jpg', cat: 'couple', r: '3/2', title: 'Алекс и Алеся' },
      { url: 'assets/portfolio/40.webp', cat: 'wedding', r: '2/3', title: 'Николай и Анастасия — вдвоём' },
      { url: 'assets/portfolio/10.jpg', cat: 'family', r: '3/2', title: 'Семья Демченко' },
      { url: 'assets/portfolio/24.webp', cat: 'couple', r: '2/3', title: 'Кристиян и Лиза — у воды' },
      { url: 'assets/portfolio/44.webp', cat: 'family', r: '2/3', title: 'Праздник Мирославы' },
      { url: 'assets/portfolio/13.jpg', cat: 'family', r: '3/2', title: 'Семья Захаровых' },
      { url: 'assets/portfolio/15.jpg', cat: 'family', r: '3/2', title: 'Первые дни вместе' },
      { url: 'assets/portfolio/16.jpg', cat: 'family', r: '2/3', title: 'Таня и Вова' },
      { url: 'assets/portfolio/21.webp', cat: 'family', r: '2/3', title: 'Зимняя прогулка' },
      { url: 'assets/portfolio/25.webp', cat: 'family', r: '2/3', title: 'Поцелуй для малышки' },
      { url: 'assets/portfolio/29.webp', cat: 'family', r: '2/3', title: 'Таня с малышом' },
      { url: 'assets/portfolio/30.webp', cat: 'family', r: '2/3', title: 'Новорождённый дома' },
      { url: 'assets/portfolio/70.webp', cat: 'featured', r: '2/3', title: 'Тихое ожидание' },
      { url: 'assets/portfolio/31.webp', cat: 'family', r: '2/3', title: 'Семья у моря' },
      { url: 'assets/portfolio/45.webp', cat: 'family', r: '2/3', title: 'Мирослава с мамой' },
      { url: 'assets/portfolio/47.webp', cat: 'family', r: '2/3', title: 'Анна и Дамир — игра' },
      { url: 'assets/portfolio/48.webp', cat: 'family', r: '2/3', title: 'Мама и сын' },
      { url: 'assets/portfolio/49.webp', cat: 'family', r: '2/3', title: 'Осенний день' },
      { url: 'assets/portfolio/51.webp', cat: 'family', r: '3/2', title: 'Зимняя история Демченко' },
      { url: 'assets/portfolio/52.webp', cat: 'family', r: '2/3', title: 'Семья в снегу' },
      { url: 'assets/portfolio/53.webp', cat: 'family', r: '2/3', title: 'Ирина со Стефанией' },
      { url: 'assets/portfolio/54.webp', cat: 'family', r: '2/3', title: 'Домашняя игра' },
      { url: 'assets/portfolio/56.webp', cat: 'family', r: '2/3', title: 'Семейное Рождество' },
      { url: 'assets/portfolio/57.webp', cat: 'family', r: '2/3', title: 'Мама и малыш' },
      { url: 'assets/portfolio/58.webp', cat: 'family', r: '2/3', title: 'Таня и Вова — дома' },
      { url: 'assets/portfolio/60.webp', cat: 'family', r: '2/3', title: 'Родительская нежность' },
      { url: 'assets/portfolio/61.webp', cat: 'family', r: '2/3', title: 'Мама с новорождённым' },
      { url: 'assets/portfolio/63.webp', cat: 'family', r: '2/3', title: 'Семья Захаровых — вместе' },
      { url: 'assets/portfolio/64.webp', cat: 'family', r: '3/2', title: 'Прогулка у моря' },
      { url: 'assets/portfolio/69.webp', cat: 'featured', r: '2/3', title: 'У кромки воды' },
      { url: 'assets/portfolio/65.webp', cat: 'family', r: '2/3', title: 'Семейный вечер' },
    ];

    const gallery = document.getElementById('gallery');
    const loadMore = document.getElementById('loadMore');
    const ALL_PAGE_SIZE = 12;
    const sizeOf = r => (r === '1/1' ? [700, 700] : r === '4/5' ? [700, 875] : [700, 933]);
    const srcOf = it => it.url;

    /* admin-added photos live in localStorage and merge into the gallery */
    const ADMIN_PHOTOS_KEY = 'val_admin_photos';
    function loadAdminPhotos() {
      try {
        const saved = JSON.parse(localStorage.getItem(ADMIN_PHOTOS_KEY)) || [];
        return saved.filter(photo => ['portrait', 'couple', 'wedding', 'family'].includes(photo.cat));
      }
      catch (e) { return []; }
    }
    function saveAdminPhotos(list) { localStorage.setItem(ADMIN_PHOTOS_KEY, JSON.stringify(list)); }
    let allItems = items.concat(loadAdminPhotos());
    let activeFilter = 'all';
    let visibleAllCount = ALL_PAGE_SIZE;
    function rebuild() { allItems = items.concat(loadAdminPhotos()); applyFilter(); }
    function applyFilter() {
      const filtered = activeFilter === 'all' ? allItems : allItems.filter(it => it.cat === activeFilter);
      current = activeFilter === 'all' ? filtered.slice(0, visibleAllCount) : filtered.slice();
      render(current);
      loadMore.classList.toggle('hidden', activeFilter !== 'all' || visibleAllCount >= filtered.length);
    }

    function render(list) {
      gallery.innerHTML = list.map((it, i) => `
        <figure class="ph-card gallery-enter group relative overflow-hidden rounded-sm bg-sand cursor-pointer" style="--card-delay:${Math.min(i, 9) * 45}ms" data-index="${i}" tabindex="0" role="button" aria-label="Открыть фото: ${it.title}">
          <img src="${srcOf(it, ...sizeOf(it.r))}" alt="${it.title} — ${CATS[it.cat]}" loading="${i < 3 ? 'eager' : 'lazy'}" fetchpriority="${i < 3 ? 'high' : 'low'}" decoding="async" class="ph-img w-full object-cover" style="aspect-ratio:${it.r}" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <figcaption class="absolute bottom-0 inset-x-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span class="block text-[11px] uppercase tracking-widest text-white/70">${CATS[it.cat]}</span>
            <span class="block text-white text-sm font-medium">${it.title}</span>
          </figcaption>
          <span class="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-3-8h6M11 8v6"/></svg>
          </span>
        </figure>`).join('');
    }

    /* current visible list (for lightbox navigation) */
    let current = [];
    applyFilter();

    /* ---------- Filters ---------- */
    const filters = document.getElementById('filters');
    filters.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filters.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('is-active', 'bg-ink', 'text-white', 'border-ink');
        b.classList.add('bg-surface', 'text-soft', 'border-line');
      });
      btn.classList.add('is-active', 'bg-ink', 'text-white', 'border-ink');
      btn.classList.remove('bg-surface', 'text-soft', 'border-line');
      activeFilter = btn.dataset.filter;
      visibleAllCount = ALL_PAGE_SIZE;
      applyFilter();
    });

    loadMore.addEventListener('click', () => {
      visibleAllCount += ALL_PAGE_SIZE;
      applyFilter();
    });

    /* ---------- Lightbox ---------- */
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCap = document.getElementById('lbCaption');
    let idx = 0, lastFocus = null;

    function bigSrc(it) { return it.url; }

    function show(i) {
      idx = (i + current.length) % current.length;
      const it = current[idx];
      lbImg.src = bigSrc(it);
      lbImg.alt = it.title;
      lbCap.textContent = `${CATS[it.cat]} · ${it.title}`;
      lbImg.classList.remove('lb-swap');
      void lbImg.offsetWidth;
      lbImg.classList.add('lb-swap');
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.remove('hidden');
      lb.classList.add('flex');
      requestAnimationFrame(() => { lb.style.opacity = '1'; });
      document.body.style.overflow = 'hidden';
      document.getElementById('lbClose').focus();
    }
    function close() {
      lb.style.opacity = '0';
      setTimeout(() => { lb.classList.add('hidden'); lb.classList.remove('flex'); }, 320);
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    gallery.addEventListener('click', e => {
      const fig = e.target.closest('[data-index]');
      if (fig) open(+fig.dataset.index);
    });
    gallery.addEventListener('keydown', e => {
      const fig = e.target.closest('[data-index]');
      if (fig && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(+fig.dataset.index); }
    });

    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbNext').addEventListener('click', () => show(idx + 1));
    document.getElementById('lbPrev').addEventListener('click', () => show(idx - 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (lb.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });

    /* ---------- Scroll reveal ---------- */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      gallery.addEventListener('pointermove', e => {
        const card = e.target.closest('.ph-card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--photo-x', `${((e.clientX - r.left) / r.width - .5) * -8}px`);
        card.style.setProperty('--photo-y', `${((e.clientY - r.top) / r.height - .5) * -8}px`);
      }, { passive: true });
      gallery.addEventListener('pointerout', e => {
        const card = e.target.closest('.ph-card');
        if (!card || card.contains(e.relatedTarget)) return;
        card.style.setProperty('--photo-x', '0px');
        card.style.setProperty('--photo-y', '0px');
      });
    }

    document.querySelectorAll('.spot').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--spot-y', (e.clientY - r.top) + 'px');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--spot-x', '-9999px');
        card.style.setProperty('--spot-y', '-9999px');
      });
    });

    /* ---------- Nav: bg on scroll + auto-hide ---------- */
    const nav = document.getElementById('nav');
    const scrollProgress = document.getElementById('scrollProgress');
    const navMenu = document.getElementById('mobileMenu');
    const NAV_BG = ['bg-bg/90', 'backdrop-blur-md', 'border-b', 'border-line', 'shadow-[0_1px_0_rgba(0,0,0,0.02)]'];
    const NAV_HIDE_AFTER = 140;   /* не прячем, пока не отскроллили заметно */
    const NAV_PEEK_ZONE  = 80;    /* курсор в этой полосе сверху — шапка выезжает */
    let lastY = window.scrollY;
    let pointerAtTop = false;

    const navMenuOpen = () => !navMenu.classList.contains('hidden');
    const showNav = () => nav.classList.remove('nav-hidden');

    const onScroll = () => {
      const y = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.transform = `scaleX(${scrollable > 0 ? Math.min(y / scrollable, 1) : 0})`;

      if (y > 40) nav.classList.add(...NAV_BG);
      else nav.classList.remove(...NAV_BG);

      const goingDown = y > lastY;
      if (goingDown && y > NAV_HIDE_AFTER && !pointerAtTop && !navMenuOpen()) nav.classList.add('nav-hidden');
      else if (!goingDown || y <= NAV_HIDE_AFTER) showNav();

      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* курсор идёт к верхней кромке — возвращаем шапку */
    window.addEventListener('pointermove', e => {
      pointerAtTop = e.clientY <= NAV_PEEK_ZONE;
      if (pointerAtTop) showNav();
    }, { passive: true });

    /* клавиатурная навигация не должна упираться в скрытую шапку */
    nav.addEventListener('focusin', showNav);

    /* ---------- Mobile menu ---------- */
    const burger = document.getElementById('burger');
    const menu = document.getElementById('mobileMenu');
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('hidden') === false;
      burger.setAttribute('aria-expanded', String(open));
      if (open) showNav();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.add('hidden'); burger.setAttribute('aria-expanded', 'false');
    }));

    /* ============================================================
       INTERNATIONALISATION (RU default · ET · EN)
    ============================================================ */
    const I18N = {
      ru: {
        __doc: 'Valentina Šestero — фотограф',
        __cats: { portrait: 'Портрет', couple: 'Пары', wedding: 'Свадьба', family: 'Семья', featured: 'Избранное' },
        nav_portfolio: 'Портфолио', nav_about: 'Обо мне', nav_prices: 'Цены',
        nav_book: 'Связаться', nav_book_full: 'Связаться', menu_open: 'Открыть меню',
        hero_eyebrow: 'Фотограф · Эстония',
        hero_title: 'Живые истории<br />в <em class="italic font-normal">тихом свете</em>',
        hero_sub: 'Бережно снимаю портреты, пары, свадьбы и семьи — без напряжения, спешки и неестественных поз.',
        hero_cta: 'Написать в Instagram', hero_cta2: 'Смотреть работы', hero_scroll: 'Листайте',
        trust_years: 'лет в фотографии', trust_shoots: 'съёмок', trust_memories: 'тёплых воспоминаний',
        portfolio_eyebrow: 'Портфолио', portfolio_title: 'Избранные работы',
        portfolio_sub: 'Настоящие люди, близость и детали, которые хочется сохранить. Выберите историю, чтобы посмотреть фотографии.',
        filter_all: 'Все', filter_portrait: 'Портреты', filter_couple: 'Пары', filter_wedding: 'Свадьбы', filter_family: 'Семейные', gallery_more: 'Показать больше',
        rig_eyebrow1: 'Чем я снимаю', rig_title1: 'Каждый кадр<br />начинается здесь',
        rig_sub1: 'Прокрутите вниз — камера соберётся по деталям',
        rig_sub3: 'Мой основной инструмент для портретов и репортажа', rig_cta: 'Смотреть фотографии',
        about_eyebrow: 'Обо мне', about_title: 'Сохраняю то,<br />что чувствуете вы', about_photo_placeholder: 'Здесь будет портрет Валентины',
        about_p1: 'Меня зовут Валентина. Я снимаю людей и их близкие истории — бережно, спокойно и без лишней постановки.',
        about_p2: 'На съёмке не нужно уметь позировать. Мы знакомимся, разговариваем и двигаемся в удобном для вас темпе. Я мягко подсказываю, а вы можете просто быть собой.',
        about_f1: 'Естественный свет', about_f2: 'Деликатная ретушь', about_f3: 'Мягко направляю в кадре', about_f4: 'Срок отдачи 7–14 дней',
        about_cta: 'Связаться со мной', about_badge_hi: 'Привет', about_badge_txt: 'Я Валентина — и я люблю живые фотографии.',
        prices_eyebrow: 'Услуги и цены', prices_title: 'Форматы съёмки',
        prices_sub: 'Выберите подходящий формат съёмки. Детали и свободные даты можно обсудить в Instagram.',
        p1_name: 'Индивидуальная', p1_tag: 'Индивидуальный портрет', p1_price: '75 €',
        p1_f1: 'До 60 минут', p1_f2: 'На улице или в помещении', p1_f3: '50 обработанных фотографий', p1_f4: 'Закрытая онлайн-галерея',
        choose: 'Обсудить',
        p2_badge: 'Популярно', p2_name: 'Парная', p2_tag: 'История для двоих', p2_price: '80 €',
        p2_f1: 'До 60 минут', p2_f2: 'На улице или в помещении', p2_f3: '50 обработанных фотографий', p2_f4: 'Закрытая онлайн-галерея',
        p3_name: 'Семейная', p3_tag: 'Семья · 3–5 человек', p3_price: '100 €',
        p3_f1: 'До 90 минут', p3_f2: 'На улице или в помещении', p3_f3: 'Для 3–5 человек', p3_f4: '70 обработанных фотографий',
        p4_name: 'Свадебная', p4_tag: 'Свадьба · Помолвка', p4_price: '110 € / час',
        p4_f1: 'Съёмка помолвки', p4_f2: 'Парные фотографии', p4_f3: 'Закрытая онлайн-галерея', p4_f4: '70 обработанных фотографий',
        prices_note_studio: 'Аренда студии не входит в стоимость съёмки.',
        prices_note_events: 'Напишите в Instagram, чтобы узнать об event-съёмках.',
        prices_note_gift: 'Напишите в Instagram о подарочных сертификатах.',
        contact_eyebrow: 'Контакты', contact_title: 'Давайте сохраним<br /><em class="font-normal italic">вашу историю</em>',
        contact_sub: 'Напишите в Instagram или позвоните. Обсудим дату, формат и настроение будущей съёмки.',
        contact_reply: 'Обычно отвечаю в течение дня.', contact_phone_label: 'Телефон', contact_phone_action: 'Позвонить',
        contact_instagram_label: 'Instagram', contact_instagram_action: 'Написать',
        footer_copyright: '© 2026 Valentina Šestero. Все права защищены.',
        footer_privacy: 'Политика конфиденциальности', footer_cookies: 'Cookie-файлы',
        cookie_text: 'Мы используем cookie-файлы, чтобы сайт работал корректно и удобно. Продолжая, вы соглашаетесь с нашей политикой конфиденциальности.',
        cookie_more: 'Подробнее', cookie_decline: 'Отклонить', cookie_accept: 'Принять',
        privacy_title: 'Политика конфиденциальности',
        privacy_body: '<p>На сайте нет формы заявки, поэтому он не собирает ваше имя, телефон или описание съёмки.</p><p><strong>Cookie-файлы.</strong> Используются только настройки, необходимые для работы сайта и сохранения выбранного языка.</p><p><strong>Внешние сервисы.</strong> При нажатии на телефон или Instagram вы переходите к соответствующему приложению или сервису, где действуют их собственные правила конфиденциальности.</p>',
        admin_login_title: 'Вход в админ-панель', admin_login_sub: 'Введите имя пользователя и пароль',
        admin_user_label: 'Имя пользователя', admin_pass_label: 'Пароль', admin_login_btn: 'Войти',
        admin_error: 'Неверное имя пользователя или пароль', admin_panel_title: 'Управление фотографиями',
        admin_cat_label: 'Раздел', admin_ratio_label: 'Формат', admin_title_label: 'Подпись',
        admin_file_label: 'Файл фотографии', admin_add_btn: 'Добавить фото', admin_existing: 'Добавленные фото',
        admin_empty: 'Пока нет добавленных фото', admin_logout: 'Выйти'
      },
      et: {
        __doc: 'Valentina Šestero — fotograaf',
        __cats: { portrait: 'Portree', couple: 'Paar', wedding: 'Pulm', family: 'Pere', featured: 'Valik' },
        nav_portfolio: 'Portfoolio', nav_about: 'Minust', nav_prices: 'Hinnad',
        nav_book: 'Võta ühendust', nav_book_full: 'Võta ühendust', menu_open: 'Ava menüü',
        hero_eyebrow: 'Fotograaf · Eesti',
        hero_title: 'Elavad lood<br /><em class="italic font-normal">vaikses valguses</em>',
        hero_sub: 'Jäädvustan portreesid, paare, pulmi ja peresid rahulikult ning loomulikult — ilma pinge, kiirustamise ja jäikade poosideta.',
        hero_cta: 'Kirjuta Instagramis', hero_cta2: 'Vaata töid', hero_scroll: 'Keri',
        trust_years: 'aastat fotograafias', trust_shoots: 'pildistamist', trust_memories: 'sooja mälestust',
        portfolio_eyebrow: 'Portfoolio', portfolio_title: 'Valitud tööd',
        portfolio_sub: 'Päris inimesed, lähedus ja detailid, mida tahaks hoida. Vali lugu ja vaata fotosid.',
        filter_all: 'Kõik', filter_portrait: 'Portreed', filter_couple: 'Paarid', filter_wedding: 'Pulmad', filter_family: 'Pered', gallery_more: 'Näita rohkem',
        rig_eyebrow1: 'Millega ma pildistan', rig_title1: 'Iga kaader<br />algab siit',
        rig_sub1: 'Keri alla — kaamera koguneb detailhaaval',
        rig_sub3: 'Minu põhitööriist portreede ja reportaaži jaoks', rig_cta: 'Vaata fotosid',
        about_eyebrow: 'Minust', about_title: 'Jäädvustan selle,<br />mida teie tunnete', about_photo_placeholder: 'Siia tuleb Valentina portree',
        about_p1: 'Minu nimi on Valentina. Pildistan inimesi ja nende lähedasi lugusid rahulikult, tähelepanelikult ning ilma liigse lavastamiseta.',
        about_p2: 'Pildistamiseks ei pea oskama poseerida. Tutvume, räägime ja liigume teile sobivas tempos. Annan rahulikult juhiseid, et saaksite jääda iseendaks.',
        about_f1: 'Loomulik valgus', about_f2: 'Õrn retušš', about_f3: 'Rahulik juhendamine', about_f4: 'Fotod 7–14 päevaga',
        about_cta: 'Võta minuga ühendust', about_badge_hi: 'Tere', about_badge_txt: 'Olen Valentina ja armastan elavaid fotosid.',
        prices_eyebrow: 'Teenused ja hinnad', prices_title: 'Pildistamise valikud',
        prices_sub: 'Valige sobiv pildistamise formaat. Üksikasju ja vabu aegu saab arutada Instagramis.',
        p1_name: 'Individuaalne', p1_tag: 'Individuaalne portree', p1_price: '75 €',
        p1_f1: 'Kuni 60 minutit', p1_f2: 'Õues või siseruumis', p1_f3: '50 töödeldud fotot', p1_f4: 'Privaatne veebigalerii',
        choose: 'Arutame',
        p2_badge: 'Populaarne', p2_name: 'Paarisessioon', p2_tag: 'Lugu kahele', p2_price: '80 €',
        p2_f1: 'Kuni 60 minutit', p2_f2: 'Õues või siseruumis', p2_f3: '50 töödeldud fotot', p2_f4: 'Privaatne veebigalerii',
        p3_name: 'Perepildistamine', p3_tag: 'Pere · 3–5 inimest', p3_price: '100 €',
        p3_f1: 'Kuni 90 minutit', p3_f2: 'Õues või siseruumis', p3_f3: '3–5 inimesele', p3_f4: '70 töödeldud fotot',
        p4_name: 'Pulmapildistamine', p4_tag: 'Pulmad · Kihlus', p4_price: '110 € / tund',
        p4_f1: 'Kihluse fotosessioon', p4_f2: 'Paarifotod', p4_f3: 'Privaatne veebigalerii', p4_f4: '70 töödeldud fotot',
        prices_note_studio: 'Stuudio rent ei sisaldu pildistamise hinnas.',
        prices_note_events: 'Ürituste pildistamise info saamiseks kirjutage Instagramis.',
        prices_note_gift: 'Kinkekaardi võimaluste kohta kirjutage Instagramis.',
        contact_eyebrow: 'Kontakt', contact_title: 'Hoiame alles<br /><em class="font-normal italic">teie loo</em>',
        contact_sub: 'Kirjutage Instagramis või helistage. Räägime kuupäevast, formaadist ja soovitud meeleolust.',
        contact_reply: 'Vastan tavaliselt ühe päeva jooksul.', contact_phone_label: 'Telefon', contact_phone_action: 'Helista',
        contact_instagram_label: 'Instagram', contact_instagram_action: 'Kirjuta',
        footer_copyright: '© 2026 Valentina Šestero. Kõik õigused kaitstud.',
        footer_privacy: 'Privaatsuspoliitika', footer_cookies: 'Küpsised',
        cookie_text: 'Kasutame küpsiseid, et sait töötaks korrektselt ja mugavalt. Jätkates nõustute meie privaatsuspoliitikaga.',
        cookie_more: 'Loe lähemalt', cookie_decline: 'Keeldun', cookie_accept: 'Nõustun',
        privacy_title: 'Privaatsuspoliitika',
        privacy_body: '<p>Veebisaidil ei ole päringuvormi, seega ei koguta siin teie nime, telefoninumbrit ega pildistamise kirjeldust.</p><p><strong>Küpsised.</strong> Kasutatakse ainult saidi tööks ja valitud keele meeldejätmiseks vajalikke seadeid.</p><p><strong>Välised teenused.</strong> Telefoni või Instagrami lingile vajutades avaneb vastav rakendus või teenus, millele kehtivad selle enda privaatsustingimused.</p>',
        admin_login_title: 'Sisselogimine', admin_login_sub: 'Sisestage kasutajanimi ja parool',
        admin_user_label: 'Kasutajanimi', admin_pass_label: 'Parool', admin_login_btn: 'Logi sisse',
        admin_error: 'Vale kasutajanimi või parool', admin_panel_title: 'Fotode haldus',
        admin_cat_label: 'Kategooria', admin_ratio_label: 'Kuvasuhe', admin_title_label: 'Pealkiri',
        admin_file_label: 'Foto fail', admin_add_btn: 'Lisa foto', admin_existing: 'Lisatud fotod',
        admin_empty: 'Lisatud fotosid veel pole', admin_logout: 'Logi välja'
      },
      en: {
        __doc: 'Valentina Šestero — photographer',
        __cats: { portrait: 'Portrait', couple: 'Couple', wedding: 'Wedding', family: 'Family', featured: 'Featured' },
        nav_portfolio: 'Portfolio', nav_about: 'About', nav_prices: 'Pricing',
        nav_book: 'Get in touch', nav_book_full: 'Get in touch', menu_open: 'Open menu',
        hero_eyebrow: 'Photographer · Estonia',
        hero_title: 'Real stories<br />in <em class="italic font-normal">gentle light</em>',
        hero_sub: 'I photograph portraits, couples, weddings and families with a calm, natural approach — no pressure, rushing or stiff poses.',
        hero_cta: 'Message on Instagram', hero_cta2: 'View portfolio', hero_scroll: 'Scroll',
        trust_years: 'years in photography', trust_shoots: 'sessions', trust_memories: 'warm memories',
        portfolio_eyebrow: 'Portfolio', portfolio_title: 'Selected work',
        portfolio_sub: 'Real people, closeness and details worth keeping. Choose a story and explore the photographs.',
        filter_all: 'All', filter_portrait: 'Portraits', filter_couple: 'Couples', filter_wedding: 'Weddings', filter_family: 'Families', gallery_more: 'Show more',
        rig_eyebrow1: 'What I shoot with', rig_title1: 'Every frame<br />begins here',
        rig_sub1: 'Scroll down — the camera comes together piece by piece',
        rig_sub3: 'My main tool for portraits and documentary work', rig_cta: 'View photographs',
        about_eyebrow: 'About me', about_title: 'I preserve<br />what you feel', about_photo_placeholder: 'Valentina’s portrait will appear here',
        about_p1: 'My name is Valentina. I photograph people and the stories they share, with care, calm direction and very little staging.',
        about_p2: 'You do not need to know how to pose. We get acquainted, talk and move at a pace that feels comfortable. I offer gentle guidance so you can simply be yourself.',
        about_f1: 'Natural light', about_f2: 'Gentle retouching', about_f3: 'Calm, clear guidance', about_f4: 'Delivered in 7–14 days',
        about_cta: 'Get in touch', about_badge_hi: 'Hi', about_badge_txt: 'I\'m Valentina, and I love honest photographs.',
        prices_eyebrow: 'Services & pricing', prices_title: 'Session options',
        prices_sub: 'Choose the session that suits you. Message me on Instagram for details and availability.',
        p1_name: 'Individual', p1_tag: 'Individual portrait', p1_price: '€75',
        p1_f1: 'Up to 60 minutes', p1_f2: 'Outdoor or indoor', p1_f3: '50 edited photographs', p1_f4: 'Private online gallery',
        choose: 'Let\'s talk',
        p2_badge: 'Most popular', p2_name: 'Couple', p2_tag: 'A story for two', p2_price: '€80',
        p2_f1: 'Up to 60 minutes', p2_f2: 'Outdoor or indoor', p2_f3: '50 edited photographs', p2_f4: 'Private online gallery',
        p3_name: 'Family', p3_tag: 'Family · 3–5 people', p3_price: '€100',
        p3_f1: 'Up to 90 minutes', p3_f2: 'Outdoor or indoor', p3_f3: 'For 3–5 people', p3_f4: '70 edited photographs',
        p4_name: 'Wedding', p4_tag: 'Wedding · Engagement', p4_price: '€110 / hour',
        p4_f1: 'Engagement session', p4_f2: 'Couple photographs', p4_f3: 'Private online gallery', p4_f4: '70 edited photographs',
        prices_note_studio: 'Studio rental is not included in the session price.',
        prices_note_events: 'Message me on Instagram for information about event photography.',
        prices_note_gift: 'Message me on Instagram for gift card options.',
        contact_eyebrow: 'Contact', contact_title: 'Let\'s preserve<br /><em class="font-normal italic">your story</em>',
        contact_sub: 'Message me on Instagram or call. We can discuss the date, format and feeling you have in mind.',
        contact_reply: 'I usually reply within one day.', contact_phone_label: 'Phone', contact_phone_action: 'Call',
        contact_instagram_label: 'Instagram', contact_instagram_action: 'Message',
        footer_copyright: '© 2026 Valentina Šestero. All rights reserved.',
        footer_privacy: 'Privacy policy', footer_cookies: 'Cookies',
        cookie_text: 'We use cookies so the site works properly and comfortably. By continuing you agree to our privacy policy.',
        cookie_more: 'Learn more', cookie_decline: 'Decline', cookie_accept: 'Accept',
        privacy_title: 'Privacy policy',
        privacy_body: '<p>This website has no enquiry form, so it does not collect your name, phone number or session details.</p><p><strong>Cookies.</strong> Only settings needed for the site to work and remember your selected language are used.</p><p><strong>External services.</strong> Phone and Instagram links open the relevant app or service, where their own privacy terms apply.</p>',
        admin_login_title: 'Admin login', admin_login_sub: 'Enter your username and password',
        admin_user_label: 'Username', admin_pass_label: 'Password', admin_login_btn: 'Log in',
        admin_error: 'Wrong username or password', admin_panel_title: 'Photo manager',
        admin_cat_label: 'Section', admin_ratio_label: 'Aspect ratio', admin_title_label: 'Caption',
        admin_file_label: 'Photo file', admin_add_btn: 'Add photo', admin_existing: 'Added photos',
        admin_empty: 'No added photos yet', admin_logout: 'Log out'
      }
    };

    let currentLang = localStorage.getItem('val_lang') || 'ru';

    function applyLang(lang) {
      const dict = I18N[lang] || I18N.ru;
      currentLang = lang;
      document.documentElement.lang = lang;
      document.title = dict.__doc;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const v = dict[el.getAttribute('data-i18n')];
        if (v != null) el.textContent = v;
      });
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const v = dict[el.getAttribute('data-i18n-html')];
        if (v != null) el.innerHTML = v;
      });
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const v = dict[el.getAttribute('data-i18n-ph')];
        if (v != null) el.placeholder = v;
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const v = dict[el.getAttribute('data-i18n-aria')];
        if (v != null) el.setAttribute('aria-label', v);
      });
      CATS = dict.__cats;
      applyFilter();
      localStorage.setItem('val_lang', lang);
      document.querySelectorAll('.lang-btn').forEach(b => {
        const on = b.dataset.lang === lang;
        b.classList.toggle('bg-ink', on);
        b.classList.toggle('text-white', on);
        b.classList.toggle('text-faint', !on);
      });
    }

    document.querySelectorAll('.lang-btn').forEach(b => {
      b.addEventListener('click', () => applyLang(b.dataset.lang));
    });
    applyLang(currentLang);

    /* ============================================================
       COOKIE CONSENT
    ============================================================ */
    const cookieBanner = document.getElementById('cookieBanner');
    const COOKIE_KEY = 'val_cookie_consent';
    function showCookies() { cookieBanner.classList.remove('hidden'); }
    function hideCookies() { cookieBanner.classList.add('hidden'); }
    function setConsent(v) { localStorage.setItem(COOKIE_KEY, v); hideCookies(); }
    if (!localStorage.getItem(COOKIE_KEY)) showCookies();
    document.getElementById('cookieAccept').addEventListener('click', () => setConsent('accepted'));
    document.getElementById('cookieDecline').addEventListener('click', () => setConsent('declined'));
    document.getElementById('openCookies').addEventListener('click', showCookies);

    /* ============================================================
       PRIVACY MODAL
    ============================================================ */
    const privacyModal = document.getElementById('privacyModal');
    function openPrivacy() { privacyModal.classList.remove('hidden'); privacyModal.classList.add('flex'); document.body.style.overflow = 'hidden'; }
    function closePrivacy() { privacyModal.classList.add('hidden'); privacyModal.classList.remove('flex'); document.body.style.overflow = ''; }
    document.getElementById('openPrivacy').addEventListener('click', openPrivacy);
    document.getElementById('cookieMore').addEventListener('click', openPrivacy);
    document.getElementById('privacyClose').addEventListener('click', closePrivacy);
    privacyModal.addEventListener('click', e => { if (e.target === privacyModal) closePrivacy(); });

    /* ============================================================
       ADMIN PANEL  (client-side only — credentials are not secret)
    ============================================================ */
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'valentina';
    const adminModal = document.getElementById('adminModal');
    const adminLogin = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    const adminError = document.getElementById('adminError');
    const adminList  = document.getElementById('adminList');
    const adminEmpty = document.getElementById('adminEmpty');

    function isAuthed() { return sessionStorage.getItem('val_admin_auth') === '1'; }
    function renderAdminList() {
      const photos = loadAdminPhotos();
      adminEmpty.style.display = photos.length ? 'none' : '';
      adminList.innerHTML = photos.map(p => `
        <div class="relative group rounded-sm overflow-hidden border border-line">
          <img src="${p.url}" alt="${p.title || ''}" class="w-full h-24 object-cover" />
          <button data-del="${p.id}" class="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" aria-label="delete">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>`).join('');
    }
    function showAdminView() {
      if (isAuthed()) { adminLogin.classList.add('hidden'); adminPanel.classList.remove('hidden'); renderAdminList(); }
      else { adminPanel.classList.add('hidden'); adminLogin.classList.remove('hidden'); }
    }
    function openAdmin() { adminModal.classList.remove('hidden'); adminModal.classList.add('flex'); document.body.style.overflow = 'hidden'; showAdminView(); }
    function closeAdmin() { adminModal.classList.add('hidden'); adminModal.classList.remove('flex'); document.body.style.overflow = ''; }

    document.getElementById('adminClose').addEventListener('click', closeAdmin);
    adminModal.addEventListener('click', e => { if (e.target === adminModal) closeAdmin(); });

    document.getElementById('adminLoginForm').addEventListener('submit', e => {
      e.preventDefault();
      const u = document.getElementById('adminUser').value.trim();
      const p = document.getElementById('adminPass').value;
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem('val_admin_auth', '1');
        adminError.classList.add('hidden');
        document.getElementById('adminPass').value = '';
        showAdminView();
      } else {
        adminError.classList.remove('hidden');
      }
    });

    document.getElementById('adminLogout').addEventListener('click', () => {
      sessionStorage.removeItem('val_admin_auth');
      showAdminView();
    });

    document.getElementById('adminAddForm').addEventListener('submit', e => {
      e.preventDefault();
      const file = document.getElementById('adminFile').files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const photos = loadAdminPhotos();
        photos.push({
          id: 'a' + Date.now(),
          url: reader.result,
          cat: document.getElementById('adminCat').value,
          r: document.getElementById('adminRatio').value,
          title: document.getElementById('adminTitle').value.trim() || CATS[document.getElementById('adminCat').value]
        });
        try { saveAdminPhotos(photos); }
        catch (err) { alert('Storage full — try a smaller image.'); return; }
        rebuild();
        renderAdminList();
        e.target.reset();
      };
      reader.readAsDataURL(file);
    });

    adminList.addEventListener('click', e => {
      const btn = e.target.closest('[data-del]');
      if (!btn) return;
      saveAdminPhotos(loadAdminPhotos().filter(p => p.id !== btn.dataset.del));
      rebuild();
      renderAdminList();
    });

    /* ---------- secret entry: three quick clicks on the logo ---------- */
    const logo = document.getElementById('logo');
    let taps = 0, tapTimer = null;
    logo.addEventListener('click', e => {
      taps++;
      if (taps === 1) tapTimer = setTimeout(() => { taps = 0; }, 600);
      if (taps >= 3) { clearTimeout(tapTimer); taps = 0; e.preventDefault(); openAdmin(); }
    });

    /* close top-most overlay on Escape */
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!adminModal.classList.contains('hidden')) closeAdmin();
      else if (!privacyModal.classList.contains('hidden')) closePrivacy();
    });

  })();
