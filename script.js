  (function () {
    'use strict';

    /* ---------- Gallery data ---------- */
    let CATS = { portrait: 'Портрет', wedding: 'Свадьба', content: 'Контент', kids: 'Дети' };
    const items = [
      { img: '1508214751196-bcfd4ca60f91', cat: 'portrait', r: '3/4', title: 'Мягкий свет окна' },
      { img: '1529636798458-92182e662485', cat: 'wedding',  r: '4/5', title: 'Первый танец' },
      { img: '1503454537195-1dcabb73ffb9', cat: 'kids',     r: '1/1', title: 'Босиком по траве' },
      { img: '1522199755839-a2bacb67c546', cat: 'content',  r: '4/5', title: 'Утро бренда' },
      { img: '1494790108377-be9c29b29330', cat: 'portrait', r: '4/5', title: 'Взгляд' },
      { img: '1537633552985-df8429e8048b', cat: 'wedding',  r: '3/4', title: 'Сборы невесты' },
      { img: '1544005313-94ddf0286df2',    cat: 'portrait', r: '1/1', title: 'Тёплый профиль' },
      { img: '1516627145497-ae6968895b74', cat: 'kids',     r: '3/4', title: 'Смех' },
      { img: '1606216794074-735e91aa2c92', cat: 'content',  r: '1/1', title: 'Деталь' },
      { img: '1583939003579-730e3918a45a', cat: 'wedding',  r: '4/5', title: 'Вдвоём' },
      { img: '1524504388940-b1c1722653e1', cat: 'portrait', r: '4/5', title: 'Город на закате' },
      { img: '1567532939604-b6b5b0db2604', cat: 'content',  r: '3/4', title: 'Студийный кадр' },
    ];

    const gallery = document.getElementById('gallery');
    const sizeOf = r => (r === '1/1' ? [700, 700] : r === '4/5' ? [700, 875] : [700, 933]);
    const srcOf = (it, w, h) => it.url ? it.url : `https://images.unsplash.com/photo-${it.img}?q=80&w=${w}&h=${h}&auto=format&fit=crop`;

    /* admin-added photos live in localStorage and merge into the gallery */
    const ADMIN_PHOTOS_KEY = 'val_admin_photos';
    function loadAdminPhotos() {
      try { return JSON.parse(localStorage.getItem(ADMIN_PHOTOS_KEY)) || []; }
      catch (e) { return []; }
    }
    function saveAdminPhotos(list) { localStorage.setItem(ADMIN_PHOTOS_KEY, JSON.stringify(list)); }
    let allItems = items.concat(loadAdminPhotos());
    let activeFilter = 'all';
    function rebuild() { allItems = items.concat(loadAdminPhotos()); applyFilter(); }
    function applyFilter() {
      current = activeFilter === 'all' ? allItems.slice() : allItems.filter(it => it.cat === activeFilter);
      render(current);
    }

    function render(list) {
      gallery.innerHTML = list.map((it, i) => `
        <figure class="ph-card group relative overflow-hidden rounded-sm bg-sand cursor-pointer reveal in" data-index="${i}" tabindex="0" role="button" aria-label="Открыть фото: ${it.title}">
          <img src="${srcOf(it, ...sizeOf(it.r))}" alt="${it.title} — ${CATS[it.cat]}" loading="lazy" class="ph-img w-full object-cover" style="aspect-ratio:${it.r}" />
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
    let current = allItems.slice();
    render(current);

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
      applyFilter();
    });

    /* ---------- Lightbox ---------- */
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCap = document.getElementById('lbCaption');
    let idx = 0, lastFocus = null;

    function bigSrc(it) { return it.url ? it.url : `https://images.unsplash.com/photo-${it.img}?q=80&w=1600&auto=format`; }

    function show(i) {
      idx = (i + current.length) % current.length;
      const it = current[idx];
      lbImg.src = bigSrc(it);
      lbImg.alt = it.title;
      lbCap.textContent = `${CATS[it.cat]} · ${it.title}`;
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

    /* ---------- Booking form ---------- */
    const form = document.getElementById('bookingForm');
    const status = document.getElementById('formStatus');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.name.value.trim()) { form.name.focus(); return; }
      status.classList.remove('hidden');
      form.reset();
      setTimeout(() => status.classList.add('hidden'), 6000);
    });

    /* ============================================================
       INTERNATIONALISATION (RU default · ET · EN)
    ============================================================ */
    const I18N = {
      ru: {
        __doc: 'Валентина Орлова — Фотограф',
        __cats: { portrait: 'Портрет', wedding: 'Свадьба', content: 'Контент', kids: 'Дети' },
        nav_portfolio: 'Портфолио', nav_about: 'Обо мне', nav_prices: 'Цены', nav_reviews: 'Отзывы',
        nav_book: 'Записаться', nav_book_full: 'Записаться на съёмку', menu_open: 'Открыть меню',
        hero_eyebrow: 'Фотограф · Таллинн & путешествия',
        hero_title: 'Свет, тишина<br class="hidden sm:block" /> и <em class="italic font-normal">честные эмоции</em>',
        hero_sub: 'Снимаю спокойно и по-настоящему — портреты, свадьбы и семейные истории, к которым хочется возвращаться.',
        hero_cta: 'Записаться на съёмку', hero_cta2: 'Смотреть работы', hero_scroll: 'Листайте',
        trust_years: 'лет в фотографии', trust_shoots: 'съёмок', trust_memories: 'тёплых воспоминаний',
        portfolio_eyebrow: 'Портфолио', portfolio_title: 'Избранные работы',
        portfolio_sub: 'Каждая съёмка — отдельная история. Выберите категорию, чтобы посмотреть ближе.',
        filter_all: 'Все', filter_portrait: 'Портрет', filter_wedding: 'Свадьбы', filter_content: 'Контент', filter_kids: 'Дети',
        rig_eyebrow1: 'Чем я снимаю', rig_title1: 'Каждый кадр<br />начинается здесь',
        rig_sub1: 'Прокрутите вниз — соберём её по детали',
        rig_sub3: 'Мой основной инструмент для портрета и репортажа', rig_cta: 'Смотреть кадры с неё',
        about_eyebrow: 'Обо мне', about_title: 'Снимаю так,<br />как чувствую момент',
        about_p1: 'Меня зовут Валентина. Уже семь лет я помогаю людям сохранять самые честные, живые моменты — без скованных поз и фальшивых улыбок.',
        about_p2: 'Мне важно, чтобы на съёмке вам было легко. Мы просто общаемся, гуляем, смеёмся — а кадры рождаются сами. В результате вы получаете фотографии, на которых узнаёте себя настоящего.',
        about_f1: 'Естественный свет', about_f2: 'Деликатная ретушь', about_f3: 'Помогаю позировать', about_f4: 'Готовлю за 7–14 дней',
        about_cta: 'Обсудить вашу съёмку', about_badge_hi: 'Привет', about_badge_txt: 'Я Валентина — и я очень люблю свою работу.',
        prices_eyebrow: 'Услуги и цены', prices_title: 'Прозрачные пакеты',
        prices_sub: 'Никаких скрытых доплат. Выбирайте формат — остальное обсудим лично.',
        p1_name: 'Индивидуальная', p1_tag: 'Портрет · Love-story · Контент', p1_price: 'от 150 €',
        p1_f1: '1 час съёмки', p1_f2: '1 локация, помощь со стилем', p1_f3: '15 фото в ретуши', p1_f4: 'Все исходники в галерее',
        p1_ready: 'Готово за 7 дней', p1_deposit: 'Депозит 30%', choose: 'Выбрать',
        p2_badge: 'Хит', p2_name: 'Свадебная', p2_tag: 'Полный день вашей истории', p2_price: 'от 750 €',
        p2_f1: 'До 8 часов съёмки', p2_f2: 'Сборы, церемония, банкет', p2_f3: '250+ фото, 60 в ретуши', p2_f4: 'Помощь с таймингом дня',
        p2_ready: 'Готово за 21 день', p2_deposit: 'Депозит 50%', p2_cta: 'Забронировать дату',
        p3_name: 'Семейная', p3_tag: 'Дети · Family · Newborn', p3_price: 'от 200 €',
        p3_f1: '1,5 часа в комфортном темпе', p3_f2: 'Дом, студия или природа', p3_f3: '25 фото в ретуши', p3_f4: 'Бережно к детям и темпу',
        p3_ready: 'Готово за 10 дней', p3_deposit: 'Депозит 30%',
        prices_note: 'Выезд за город и другие города — обсуждается индивидуально. Депозит закрепляет дату и входит в стоимость.',
        reviews_eyebrow: 'Отзывы', reviews_title: 'Слова клиентов',
        review1_text: '«Боялась камеры всю жизнь, а с Валей забыла, что меня снимают. Фотографии — будто кто-то подсмотрел самые тёплые минуты».',
        review1_role: 'Индивидуальная съёмка',
        review2_text: '«Наша свадьба в кадрах — это кино. Валентина была незаметна весь день, а потом мы плакали от того, сколько всего она успела поймать».',
        review2_role: 'Свадебная съёмка',
        review3_text: '«С двумя малышами это казалось невозможным. Но получились живые, нежные кадры, где все настоящие — и смех, и слёзы».',
        review3_role: 'Семейная съёмка',
        contact_eyebrow: 'Контакты', contact_title: 'Давайте создадим<br />вашу историю',
        contact_sub: 'Расскажите о задумке — формат, дата, настроение. Отвечаю в течение дня и помогаю всё спланировать.',
        contact_mail_label: 'Почта', contact_phone_label: 'Телефон / WhatsApp',
        form_title: 'Записаться на съёмку', form_name_label: 'Ваше имя', form_name_ph: 'Как к вам обращаться',
        form_phone_label: 'Телефон', form_format_label: 'Формат',
        form_opt1: 'Индивидуальная', form_opt2: 'Свадебная', form_opt3: 'Семейная / Дети', form_opt4: 'Контент для бизнеса',
        form_msg_label: 'Расскажите о съёмке', form_msg_ph: 'Желаемая дата, идея, настроение...',
        form_submit: 'Отправить заявку', form_success: 'Спасибо! Я свяжусь с вами в течение дня.',
        footer_copyright: '© 2026 Валентина Орлова. Все права защищены.',
        footer_privacy: 'Политика конфиденциальности', footer_cookies: 'Cookie-файлы',
        cookie_text: 'Мы используем cookie-файлы, чтобы сайт работал корректно и удобно. Продолжая, вы соглашаетесь с нашей политикой конфиденциальности.',
        cookie_more: 'Подробнее', cookie_decline: 'Отклонить', cookie_accept: 'Принять',
        privacy_title: 'Политика конфиденциальности',
        privacy_body: '<p>Настоящая политика описывает, как обрабатываются персональные данные на этом сайте.</p><p><strong>Какие данные собираются.</strong> Через форму записи мы получаем ваше имя, телефон и описание съёмки — только для связи с вами и организации съёмки.</p><p><strong>Cookie-файлы.</strong> Мы используем необходимые cookie-файлы для корректной работы сайта и сохранения выбранного языка. Вы можете отклонить необязательные cookie в баннере.</p><p><strong>Хранение и передача.</strong> Данные не передаются третьим лицам и используются только фотографом Валентиной Орловой.</p><p><strong>Ваши права.</strong> Вы можете запросить удаление своих данных, написав на hello@valentina.photo.</p>',
        admin_login_title: 'Вход в админ-панель', admin_login_sub: 'Введите имя пользователя и пароль',
        admin_user_label: 'Имя пользователя', admin_pass_label: 'Пароль', admin_login_btn: 'Войти',
        admin_error: 'Неверное имя пользователя или пароль', admin_panel_title: 'Управление фотографиями',
        admin_cat_label: 'Раздел', admin_ratio_label: 'Формат', admin_title_label: 'Подпись',
        admin_file_label: 'Файл фотографии', admin_add_btn: 'Добавить фото', admin_existing: 'Добавленные фото',
        admin_empty: 'Пока нет добавленных фото', admin_logout: 'Выйти'
      },
      et: {
        __doc: 'Valentina Orlova — Fotograaf',
        __cats: { portrait: 'Portree', wedding: 'Pulm', content: 'Sisu', kids: 'Lapsed' },
        nav_portfolio: 'Portfoolio', nav_about: 'Minust', nav_prices: 'Hinnad', nav_reviews: 'Arvustused',
        nav_book: 'Broneeri', nav_book_full: 'Broneeri pildistamine', menu_open: 'Ava menüü',
        hero_eyebrow: 'Fotograaf · Tallinn & reisid',
        hero_title: 'Valgus, vaikus<br class="hidden sm:block" /> ja <em class="italic font-normal">ausad emotsioonid</em>',
        hero_sub: 'Pildistan rahulikult ja ehedalt — portreed, pulmad ja perelood, mille juurde tahaks naasta.',
        hero_cta: 'Broneeri pildistamine', hero_cta2: 'Vaata töid', hero_scroll: 'Keri',
        trust_years: 'aastat fotograafias', trust_shoots: 'pildistamist', trust_memories: 'sooja mälestust',
        portfolio_eyebrow: 'Portfoolio', portfolio_title: 'Valitud tööd',
        portfolio_sub: 'Iga pildistamine on omaette lugu. Vali kategooria, et vaadata lähemalt.',
        filter_all: 'Kõik', filter_portrait: 'Portree', filter_wedding: 'Pulmad', filter_content: 'Sisu', filter_kids: 'Lapsed',
        rig_eyebrow1: 'Millega ma pildistan', rig_title1: 'Iga kaader<br />algab siit',
        rig_sub1: 'Keri alla — paneme selle detailhaaval kokku',
        rig_sub3: 'Minu põhitööriist portree ja reportaaži jaoks', rig_cta: 'Vaata sellega tehtud kaadreid',
        about_eyebrow: 'Minust', about_title: 'Pildistan nii,<br />nagu tunnen hetke',
        about_p1: 'Minu nimi on Valentina. Juba seitse aastat aitan inimestel jäädvustada kõige ausamaid, elavaid hetki — ilma kohmakate poosside ja võltsnaeratusteta.',
        about_p2: 'Minu jaoks on oluline, et pildistamisel oleks teil kerge olla. Me lihtsalt vestleme, jalutame, naerame — ja kaadrid sünnivad iseenesest. Tulemuseks saate fotod, millelt tunnete ära tõelise iseenda.',
        about_f1: 'Loomulik valgus', about_f2: 'Õrn retušš', about_f3: 'Aitan poseerida', about_f4: 'Valmis 7–14 päevaga',
        about_cta: 'Aruta oma pildistamist', about_badge_hi: 'Tere', about_badge_txt: 'Olen Valentina — ja ma armastan oma tööd.',
        prices_eyebrow: 'Teenused ja hinnad', prices_title: 'Läbipaistvad paketid',
        prices_sub: 'Mingeid varjatud lisatasusid. Vali formaat — ülejäänu arutame isiklikult.',
        p1_name: 'Individuaalne', p1_tag: 'Portree · Love-story · Sisu', p1_price: 'alates 150 €',
        p1_f1: '1 tund pildistamist', p1_f2: '1 asukoht, abi stiiliga', p1_f3: '15 retušitud fotot', p1_f4: 'Kõik originaalid galeriis',
        p1_ready: 'Valmis 7 päevaga', p1_deposit: 'Ettemaks 30%', choose: 'Vali',
        p2_badge: 'Hitt', p2_name: 'Pulmapakett', p2_tag: 'Teie loo terve päev', p2_price: 'alates 750 €',
        p2_f1: 'Kuni 8 tundi pildistamist', p2_f2: 'Ettevalmistus, tseremoonia, pidu', p2_f3: '250+ fotot, 60 retušitud', p2_f4: 'Abi päeva ajakavaga',
        p2_ready: 'Valmis 21 päevaga', p2_deposit: 'Ettemaks 50%', p2_cta: 'Broneeri kuupäev',
        p3_name: 'Perepakett', p3_tag: 'Lapsed · Family · Newborn', p3_price: 'alates 200 €',
        p3_f1: '1,5 tundi mugavas tempos', p3_f2: 'Kodu, stuudio või loodus', p3_f3: '25 retušitud fotot', p3_f4: 'Hoolivalt laste ja tempoga',
        p3_ready: 'Valmis 10 päevaga', p3_deposit: 'Ettemaks 30%',
        prices_note: 'Väljasõit maapiirkonda ja teistesse linnadesse — kokkuleppel. Ettemaks kinnitab kuupäeva ja sisaldub hinnas.',
        reviews_eyebrow: 'Arvustused', reviews_title: 'Klientide sõnad',
        review1_text: '«Kartsin kaamerat kogu elu, aga Valentinaga unustasin, et mind pildistatakse. Fotod on justkui keegi oleks salaja tabanud kõige soojemad hetked.»',
        review1_role: 'Individuaalne pildistamine',
        review2_text: '«Meie pulmad kaadrites on nagu film. Valentina oli terve päeva märkamatu ja siis me nutsime, kui palju ta oli jõudnud tabada.»',
        review2_role: 'Pulmafotograafia',
        review3_text: '«Kahe väikelapsega tundus see võimatu. Aga tulid elavad, õrnad kaadrid, kus kõik on ehtsad — nii naer kui pisarad.»',
        review3_role: 'Perepildistamine',
        contact_eyebrow: 'Kontakt', contact_title: 'Loome koos<br />teie loo',
        contact_sub: 'Rääkige oma ideest — formaat, kuupäev, meeleolu. Vastan päeva jooksul ja aitan kõik planeerida.',
        contact_mail_label: 'E-post', contact_phone_label: 'Telefon / WhatsApp',
        form_title: 'Broneeri pildistamine', form_name_label: 'Teie nimi', form_name_ph: 'Kuidas teid kutsuda',
        form_phone_label: 'Telefon', form_format_label: 'Formaat',
        form_opt1: 'Individuaalne', form_opt2: 'Pulmapakett', form_opt3: 'Pere / Lapsed', form_opt4: 'Sisu ettevõttele',
        form_msg_label: 'Rääkige pildistamisest', form_msg_ph: 'Soovitud kuupäev, idee, meeleolu...',
        form_submit: 'Saada päring', form_success: 'Aitäh! Võtan teiega päeva jooksul ühendust.',
        footer_copyright: '© 2026 Valentina Orlova. Kõik õigused kaitstud.',
        footer_privacy: 'Privaatsuspoliitika', footer_cookies: 'Küpsised',
        cookie_text: 'Kasutame küpsiseid, et sait töötaks korrektselt ja mugavalt. Jätkates nõustute meie privaatsuspoliitikaga.',
        cookie_more: 'Loe lähemalt', cookie_decline: 'Keeldun', cookie_accept: 'Nõustun',
        privacy_title: 'Privaatsuspoliitika',
        privacy_body: '<p>Käesolev poliitika kirjeldab, kuidas sellel saidil isikuandmeid töödeldakse.</p><p><strong>Milliseid andmeid kogutakse.</strong> Broneerimisvormi kaudu saame teie nime, telefoni ja pildistamise kirjelduse — ainult teiega ühenduse võtmiseks ja pildistamise korraldamiseks.</p><p><strong>Küpsised.</strong> Kasutame vajalikke küpsiseid saidi korrektseks tööks ja valitud keele salvestamiseks. Mittevajalikest küpsistest saate bänneris keelduda.</p><p><strong>Säilitamine ja edastamine.</strong> Andmeid ei edastata kolmandatele isikutele ja neid kasutab ainult fotograaf Valentina Orlova.</p><p><strong>Teie õigused.</strong> Võite taotleda oma andmete kustutamist, kirjutades aadressil hello@valentina.photo.</p>',
        admin_login_title: 'Sisselogimine', admin_login_sub: 'Sisestage kasutajanimi ja parool',
        admin_user_label: 'Kasutajanimi', admin_pass_label: 'Parool', admin_login_btn: 'Logi sisse',
        admin_error: 'Vale kasutajanimi või parool', admin_panel_title: 'Fotode haldus',
        admin_cat_label: 'Kategooria', admin_ratio_label: 'Kuvasuhe', admin_title_label: 'Pealkiri',
        admin_file_label: 'Foto fail', admin_add_btn: 'Lisa foto', admin_existing: 'Lisatud fotod',
        admin_empty: 'Lisatud fotosid veel pole', admin_logout: 'Logi välja'
      },
      en: {
        __doc: 'Valentina Orlova — Photographer',
        __cats: { portrait: 'Portrait', wedding: 'Wedding', content: 'Content', kids: 'Kids' },
        nav_portfolio: 'Portfolio', nav_about: 'About', nav_prices: 'Pricing', nav_reviews: 'Reviews',
        nav_book: 'Book', nav_book_full: 'Book a session', menu_open: 'Open menu',
        hero_eyebrow: 'Photographer · Tallinn & travel',
        hero_title: 'Light, stillness<br class="hidden sm:block" /> and <em class="italic font-normal">honest emotion</em>',
        hero_sub: 'I shoot calmly and truthfully — portraits, weddings and family stories you\'ll want to return to.',
        hero_cta: 'Book a session', hero_cta2: 'View work', hero_scroll: 'Scroll',
        trust_years: 'years in photography', trust_shoots: 'sessions', trust_memories: 'warm memories',
        portfolio_eyebrow: 'Portfolio', portfolio_title: 'Selected work',
        portfolio_sub: 'Every shoot is its own story. Pick a category to take a closer look.',
        filter_all: 'All', filter_portrait: 'Portrait', filter_wedding: 'Weddings', filter_content: 'Content', filter_kids: 'Kids',
        rig_eyebrow1: 'What I shoot with', rig_title1: 'Every frame<br />begins here',
        rig_sub1: 'Scroll down — we\'ll assemble it piece by piece',
        rig_sub3: 'My main tool for portraits and reportage', rig_cta: 'See shots from it',
        about_eyebrow: 'About me', about_title: 'I shoot the way<br />I feel the moment',
        about_p1: 'My name is Valentina. For seven years I\'ve helped people keep their most honest, living moments — no stiff poses or forced smiles.',
        about_p2: 'It matters to me that you feel at ease. We simply talk, walk and laugh — and the shots take care of themselves. In the end you get photos where you recognise your real self.',
        about_f1: 'Natural light', about_f2: 'Gentle retouching', about_f3: 'I guide posing', about_f4: 'Ready in 7–14 days',
        about_cta: 'Discuss your session', about_badge_hi: 'Hi', about_badge_txt: 'I\'m Valentina — and I love what I do.',
        prices_eyebrow: 'Services & pricing', prices_title: 'Transparent packages',
        prices_sub: 'No hidden fees. Pick a format — we\'ll discuss the rest in person.',
        p1_name: 'Individual', p1_tag: 'Portrait · Love-story · Content', p1_price: 'from €150',
        p1_f1: '1 hour session', p1_f2: '1 location, styling help', p1_f3: '15 retouched photos', p1_f4: 'All originals in a gallery',
        p1_ready: 'Ready in 7 days', p1_deposit: 'Deposit 30%', choose: 'Choose',
        p2_badge: 'Popular', p2_name: 'Wedding', p2_tag: 'A full day of your story', p2_price: 'from €750',
        p2_f1: 'Up to 8 hours', p2_f2: 'Prep, ceremony, reception', p2_f3: '250+ photos, 60 retouched', p2_f4: 'Timeline planning help',
        p2_ready: 'Ready in 21 days', p2_deposit: 'Deposit 50%', p2_cta: 'Book a date',
        p3_name: 'Family', p3_tag: 'Kids · Family · Newborn', p3_price: 'from €200',
        p3_f1: '1.5 hours at an easy pace', p3_f2: 'Home, studio or nature', p3_f3: '25 retouched photos', p3_f4: 'Gentle with kids and pace',
        p3_ready: 'Ready in 10 days', p3_deposit: 'Deposit 30%',
        prices_note: 'Travel outside the city and to other towns is arranged individually. The deposit secures your date and is included in the price.',
        reviews_eyebrow: 'Reviews', reviews_title: 'In clients\' words',
        review1_text: '"I feared cameras my whole life, but with Valentina I forgot I was being photographed. The photos feel like someone quietly caught the warmest moments."',
        review1_role: 'Individual session',
        review2_text: '"Our wedding in photos is like a film. Valentina was invisible all day, and then we cried at how much she managed to capture."',
        review2_role: 'Wedding session',
        review3_text: '"With two toddlers it seemed impossible. But we got lively, tender photos where everything is real — the laughter and the tears."',
        review3_role: 'Family session',
        contact_eyebrow: 'Contact', contact_title: 'Let\'s create<br />your story',
        contact_sub: 'Tell me your idea — format, date, mood. I reply within a day and help you plan everything.',
        contact_mail_label: 'Email', contact_phone_label: 'Phone / WhatsApp',
        form_title: 'Book a session', form_name_label: 'Your name', form_name_ph: 'What should I call you',
        form_phone_label: 'Phone', form_format_label: 'Format',
        form_opt1: 'Individual', form_opt2: 'Wedding', form_opt3: 'Family / Kids', form_opt4: 'Content for business',
        form_msg_label: 'Tell me about the shoot', form_msg_ph: 'Preferred date, idea, mood...',
        form_submit: 'Send request', form_success: 'Thank you! I\'ll get back to you within a day.',
        footer_copyright: '© 2026 Valentina Orlova. All rights reserved.',
        footer_privacy: 'Privacy policy', footer_cookies: 'Cookies',
        cookie_text: 'We use cookies so the site works properly and comfortably. By continuing you agree to our privacy policy.',
        cookie_more: 'Learn more', cookie_decline: 'Decline', cookie_accept: 'Accept',
        privacy_title: 'Privacy policy',
        privacy_body: '<p>This policy explains how personal data is processed on this site.</p><p><strong>What data is collected.</strong> Through the booking form we receive your name, phone and a description of the shoot — used only to contact you and arrange the session.</p><p><strong>Cookies.</strong> We use necessary cookies for the site to work correctly and to remember your chosen language. You can decline optional cookies in the banner.</p><p><strong>Storage and sharing.</strong> Data is not shared with third parties and is used only by photographer Valentina Orlova.</p><p><strong>Your rights.</strong> You can request deletion of your data by writing to hello@valentina.photo.</p>',
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
