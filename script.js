/* ============================================================
                  CONFIGURAÇÕES — EDITE AQUI
   ============================================================ */
// Número de WhatsApp que vai receber as confirmações de presença,
// os pedidos de presente e as solicitações de link de pagamento.
// Formato: código do país (55) + DDD + número, SOMENTE dígitos.
// Exemplo Fortaleza-CE: '5585999998888'
const WHATSAPP_NUMBER = '5585999026005';

// Chave Pix que será exibida na hora de presentear.
const PIX_KEY = '08064082358';
const PIX_NAME = 'Alyne Pilger';
/* ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============ TEMA CLARO / ESCURO ============ */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      document.body.classList.remove('dark-theme');
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }

    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      if (isDark) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    });
  }

  /* ============ HEADER SCROLL STATE ============ */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ MENU MOBILE ============ */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============ SCROLL SPY ============ */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(sec => spyObserver.observe(sec));

  /* ============ REVEAL ON SCROLL ============ */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ CONTAGEM REGRESSIVA EM TEMPO REAL ============ */
  const WEDDING_DATE = new Date('2026-09-12T20:00:00-03:00');
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ============ PADRINHOS (dados fáceis de editar) ============ */
  const godparents = [
    { name: 'Beatriz Pilger e Lucas Lemos', role: 'Irmã e cunhado da noiva! Além de irmã, melhor amiga! Lucas além de cunhado é considerado irmão!', image: 'assets/beatriz&lucas.jpg' },
    { name: 'Isabele Rocha e Lucas Araujo', role: 'Amigos dos noivos.', image: 'assets/isabele&lucas.jpg' },
    { name: 'Alef Pilger', role: 'Irmão mais velho da Noiva.', image: 'assets/alef.jpg' },
    { name: 'Davi Holanda', role: 'Irmão mais novo do noivo.', image: 'assets/davi.jpg' },
    { name: 'Bianca Sousa', role: 'Irmã do noivo.', image: 'assets/bianca.jpg' },
    { name: 'Lara Stephany', role: 'Irmã do noivo.', image: 'assets/lara.jpg' },
    { name: 'Junior Cesar', role: 'Padrasto do noivo.', image: 'assets/junior.jpg' },
    { name: 'Elysandra Alexandre', role: 'Amiga da Noiva.', image: 'assets/elysandra.jpg' },
    { name: 'Thais Barros e Richarly', role: 'Amigos dos noivos.', image: 'assets/thais&richarly.jpg' },
    { name: 'Emilli Farias e Hallysson', role: 'Amigos dos noivos.', image: 'assets/emilli&hallysson.jpg' },
    { name: 'Neuza Rodrigues', role: 'Amiga da Noiva.', image: 'assets/neuza.jpg' },
    { name: 'Sandra Barros e Uchôa', role: 'Madrinha e tio do noivo.', image: 'assets/sandra&uchoa.jpg' },
    { name: 'Ytalo Castro', role: 'Amigo do noivo.', image: 'assets/ytalo.jpg' },
    { name: 'Tia do Noivo', role: 'Tia querida do Noivo!', image: 'assets/tia-do-noivo.jpg' },
    { name: 'Sara Alves e Jorge Lucas', role: 'Amigos dos noivos!', image: 'assets/sara&jorge.jpg' },
    { name: 'Fabíola Sousa e Eduardo Filho', role: 'Pai e madrasta do noivo.', image: 'assets/fabiola&eduardo.jpg' },
    { name: 'Mônica e Felemar', role: 'Tios da noiva!', image: 'assets/monica&felemar.jpg' },
    { name: 'Evandra e Eduardo!', role: 'Avós paternos do Noivo!', image: 'assets/evandra&eduardo.jpg' }
  ];
  const grid = document.getElementById('godparentsGrid');
  if (grid) {
    grid.innerHTML = godparents.map(g => `
      <div class="godparent-card reveal is-visible">
        <div class="godparent-photo">
          ${g.image ? `<img src="${g.image}" alt="${g.name}" loading="lazy">` : '❦'}
        </div>
        <h4>${g.name}</h4>
        <p>${g.role}</p>
      </div>
    `).join('');
  }

  /* ============ LISTA DE PRESENTES MEME ============ */
  const gifts = [
    { title: '1 Ano de café para noiva que é viciada', price: 'R$ 262,07', image: 'img/café.jpg' },
    { title: '1 ano de saco de pão para o noivo', price: 'R$ 198,90', image: 'img/pão.jpg' },
    { title: 'Ajuda para o primeiro passeio na lua de mel', price: '3x de R$ 219,39 ou R$ 658,18 à vista', image: 'img/lua-de-mel.jpeg' },
    { title: 'Ajuda para pagar o cartão de crédito da noiva', price: '3x de R$ 105,30 ou R$ 315,91 à vista', image: 'img/cartão-fatura.jpeg' },
    { title: 'Areia pro gato parar de reclamar', price: 'R$ 189,00', image: 'img/areia-pro-gato.jpeg' },
    { title: 'Brinde da noite de núpcia', price: '3x de R$ 108,78 ou R$ 326,34 à vista', image: 'img/noite-nupcia.jpg' },
    { title: 'Calmante fortíssimo para a noiva', price: 'R$ 217,56', image: 'img/calmante-noiva.jpg' },
    { title: 'caso Deus toque o seu coração', price: '3x de R$ 548,30 ou R$ 1.644,90 à vista', image: 'img/deus-toque-coracao.jpg' },
    { title: 'cobertor para a noiva ficar sempre coberta de razão', price: 'R$ 189,00', image: 'img/cobertor.jpg' },
    { title: 'Cota "amigos para sempre"', price: '3x de R$ 109,51 ou R$ 328,54 à vista', image: 'img/amigos-forever.jpg' },
    { title: 'EU DEI O MELHOR PRESENTE', price: '3x de R$ 182,77 ou R$ 548,30 à vista', image: 'img/melhor-presente.jpg' },
    { title: 'Garanta o primeiro jantar dos recém casados', price: 'R$ 274,70', image: 'img/primeiro-jantar.jpg' },
    { title: 'Lava louças (Não sei se alguém vai dar) mas eu vou pedir kkkk', price: '3x de R$ 732,53 ou R$ 2.197,60 à vista', image: 'img/lava-louças.jpg' },
    { title: 'Lenço para a noiva não borrar toda a maquiagem', price: 'R$ 185,00', image: 'img/lenço.jpg' },
    { title: 'Para dar pitaco na festa', price: '3x de R$ 145,57 ou R$ 436,70 à vista', image: 'img/dar-pitaco.jpeg' },
    { title: 'Patrocine a primeira compra no super mercado dos recém casados', price: '3x de R$ 109,51 ou R$ 328,54 à vista', image: 'img/primeira-compra.jpg' },
    { title: 'Pix para a noiva desmaiar de alegria', price: '3x de R$ 128,19 ou R$ 384,58 à vista', image: 'img/pix-para-noiva.jpg' },
    { title: 'Primeiro lugar na fila do buffet', price: 'R$ 171,41', image: 'img/primeiro-na-fila.jpeg' },
    { title: 'Ração para os gatos', price: 'R$ 175,81', image: 'img/ração.jpg' },
    { title: 'Skin Care dos noivos', price: 'R$ 167,02', image: 'img/skin-care.jpg' },
    { title: 'Spa para os noivos relaxarem pré casamento', price: '3x de R$ 175,81 ou R$ 527,42 à vista', image: 'img/spa.jpg' },
    { title: 'Só para dizer que eu não dei nada', price: 'R$ 153,83', image: 'img/nao-dei-nada.jpg' },
    { title: 'Taxa para perguntar quando o casal terá filhos', price: 'R$ 218,66', image: 'img/perguntar-sobre-filhos.jpg' },
    { title: 'Taxa pra noiva não jogar o buquê pra sua namorada', price: 'R$ 181,30', image: 'img/noiva-jogando-buque.jpg' },
    { title: 'Um ano de barba feita para o noivo', price: 'R$ 280,80', image: 'img/noivo-barba-feita.jpg' }
  ];

  /* Extrai o valor numérico "à vista" (ou único) de uma string de preço em R$ */
  function parseBRLNumber(str) {
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  }
  function getGiftValue(priceStr) {
    const matches = priceStr.match(/R\$\s?[\d.,]+/g);
    if (!matches) return 0;
    const last = matches[matches.length - 1].replace('R$', '').trim();
    return parseBRLNumber(last);
  }
  function formatBRL(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const giftsGrid = document.getElementById('giftsGrid');
  if (giftsGrid) {
    giftsGrid.innerHTML = gifts.map((g, idx) => {
      let priceHTML = '';
      if (g.price.includes('ou')) {
        const parts = g.price.split('ou');
        priceHTML = `
          <span class="gift-installments">${parts[0].trim()}</span>
          <span class="gift-full-price">ou ${parts[1].replace('à vista', '').trim()} à vista</span>
        `;
      } else {
        priceHTML = `<span class="gift-single-price">${g.price}</span>`;
      }

      return `
        <article class="gift-card reveal is-visible">
          <div class="gift-image">
            <img src="${g.image}" alt="${g.title}" loading="lazy">
          </div>
          <h4>${g.title}</h4>
          <p class="gift-price">${priceHTML}</p>
          <button class="btn btn--small btn-presentear" type="button" data-id="${idx}">Presentear</button>
        </article>
      `;
    }).join('');
  }

  /* ============ CARRINHO DE PRESENTES ============ */
  const CART_KEY = 'wedding_gift_cart';
  const cartFab = document.getElementById('cartFab');
  const cartBadge = document.getElementById('cartBadge');
  const cartModalOverlay = document.getElementById('cartModalOverlay');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalValue = document.getElementById('cartTotalValue');
  const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.value * item.qty, 0);
  }

  function updateCartUI() {
    const cart = loadCart();
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    if (cartBadge) cartBadge.textContent = String(count);
    if (cartFab) cartFab.classList.toggle('is-visible', count > 0);

    if (cartItemsList) {
      if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="cart-empty">Seu carrinho está vazio. Escolha um presente com carinho 💛</p>';
      } else {
        cartItemsList.innerHTML = cart.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image"><img src="${item.image}" alt="${item.title}" loading="lazy"></div>
            <div class="cart-item-info">
              <h5>${item.title}</h5>
              <span class="cart-item-price">${formatBRL(item.value)} × ${item.qty}</span>
            </div>
            <div class="cart-item-qty">
              <button type="button" class="qty-btn qty-minus" data-id="${item.id}" aria-label="Diminuir">−</button>
              <span>${item.qty}</span>
              <button type="button" class="qty-btn qty-plus" data-id="${item.id}" aria-label="Aumentar">+</button>
            </div>
            <button type="button" class="cart-item-remove" data-id="${item.id}" aria-label="Remover presente">&times;</button>
          </div>
        `).join('');
      }
    }
    if (cartTotalValue) cartTotalValue.textContent = formatBRL(cartTotal(cart));
  }

  function addToCart(idx) {
    const gift = gifts[idx];
    if (!gift) return;
    const cart = loadCart();
    const existing = cart.find(i => i.id === String(idx));
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: String(idx), title: gift.title, image: gift.image, value: getGiftValue(gift.price), qty: 1 });
    }
    saveCart(cart);
    updateCartUI();
    openModal(cartModalOverlay);
  }

  if (giftsGrid) {
    giftsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-presentear');
      if (!btn) return;
      addToCart(parseInt(btn.getAttribute('data-id'), 10));
    });
  }

  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (!id) return;
      const cart = loadCart();
      const item = cart.find(i => i.id === id);
      if (!item) return;

      if (e.target.classList.contains('qty-plus')) {
        item.qty += 1;
      } else if (e.target.classList.contains('qty-minus')) {
        item.qty -= 1;
        if (item.qty <= 0) {
          saveCart(cart.filter(i => i.id !== id));
          updateCartUI();
          return;
        }
      } else if (e.target.classList.contains('cart-item-remove')) {
        saveCart(cart.filter(i => i.id !== id));
        updateCartUI();
        return;
      } else {
        return;
      }
      saveCart(cart);
      updateCartUI();
    });
  }

  function openModal(overlay) {
    if (!overlay) return;
    overlay.classList.add('is-open');
    document.body.classList.add('modal-open');
  }
  function closeModal(overlay) {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    if (!document.querySelector('.modal-overlay.is-open')) {
      document.body.classList.remove('modal-open');
    }
  }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => closeModal(overlay));
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach(closeModal);
    }
  });

  if (cartFab) {
    cartFab.addEventListener('click', () => openModal(cartModalOverlay));
  }

  /* ===== Checkout: Pix ou Cartão ===== */
  const goToCheckoutBtn = document.getElementById('goToCheckoutBtn');
  const checkoutTotalValue = document.getElementById('checkoutTotalValue');
  const pixTotalValue = document.getElementById('pixTotalValue');
  const pixKeyText = document.getElementById('pixKeyText');
  const copyPixBtn = document.getElementById('copyPixBtn');
  const btnPagPix = document.getElementById('btnPagPix');
  const btnPagCartao = document.getElementById('btnPagCartao');
  const panelPix = document.getElementById('panelPix');
  const panelCartao = document.getElementById('panelCartao');
  const parcelasSelect = document.getElementById('parcelasSelect');
  const parcelaPreview = document.getElementById('parcelaPreview');
  const sendPixWhats = document.getElementById('sendPixWhats');
  const sendCartaoWhats = document.getElementById('sendCartaoWhats');

  if (pixKeyText) pixKeyText.textContent = PIX_KEY;

  function buildCartSummaryLines(cart) {
    return cart.map(i => `• ${i.title} (x${i.qty}) — ${formatBRL(i.value * i.qty)}`);
  }

  function updateParcelaPreview() {
    if (!parcelasSelect || !parcelaPreview) return;
    const cart = loadCart();
    const total = cartTotal(cart);
    const n = parseInt(parcelasSelect.value, 10);
    if (n <= 1) {
      parcelaPreview.textContent = `À vista: ${formatBRL(total)}`;
    } else {
      parcelaPreview.textContent = `${n}x de ${formatBRL(total / n)} sem juros`;
    }
  }

  if (goToCheckoutBtn) {
    goToCheckoutBtn.addEventListener('click', () => {
      const cart = loadCart();
      if (cart.length === 0) return;
      const total = cartTotal(cart);
      if (checkoutTotalValue) checkoutTotalValue.textContent = formatBRL(total);
      if (pixTotalValue) pixTotalValue.textContent = formatBRL(total);
      updateParcelaPreview();
      closeModal(cartModalOverlay);
      openModal(checkoutModalOverlay);
    });
  }

  if (btnPagPix && btnPagCartao) {
    btnPagPix.addEventListener('click', () => {
      btnPagPix.classList.add('active');
      btnPagCartao.classList.remove('active');
      panelPix.style.display = '';
      panelCartao.style.display = 'none';
    });
    btnPagCartao.addEventListener('click', () => {
      btnPagCartao.classList.add('active');
      btnPagPix.classList.remove('active');
      panelCartao.style.display = '';
      panelPix.style.display = 'none';
      updateParcelaPreview();
    });
  }

  if (parcelasSelect) {
    parcelasSelect.addEventListener('change', updateParcelaPreview);
  }

  if (copyPixBtn) {
    const copyPixLabel = copyPixBtn.querySelector('span');
    copyPixBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(PIX_KEY);
        const original = copyPixLabel.textContent;
        copyPixLabel.textContent = 'Copiado!';
        copyPixBtn.classList.add('copied');
        setTimeout(() => {
          copyPixLabel.textContent = original;
          copyPixBtn.classList.remove('copied');
        }, 1800);
      } catch {
        window.prompt('Copie a chave Pix abaixo:', PIX_KEY);
      }
    });
  }

  if (sendPixWhats) {
    sendPixWhats.addEventListener('click', () => {
      const cart = loadCart();
      if (cart.length === 0) return;
      const linhas = [
        '🎁 *Presente via Pix — Alyne & Douglas*',
        '',
        ...buildCartSummaryLines(cart),
        '',
        `*Total:* ${formatBRL(cartTotal(cart))}`,
        `*Chave Pix usada:* ${PIX_KEY}`,
        '',
        'Já fiz o Pix, segue o comprovante! 💛'
      ];
      const texto = encodeURIComponent(linhas.join('\n'));
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`, '_blank', 'noopener');
    });
  }

  if (sendCartaoWhats) {
    sendCartaoWhats.addEventListener('click', () => {
      const cart = loadCart();
      if (cart.length === 0) return;
      const n = parseInt(parcelasSelect.value, 10);
      const total = cartTotal(cart);
      const linhas = [
        '🎁 *Presente via Cartão de Crédito — Alyne & Douglas*',
        '',
        ...buildCartSummaryLines(cart),
        '',
        `*Total:* ${formatBRL(total)}`,
        `*Parcelamento desejado:* ${n}x${n > 1 ? ' de ' + formatBRL(total / n) : ' (à vista)'}`,
        '',
        'Podem me enviar o link de pagamento no cartão, por favor? 🙏'
      ];
      const texto = encodeURIComponent(linhas.join('\n'));
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`, '_blank', 'noopener');
    });
  }

  updateCartUI();

  /* ============ FORM RSVP -> ENVIO VIA WHATSAPP ============ */
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpFeedback = document.getElementById('rsvpFeedback');
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('rsvpName').value.trim();
    const going = document.getElementById('rsvpGoing').value;
    const adults = document.getElementById('rsvpAdults').value;
    const email = document.getElementById('rsvpEmail').value.trim();
    const msg = document.getElementById('rsvpMsg').value.trim();

    const goingText = going === 'sim' ? 'Sim, estarei lá! 🎉' : 'Não poderei ir 😔';

    const linhas = [
      '💌 *Confirmação de Presença — Alyne & Douglas*',
      '',
      `*Nome:* ${nome}`,
      `*Vai ao evento?* ${goingText}`,
    ];
    if (going === 'sim') {
      linhas.push(`*Nº de adultos (com ele(a)):* ${adults}`);
    }
    linhas.push(`*E-mail:* ${email}`);
    if (msg) {
      linhas.push(`*Observações:* ${msg}`);
    }

    const texto = encodeURIComponent(linhas.join('\n'));
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;
    window.open(link, '_blank', 'noopener');

    rsvpFeedback.textContent = 'Obrigado! Abrimos o WhatsApp para você enviar sua confirmação. 💛';
    rsvpForm.reset();
  });

  /* ============ MURAL DE RECADOS ============ */
  const recadoForm = document.getElementById('recadoForm');
  const recadosList = document.getElementById('recadosList');
  const RECADOS_KEY = 'wedding_recados';

  // Recados fixos que sempre aparecem (não são apagáveis, editáveis aqui no array)
  const seedRecados = [
    { id: 'seed-1', nome: 'Elisangela Gomes Dias', texto: 'Que o amor sempre se faça presente e a felicidade seja eterna.', fixo: true }
  ];

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function loadRecados() {
    try {
      const saved = JSON.parse(localStorage.getItem(RECADOS_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveRecados(list) {
    localStorage.setItem(RECADOS_KEY, JSON.stringify(list));
  }

  function renderRecados() {
    const saved = loadRecados();
    const all = [...saved, ...seedRecados];
    recadosList.innerHTML = all.map(r => `
      <li class="recado-item reveal is-visible" data-id="${r.id}">
        <div class="recado-avatar" aria-hidden="true">${escapeHTML(r.nome).trim().charAt(0).toUpperCase() || '❦'}</div>
        <div class="recado-body">
          <p class="recado-texto">"${escapeHTML(r.texto)}"</p>
          <p class="recado-autor">— ${escapeHTML(r.nome)}</p>
        </div>
        ${r.fixo ? '' : `<button class="recado-delete" type="button" data-id="${r.id}" aria-label="Excluir recado">&times;</button>`}
      </li>
    `).join('');
  }

  renderRecados();

  recadoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('recadoNome').value.trim();
    const texto = document.getElementById('recadoTexto').value.trim();
    if (!nome || !texto) return;

    const saved = loadRecados();
    saved.unshift({ id: `r-${Date.now()}`, nome, texto });
    saveRecados(saved);
    renderRecados();
    recadoForm.reset();
  });

  recadosList.addEventListener('click', (e) => {
    const btn = e.target.closest('.recado-delete');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const saved = loadRecados().filter(r => r.id !== id);
    saveRecados(saved);
    renderRecados();
  });

});
