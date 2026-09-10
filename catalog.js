
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
    catalog.innerHTML = Object.entries(groups).map(([cat, items]) =>
      `<section class="catalog-section"><h3 class="catalog-section-title">${esc(cat)}</h3><div class="catalog-grid">${items.map(card).join('')}</div></section>`
    ).join('');
  }

  const featured = document.getElementById('featuredProducts');
  if(featured){
    const items = products.filter(p => p.featured).slice(0,6);
    featured.innerHTML = items.length ? items.map(card).join('') :
      '<p class="empty-state">No hay productos destacados configurados.</p>';
  }
})();
