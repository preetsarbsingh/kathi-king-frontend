const API_URL = "https://kathi-king-backend.onrender.com";

var dishes = [
  {id:1,name:"Butter Chicken",cat:"indian",img:"assets/images/butter-chicken.jpg",price:299,rating:"4.7"},
  {id:2,name:"Paneer Tikka",cat:"indian",img:"assets/images/paneer-tikka.jpeg",price:249,rating:"4.7"},
  {id:3,name:"Dal Makhani",cat:"indian",img:"assets/images/Dal Makhani.jpeg",price:199,rating:"4.6"},
];

var cart = {}, promoOn = false, userRating = 0, currentUser = null;



// ---------------- AUTH ----------------

function openAuth(){document.getElementById('auth-modal').classList.add('open');}
function closeAuth(){document.getElementById('auth-modal').classList.remove('open');}

function switchTab(t){
  document.getElementById('form-login').style.display = t==='login'?'block':'none';
  document.getElementById('form-signup').style.display = t==='signup'?'block':'none';
  document.getElementById('tab-login').classList.toggle('active',t==='login');
  document.getElementById('tab-signup').classList.toggle('active',t==='signup');
}

// ✅ SIGNUP (REAL BACKEND)
async function doSignup(){
  var name=document.getElementById('s-name').value.trim();
  var email=document.getElementById('s-email').value.trim();
  var pass=document.getElementById('s-pass').value.trim();

  if(!name||!email||!pass){
    alert('Please fill in all fields.');
    return;
  }

  try{
    const res = await fetch(API_URL + "/signup", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({name, email, password: pass})
    });

    const data = await res.json();

    if(res.ok){
      loginUser(data.user);
      closeAuth();
    } else {
      alert(data.message || "Signup failed");
    }
  } catch(err){
    alert("Server error");
  }
}

// ✅ LOGIN (REAL BACKEND)
async function doLogin(){
  var email=document.getElementById('l-email').value.trim();
  var pass=document.getElementById('l-pass').value.trim();

  if(!email||!pass){
    alert('Please fill in all fields.');
    return;
  }

  try{
    const res = await fetch(API_URL + "/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({email, password: pass})
    });

    const data = await res.json();

    if(res.ok){
      loginUser(data.user);
      closeAuth();
    } else {
      alert(data.message || "Login failed");
    }
  } catch(err){
    alert("Server error");
  }
}

function signOut(){
  currentUser = null;
  updateNavAuth();
}

// Navbar update
function updateNavAuth(){
  var el = document.getElementById('nav-auth');
  if(currentUser){
    var ini = currentUser.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    el.innerHTML = `<button class="profile-btn">${ini}</button>`;
  } else {
    el.innerHTML = `<button class="login-btn" onclick="openAuth()">Login / Sign up</button>`;
  }
}

// ---------------- MENU ----------------

function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function menuCardHTML(d){
  return `
  <div class="menu-card" id="card-${d.id}">
    <div class="menu-img">
      <img src="${d.img}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;">
    </div>
    <div class="menu-body">
      <div class="menu-cat">${cap(d.cat)}</div>
      <div class="menu-name">${d.name}</div>
      <div class="menu-foot">
        <span class="menu-price">₹${d.price}</span>
        <span class="menu-rating">★ ${d.rating}</span>
      </div>
      <button class="add-btn" onclick="addToCart(${d.id})">+ Add to Cart</button>
    </div>
  </div>`;
}

function renderMenu(filter){
  var list = filter==='all'?dishes:dishes.filter(d=>d.cat===filter);
  document.getElementById('menu-grid').innerHTML = list.map(menuCardHTML).join('');
}

function filterMenu(cat,btn){
  document.querySelectorAll('.cat-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderMenu(cat);
}

// ---------------- CART ----------------

function addToCart(id){
  cart[id] = (cart[id]||0)+1;
  renderCart();
}

function changeQty(id,delta){
  cart[id] += delta;
  if(cart[id]<=0) delete cart[id];
  renderCart();
}

function renderCart(){
  var keys = Object.keys(cart);
  var count = keys.reduce((a,k)=>a+cart[k],0);
  document.getElementById('cart-count').textContent = count;

  var body = document.getElementById('cart-body');
  var foot = document.getElementById('cart-foot');

  if(!keys.length){
    body.innerHTML = `<div class="empty-msg">Cart is empty</div>`;
    foot.style.display='none';
    return;
  }

  foot.style.display='block';

  var sub = 0;

  body.innerHTML = keys.map(id=>{
    var d = dishes.find(x=>x.id==id);
    var tot = d.price * cart[id];
    sub += tot;

    return `
    <div class="c-item">
      <div>
        <div class="c-name">${d.name}</div>
        <div class="qty-row">
          <button onclick="changeQty(${id},-1)">-</button>
          <span>${cart[id]}</span>
          <button onclick="changeQty(${id},1)">+</button>
        </div>
      </div>
      <div class="c-price">₹${tot}</div>
    </div>`;
  }).join('');

  var disc = promoOn ? Math.round(sub*0.2) : 0;
  var del = sub>499 ? 0 : 49;
  var total = sub - disc + del;

  document.getElementById('cart-total').innerHTML = `
    <div>Subtotal: ₹${sub}</div>
    ${disc ? `<div style="color:green">Discount: -₹${disc}</div>` : ''}
    <div>Delivery: ${del?`₹${del}`:'Free'}</div>
    <div><b>Total: ₹${total}</b></div>
  `;
}

// ---------------- INIT ----------------

renderMenu('all');
renderCart();