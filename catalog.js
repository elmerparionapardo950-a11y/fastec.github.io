(function(){
  const data = getSiteData();
  const products = (data.products || []).filter(p => p.active !== false);

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function card(p){
    const image = p.image
      ? `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy">`
      : `<div class="product-placeholder"><span>ANDESUR</span><small>${esc(p.category)}</small></div>`;
    const price = p.price ? `<strong class="product-price">S/ ${esc(p.price)}</strong>` : '';
    const old = p.oldPrice ? `<del>S/ ${esc(p.oldPrice)}</del>` : '';
    const offer = p.offer ? `<span class="product-badge">${esc(p.offer)}</span>` : '';
    return `<article class="catalog-card live-product-card">
      ${offer}
      <div class="catalog-photo live-photo">${image}</div>
      <span class="catalog-name">${esc(p.name)}</span>
      <span class="catalog-model">${esc(p.model)}</span>
      <div class="product-prices">${old}${price}</div>
    </article>`;
  }

  const catalog = document.getElementById('liveCatalog');
  if(catalog){
    const groups = {};
    products.forEach(p => (groups[p.category] ||= []).push(p));
    const categories = Object.keys(groups);

    const filters = document.createElement('div');
    filters.className = 'category-filters';
    filters.innerHTML =
      `<button type="button" class="category-filter active" data-category="all">Todos</button>` +
      categories.map(cat => `<button type="button" class="category-filter" data-category="${esc(cat)}">${esc(cat)}</button>`).join('');

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
    const items = products.filter(p => p.featured).slice(0,6);
    featured.innerHTML = items.length ? items.map(card).join('') :
      '<p class="empty-state">No hay productos destacados configurados.</p>';
  }
})();
