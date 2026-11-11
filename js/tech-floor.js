(function () {
  'use strict';
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const theme = document.body.dataset.theme || '';
  const category = document.body.dataset.category || (theme === 'solar' ? 'Solar Inverters' : '');
  const aliases = {
    bike: ['bike', 'bikes', 'bicycle', 'bicycles', 'cycling', 'e-bike', 'e-bikes'],
    tools: ['tool', 'tools', 'workshop', 'power tool', 'power tools', 'hand tool', 'hand tools'],
    vehicle: ['vehicle parts', 'vehicle accessories', 'auto parts', 'car parts', 'motorcycle parts', 'automotive parts'],
    machine: ['machine parts', 'machinery parts', 'industrial parts', 'agricultural parts', 'tractor parts', 'machine components'],
    solar: ['solar inverter', 'solar inverters', 'inverter', 'inverters']
  }[theme] || [category];
  const normalize = (value) => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  const wanted = aliases.map(normalize).filter(Boolean);
  const items = Array.isArray(window.RT_CATALOG) ? window.RT_CATALOG : [];
  const match = items.filter((item) => {
    const value = normalize(item.category);
    return value && wanted.some((alias) => value === alias || value.startsWith(alias + ' ') || alias.startsWith(value + ' '));
  });
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  if (!match.length) {
    grid.innerHTML = '<div class="empty-state"><strong>No seller listings on this floor yet.</strong><br>Our marketplace displays real seller stock only. Sellers can add products as these departments become available—contact the shop to request an item.</div>';
    return;
  }
  grid.innerHTML = match.map((item) => {
    const title = esc(item.title || 'Product');
    const slug = String(item.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const href = 'product.html?id=' + encodeURIComponent(item.id) + '&slug=' + encodeURIComponent(slug);
    const image = item.images && item.images[0] ? esc(item.images[0]) : '';
    const priceValue = Number(item.price);
    const price = item.price && Number.isFinite(priceValue) ? 'R ' + priceValue.toLocaleString('en-ZA') : 'Ask the shop';
    const vendor = esc(item.vendor && item.vendor.name ? item.vendor.name : 'Randomtech seller');
    return '<a class="product-card" href="' + href + '"><img loading="lazy" decoding="async" src="' + image + '" alt="' + title + '"><div class="product-info"><h3>' + title + '</h3><p class="price">' + esc(price) + '</p><p>Sold by ' + vendor + '</p></div></a>';
  }).join('');
})();
