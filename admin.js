
(function(){
  const ADMIN_PASSWORD = 'Andesur#Admin_2026!Cj7$Pq9';
  let data = getSiteData();
  let editingId = null;

  const login = document.getElementById('adminLogin');
  const app = document.getElementById('adminApp');

  function loggedIn(){ return sessionStorage.getItem('andesur_admin') === '1'; }
  function showApp(){
    login.hidden = true; app.hidden = false; renderProducts(); renderServices(); fillCompany();
  }
  if(loggedIn()) showApp();

  document.getElementById('loginForm').addEventListener('submit', e=>{
    e.preventDefault();
    const pass = document.getElementById('adminPassword').value;
    if(pass === ADMIN_PASSWORD){
      sessionStorage.setItem('andesur_admin','1');
      document.getElementById('loginError').textContent='';
      showApp();
    } else {
      document.getElementById('loginError').textContent='Contraseña incorrecta.';
    }
  });

  document.getElementById('logoutBtn').onclick=()=>{
    sessionStorage.removeItem('andesur_admin'); location.reload();
  };

  document.querySelectorAll('.admin-tab').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    };
  });

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function save(){
    saveSiteData(data);
  }

  function renderProducts(){
    const box=document.getElementById('adminProductList');
    const total=data.products.length;
    const visibles=data.products.filter(p=>p.active !== false).length;
    const ocultos=total-visibles;
    const summary=document.getElementById('productSummary');
    if(summary) summary.innerHTML=`<span class="summary-chip"><b>${total}</b> productos</span><span class="summary-chip summary-ok"><b>${visibles}</b> visibles</span><span class="summary-chip summary-off"><b>${ocultos}</b> ocultos</span>`;

    box.innerHTML = data.products.map(p=>{
      const visible=p.active !== false;
      return `<article class="admin-product-row ${visible?'':'is-hidden'}">
        <div class="admin-product-thumb">${p.image ? `<img src="${p.image}" alt="">` : '<span>ANDESUR</span>'}</div>
        <div class="admin-product-info">
          <div class="admin-product-title-line"><h3>${esc(p.name)}</h3><span class="visibility-badge ${visible?'visible':'hidden'}">${visible?'VISIBLE':'OCULTO'}</span></div>
          <p>${esc(p.category)} · ${esc(p.model)}</p>
          <div class="admin-product-tags">${p.featured?'<span>★ Destacado</span>':''}${p.offer?`<span>${esc(p.offer)}</span>`:''}${p.price?`<span>S/ ${esc(p.price)}</span>`:''}</div>
        </div>
        <div class="admin-row-actions">
          <button class="btn btn-ghost edit-btn" data-id="${p.id}">Editar</button>
          <button class="btn ${visible?'btn-warn':'btn-success'} visibility-btn" data-id="${p.id}">${visible?'Ocultar':'Mostrar'}</button>
        </div>
      </article>`;
    }).join('');

    box.querySelectorAll('.edit-btn').forEach(b=>b.onclick=()=>openModal(Number(b.dataset.id)));
    box.querySelectorAll('.visibility-btn').forEach(b=>b.onclick=()=>{
      const id=Number(b.dataset.id);
      const item=data.products.find(x=>x.id===id);
      if(!item) return;
      item.active=item.active === false;
      save();
      renderProducts();
    });
  }

  let editingServiceId = null;

  function renderServices(){
    const box = document.getElementById('adminServiceList');
    if(!box) return;
    const services = data.services || [];
    const visibles = services.filter(s => s.active !== false).length;
    const ocultos = services.length - visibles;
    const summary = document.getElementById('serviceSummary');
    if(summary) summary.innerHTML =
      `<span class="summary-chip"><b>${services.length}</b> servicios</span>` +
      `<span class="summary-chip summary-ok"><b>${visibles}</b> visibles</span>` +
      `<span class="summary-chip summary-off"><b>${ocultos}</b> ocultos</span>`;

    const groups = {};
    services.forEach(s => (groups[s.category] ||= []).push(s));

    box.innerHTML = Object.entries(groups).map(([category, items]) => `
      <div class="admin-service-group">
        <div class="catalog-section-heading">
          <h3>${esc(category)}</h3><span class="catalog-count">${items.length} ${items.length===1?'servicio':'servicios'}</span>
        </div>
        ${items.map(s => {
          const visible = s.active !== false;
          return `<article class="admin-service-row ${visible?'':'is-hidden'}">
            <div class="admin-service-info">
              <h3>${esc(s.name)} <span class="visibility-badge ${visible?'visible':'hidden'}">${visible?'VISIBLE':'OCULTO'}</span></h3>
              <span class="admin-category">${esc(s.category)}</span>
              <p>${esc(s.description)}</p>
            </div>
            <div class="admin-row-actions">
              <button class="btn btn-ghost edit-service-btn" data-id="${s.id}">Editar</button>
              <button class="btn ${visible?'btn-warn':'btn-success'} service-visibility-btn" data-id="${s.id}">${visible?'Ocultar':'Mostrar'}</button>
            </div>
          </article>`;
        }).join('')}
      </div>
    `).join('');

    box.querySelectorAll('.edit-service-btn').forEach(b => b.onclick = () => openServiceModal(Number(b.dataset.id)));
    box.querySelectorAll('.service-visibility-btn').forEach(b => b.onclick = () => {
      const item = (data.services || []).find(x => x.id === Number(b.dataset.id));
      if(!item) return;
      item.active = item.active === false;
      save();
      renderServices();
    });
  }

  const modal=document.getElementById('productModal');
  const form=document.getElementById('productForm');
  const preview=document.getElementById('imagePreview');

  function openModal(id=null){
    editingId=id;
    form.reset();
    preview.innerHTML='';
    document.getElementById('modalTitle').textContent=id?'Editar producto':'Nuevo producto';
    if(id){
      const p=data.products.find(x=>x.id===id);
      Object.keys(p).forEach(k=>{ if(form.elements[k] && k!=='imageFile') form.elements[k].value=p[k] ?? ''; });
      form.elements.featured.checked=!!p.featured;
      if(p.image) preview.innerHTML=`<img src="${p.image}" alt="Vista previa">`;
    }
    modal.hidden=false;
  }

  document.getElementById('newProductBtn').onclick=()=>openModal();
  document.getElementById('closeModal').onclick=()=>modal.hidden=true;
  document.getElementById('cancelProduct').onclick=()=>modal.hidden=true;

  form.elements.imageFile.addEventListener('change', ()=>{
    const file=form.elements.imageFile.files[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{ form.elements.image.value=reader.result; preview.innerHTML=`<img src="${reader.result}" alt="Vista previa">`; };
    reader.readAsDataURL(file);
  });

  form.elements.image.addEventListener('input', ()=>{
    const url=form.elements.image.value.trim();
    if(url) preview.innerHTML=`<img src="${url}" alt="Vista previa">`;
    else preview.innerHTML='';
  });

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const item={
      id: editingId || Date.now(),
      name:fd.get('name').trim(),
      category:fd.get('category').trim(),
      model:fd.get('model').trim(),
      price:fd.get('price').trim(),
      oldPrice:fd.get('oldPrice').trim(),
      offer:fd.get('offer').trim(),
      image:fd.get('image').trim(),
      featured:form.elements.featured.checked,
      active: editingId ? (data.products.find(p=>p.id===editingId)?.active !== false) : true
    };
    if(editingId) data.products=data.products.map(p=>p.id===editingId?item:p);
    else data.products.unshift(item);
    save(); renderProducts(); modal.hidden=true;
  });

  const serviceModal = document.getElementById('serviceModal');
  const serviceForm = document.getElementById('serviceForm');

  function openServiceModal(id=null){
    editingServiceId = id;
    serviceForm.reset();
    document.getElementById('serviceModalTitle').textContent = id ? 'Editar servicio' : 'Nuevo servicio';
    if(id){
      const item = (data.services || []).find(s => s.id === id);
      if(item){
        serviceForm.elements.name.value = item.name || '';
        serviceForm.elements.category.value = item.category || '';
        serviceForm.elements.description.value = item.description || '';
        serviceForm.elements.icon.value = item.icon || '';
      }
    }
    serviceModal.hidden = false;
  }

  document.getElementById('newServiceBtn').onclick = () => openServiceModal();
  document.getElementById('closeServiceModal').onclick = () => serviceModal.hidden = true;
  document.getElementById('cancelService').onclick = () => serviceModal.hidden = true;

  serviceForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(serviceForm);
    const item = {
      id: editingServiceId || Date.now(),
      name: fd.get('name').trim(),
      category: fd.get('category').trim(),
      description: fd.get('description').trim(),
      icon: fd.get('icon').trim() || '✓',
      active: editingServiceId ? ((data.services || []).find(s => s.id === editingServiceId)?.active !== false) : true
    };
    data.services = data.services || [];
    if(editingServiceId) data.services = data.services.map(s => s.id === editingServiceId ? item : s);
    else data.services.unshift(item);
    save();
    renderServices();
    serviceModal.hidden = true;
  });

  function fillCompany(){
    const f=document.getElementById('companyForm');
    Object.entries(data.company||{}).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v;});
  }
  document.getElementById('companyForm').addEventListener('submit',e=>{
    e.preventDefault();
    const f=e.currentTarget;
    data.company={name:f.name.value,email:f.email.value,phone:f.phone.value,address:f.address.value,description:f.description.value};
    save();
    alert('Información guardada.');
  });

  document.getElementById('exportBtn').onclick=()=>{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='andesur-respaldo.json'; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),500);
  };

  document.getElementById('importFile').onchange=e=>{
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const imported=JSON.parse(reader.result);
        if(!Array.isArray(imported.products)||!imported.company) throw new Error();
        imported.services = Array.isArray(imported.services) ? imported.services : JSON.parse(JSON.stringify(ANDESUR_DEFAULT_DATA.services));
        data=imported; save(); renderProducts(); renderServices(); fillCompany(); alert('Datos importados correctamente.');
      }catch(err){alert('El archivo no tiene un formato válido.');}
    };
    reader.readAsText(file);
  };

  document.getElementById('resetBtn').onclick=()=>{
    if(confirm('Esto reemplazará los cambios guardados por los datos iniciales. ¿Continuar?')){
      data=getSiteData(); // si ya hay cambios, se conserva; luego restauramos de defaults
      data={products:JSON.parse(JSON.stringify(ANDESUR_DEFAULT_DATA.products)), services:JSON.parse(JSON.stringify(ANDESUR_DEFAULT_DATA.services)), company:JSON.parse(JSON.stringify(ANDESUR_DEFAULT_DATA.company))};
      save(); renderProducts(); renderServices(); fillCompany();
    }
  };
})();
