(function(){
  const data = getSiteData();
  const products = (data.products || []).filter(p => p.active !== false);

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function card(p){
    const image = p.image
      ? `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy">`
      : `<div class="product-placeholder"><span>FASTEC</span><small>Imagen pendiente</small></div>`;
    const stock = p.stock !== '' && p.stock !== null && p.stock !== undefined
      ? `<span class="product-stock">Stock: ${esc(p.stock)}</span>`
      : `<span class="product-stock">Stock: —</span>`;
    return `<article class="catalog-card live-product-card" data-product-name="${esc(p.name)}" role="button" tabindex="0" title="Consultar ${esc(p.name)} por WhatsApp">
      <div class="catalog-photo live-photo">${image}</div>
      <span class="catalog-name">${esc(p.name)}</span>
      <span class="catalog-model">${esc(p.model)}</span>
      ${stock}
    </article>`;
  }

  const WHATSAPP_NUMBER = '51963925684';

  function openWhatsApp(productName){
    const message = `Hola, quiero consultar por este producto: ${productName}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  }

  function bindProductCards(root){
    root.querySelectorAll('.live-product-card').forEach(card => {
      const productName = card.dataset.productName || '';
      card.addEventListener('click', () => openWhatsApp(productName));
      card.addEventListener('keydown', e => {
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          openWhatsApp(productName);
        }
      });
    });
  }

  const catalog = document.getElementById('liveCatalog');
  if(catalog){
    const groups = {};
    products.forEach(p => (groups[p.category] ||= []).push(p));
    const categories = Object.keys(groups);

    const filters = document.createElement('div');
    filters.className = 'category-filters';
    filters.innerHTML =
      `<button type="button" class="category-filter active" data-category="all">Todos (${products.length})</button>` +
      categories.map(cat => `<button type="button" class="category-filter" data-category="${esc(cat)}">${esc(cat)} (${groups[cat].length})</button>`).join('');

    const sections = document.createElement('div');
    sections.className = 'catalog-sections';
    sections.innerHTML = Object.entries(groups).map(([cat, items]) =>
      `<section class="catalog-section" data-category="${esc(cat)}">
        <div class="catalog-section-heading">
          <h3 class="catalog-section-title">${esc(cat)}</h3>
          <span class="catalog-count">${items.length} ${items.length === 1 ? 'producto' : 'productos'}</span>
        </div>
        <div class="catalog-grid">${items.map(card).join('')}</div>
      </section>`
    ).join('');

    catalog.innerHTML = '';
    catalog.appendChild(filters);
    catalog.appendChild(sections);
    bindProductCards(catalog);

    filters.querySelectorAll('.category-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        filters.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const selected = btn.dataset.category;
        sections.querySelectorAll('.catalog-section').forEach(section => {
          section.hidden = selected !== 'all' && section.dataset.category !== selected;
        });
      });
    });
  }

  const featured = document.getElementById('featuredProducts');
  if(featured){
    featured.innerHTML = '';
    const offersSection = featured.closest('.offers');
    if(offersSection) offersSection.hidden = true;
  }
})();
