const API_URL = "https://kathi-king-backend.onrender.com";

var dishes = [
  {id:1,name:"Butter Chicken",cat:"indian",img:"assets/images/butter-chicken.jpg",price:299,rating:"4.7"},
  {id:2,name:"Paneer Tikka",cat:"indian",img:"assets/images/paneer-tikka.jpeg",price:249,rating:"4.7"},
  {id:3,name:"Dal Makhani",cat:"indian",img:"assets/images/Dal Makhani.jpeg",price:199,rating:"4.6"},
];

var cart = {}, promoOn = false, currentUser = null;


// ---------------- AUTH ----------------

function openAuth(){
  document.getElementById('auth-modal').classList.add('open');
}

function closeAuth(){
  document.getElementById('auth-modal').classList.remove('open');
}

function switchTab(t){
  document.getElementById('form-login').style.display = t==='login'?'block':'none';
  document.getElementById('form-signup').style.display = t==='signup'?'block':'none';
}

// ✅ SIGNUP
async function doSignup(){
  const name = document.getElementById('s-name').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const password = document.getElementById('s-pass').value.trim();

  if(!name || !email || !password){
    alert("Fill all fields");
    return;
  }

  try{
    const res = await fetch(`${API_URL}/signup`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({name,email,password})
    });

    const data = await res.json();

    console.log("Signup Response:", data);

    if(res.ok){
      alert("Signup successful!");
      loginUser(data.user);
      closeAuth();
    } else {
      alert(data.message || "Signup failed");
    }

  }catch(err){
    console.error(err);
    alert("Server error during signup");
  }
}


// ✅ LOGIN (FIXED)
async function doLogin(){
  const email = document.getElementById('l-email').value.trim();
  const password = document.getElementById('l-pass').value.trim();

  if(!email || !password){
    alert("Fill all fields");
    return;
  }

  try{
    const res = await fetch(`${API_URL}/login`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email,password})
    });

    const data = await res.json();

    console.log("Login Response:", data);

    if(res.ok && data.user){
      loginUser(data.user);
      closeAuth();
    } else {
      alert(data.message || "Invalid credentials");
    }

  }catch(err){
    console.error(err);
    alert("Server error during login");
  }
}


// SAVE USER
function loginUser(user){
  currentUser = user;
  localStorage.setItem("kk_user", JSON.stringify(user));
  updateNavAuth();
}

// LOGOUT
function signOut(){
  currentUser = null;
  localStorage.removeItem("kk_user");
  updateNavAuth();
}

// RESTORE SESSION
function restoreUser(){
  const saved = localStorage.getItem("kk_user");
  if(saved){
    currentUser = JSON.parse(saved);
  }
  updateNavAuth();
}

// NAVBAR
function updateNavAuth(){
  const el = document.getElementById('nav-auth');

  if(currentUser){
    const initials = currentUser.name
      .split(' ')
      .map(w=>w[0])
      .join('')
      .toUpperCase()
      .slice(0,2);

    el.innerHTML = `<button class="profile-btn">${initials}</button>`;
  } else {
    el.innerHTML = `<button class="login-btn" onclick="openAuth()">Login / Sign up</button>`;
  }
}


// ---------------- MENU ----------------

function cap(s){
  return s.charAt(0).toUpperCase()+s.slice(1);
}

function menuCardHTML(d){
  return `
  <div class="menu-card">
    <div class="menu-img">
      <img src="${d.img}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;">
    </div>
    <div class="menu-body">
      <div class="menu-cat">${cap(d.cat)}</div>
      <div class="menu-name">${d.name}</div>
      <div class="menu-foot">
        <span>₹${d.price}</span>
        <span>★ ${d.rating}</span>
      </div>
      <button onclick="addToCart(${d.id})">Add</button>
    </div>
  </div>`;
}

function renderMenu(filter){
  const list = filter==='all' ? dishes : dishes.filter(d=>d.cat===filter);
  document.getElementById('menu-grid').innerHTML = list.map(menuCardHTML).join('');
}


// ---------------- CART ----------------

function addToCart(id){
  cart[id] = (cart[id]||0)+1;
  renderCart();
}

function renderCart(){
  const count = Object.values(cart).reduce((a,b)=>a+b,0);
  document.getElementById('cart-count').textContent = count;
}


// ---------------- INIT ----------------

renderMenu('all');
renderCart();
restoreUser();