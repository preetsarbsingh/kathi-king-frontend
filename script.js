const API_URL = "https://kathi-king-backend.onrender.com";

var checkoutLoading = false;

var dishes = [
  {
    id:1,
    name:"Butter Chicken",
    cat:"indian",
    img:"assets/images/butter-chicken.jpg",
    price:299,
    rating:"4.7"
  },
  {
    id:2,
    name:"Paneer Tikka",
    cat:"indian",
    img:"assets/images/paneer-tikka.jpeg",
    price:249,
    rating:"4.7"
  },
  {
    id:3,
    name:"Dal Makhani",
    cat:"indian",
    img:"assets/images/Dal makhani.jpeg",
    price:-48,
    rating:"4.6"
  }
];

var cart = {};
var promoOn = false;
var currentUser = null;


// ---------------- AUTH ----------------

function openAuth(){
  document.getElementById('auth-modal').classList.add('open');
}

function closeAuth(){
  document.getElementById('auth-modal').classList.remove('open');
}

function switchTab(t){

  document.getElementById('form-login').style.display =
    t === 'login' ? 'block' : 'none';

  document.getElementById('form-signup').style.display =
    t === 'signup' ? 'block' : 'none';

}


// ---------------- SIGNUP ----------------

async function doSignup(){

  const name =
    document.getElementById('s-name').value.trim();

  const email =
    document.getElementById('s-email').value.trim();

  const password =
    document.getElementById('s-pass').value.trim();

  if(!name || !email || !password){

    alert("Fill all fields");
    return;

  }

  try{

    const res = await fetch(`${API_URL}/signup`,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        name,
        email,
        password
      })

    });

    const data = await res.json();

    console.log("Signup Response:", data);

    if(res.ok){

      alert("Signup successful!");

      loginUser(data.user);

      closeAuth();

    }else{

      alert(data.message || "Signup failed");

    }

  }catch(err){

    console.log(err);

    alert("Server error during signup");

  }

}


// ---------------- LOGIN ----------------

async function doLogin(){

  const email =
    document.getElementById('l-email').value.trim();

  const password =
    document.getElementById('l-pass').value.trim();

  if(!email || !password){

    alert("Fill all fields");
    return;

  }

  try{

    const res = await fetch(`${API_URL}/login`,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        email,
        password
      })

    });

    const data = await res.json();

    console.log("Login Response:", data);

    if(res.ok && data.user){
       if(!data.user.name || !data.user.email){
          alert("Invalid user data");
          return;
       }
        loginUser(data.user);
        closeAuth();
    }else{
     alert(data.message || "Invalid credentials");
    }

  }catch(err){

    console.log(err);

    alert("Server error during login");

  }

}


// ---------------- USER SESSION ----------------

function loginUser(user){

  currentUser = user;

  localStorage.setItem(
    "kk_user",
    JSON.stringify(user)
  );

  updateNavAuth();

  restoreCart();

}

function signOut(){

  saveCart();

  currentUser = null;

  localStorage.removeItem("kk_user");

  const menu = document.getElementById("profile-menu");

  if(menu){
    menu.classList.remove("show");
  }

  updateNavAuth();

  restoreCart();

  alert("Logged out successfully");

}

function restoreUser(){

  try{

    const saved = localStorage.getItem("kk_user");

    if(saved){

      currentUser = JSON.parse(saved);

    }

  }catch(err){

    console.log(err);

    localStorage.removeItem("kk_user");

  }

  updateNavAuth();


}

function getCartKey(){

  if(currentUser){

    return `kk_cart_${currentUser.email}`;

  }

  return "kk_cart_guest";

}

function saveCart(){

  localStorage.setItem(
    getCartKey(),
    JSON.stringify(cart)
  );

}

function restoreCart(){

  try{

    const saved = localStorage.getItem(getCartKey());

    cart = saved ? JSON.parse(saved) : {};

  }catch(err){

    console.log(err);

    cart = {};

  }

  renderCart();

}


// ---------------- PROFILE MENU ----------------

function toggleProfileMenu(){

  document
    .getElementById('profile-menu')
    .classList
    .toggle('show');

}

window.addEventListener('click', function(e){

  const wrapper =
    document.querySelector('.profile-wrapper');

  if(wrapper && !wrapper.contains(e.target)){

    const menu =
      document.getElementById('profile-menu');

    if(menu){

      menu.classList.remove('show');

    }
  }

});


// ---------------- NAVBAR ----------------

function updateNavAuth(){

  const el =
    document.getElementById('nav-auth');

  if(currentUser){

    const initials =
      currentUser.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0,2);

    el.innerHTML = `

      <div class="profile-wrapper">

        <button
          class="profile-btn"
          onclick="toggleProfileMenu()"
        >
          ${initials}
        </button>

        <div
          class="profile-menu"
          id="profile-menu"
        >

          <div class="pm-name">
            ${currentUser.name}
          </div>

          <div class="pm-email">
            ${currentUser.email}
          </div>

          <button
            class="logout-btn"
            onclick="signOut()"
          >
            Logout
          </button>

        </div>

      </div>

    `;

  }else{

    el.innerHTML = `

      <button
        class="login-btn"
        onclick="openAuth()"
      >
        Login / Sign up
      </button>

    `;
  }

}


// ---------------- MENU ----------------

function cap(s){

  return s.charAt(0).toUpperCase() + s.slice(1);

}

function menuCardHTML(d){

  return `

    <div class="menu-card">

      <div class="menu-img">

        <img
          src="${d.img}"
          alt="${d.name}"
          style="
            width:100%;
            height:100%;
            object-fit:cover;
          "
        >

      </div>

      <div class="menu-body">

        <div class="menu-cat">
          ${cap(d.cat)}
        </div>

        <div class="menu-name">
          ${d.name}
        </div>

        <div class="menu-foot">

          <span>
            ₹${d.price}
          </span>

          <span>
            ★ ${d.rating}
          </span>

        </div>

        <button
          class="add-btn"
          id="btn-${d.id}"
          onclick="addToCart(${d.id})"
        >
          Add to Cart
        </button>

      </div>

    </div>

  `;

}

function renderMenu(filter){

  const list =
    filter === 'all'
    ? dishes
    : dishes.filter(d => d.cat === filter);

  document.getElementById('menu-grid').innerHTML =
    list.map(menuCardHTML).join('');

}


// ---------------- CART ----------------

function addToCart(id){

  cart[id] = (cart[id] || 0) + 1;

  renderCart();

  saveCart();

  const btn =
    document.getElementById(`btn-${id}`);

  if(btn){

     btn.classList.add("added");

     btn.innerText = "Added ✓";

     setTimeout(()=>{

     btn.classList.remove("added");

     btn.innerText = "Add to Cart";

    },1500);

  }

}

function changeQty(id, delta){

  cart[id] += delta;

  if(cart[id] <= 0){

    delete cart[id];

  }

  

  renderCart();
  saveCart();

}


function renderCart(){

  const count =
    Object.values(cart)
    .reduce((a,b)=>a+b,0);

  document.getElementById('cart-count')
    .textContent = count;

  const body =
    document.getElementById('cart-body');

  const foot =
    document.getElementById('cart-foot');

  const keys = Object.keys(cart);

  if(keys.length === 0){

    body.innerHTML = `
      <div class="empty-msg">
        Cart is empty
      </div>
    `;

    foot.style.display = "none";

    return;

  }

  foot.style.display = "block";

  let subtotal = 0;

  body.innerHTML = keys.map(id=>{

    const d =
      dishes.find(x => x.id == id);

    const qty = cart[id];

    const total =
      d.price * qty;

    subtotal += total;

    return `

      <div class="c-item">

        <div>

          <div class="c-name">
            ${d.name}
          </div>

          <div class="qty-row">

            <button
              onclick="changeQty(${id},-1)"
            >
              -
            </button>

            <span>
              ${qty}
            </span>

            <button
              onclick="changeQty(${id},1)"
            >
              +
            </button>

          </div>

        </div>

        <div class="c-price">
          ₹${total}
        </div>

      </div>

    `;

  }).join('');

  const delivery =
    subtotal > 499 ? 0 : 49;

  const finalTotal =
    subtotal + delivery;

  document.getElementById('cart-total').innerHTML = `

    <div>
      Subtotal: ₹${subtotal}
    </div>

    <div>
      Delivery:
      ${delivery === 0 ? "Free" : `₹${delivery}`}
    </div>

    <div>
      <b>Total: ₹${finalTotal}</b>
    </div>

  `;

}


// ---------------- CHECKOUT ----------------

async function checkout(){

  if(checkoutLoading){
    return;
  }

  if(!currentUser){

    alert("Please login first");

    openAuth();

    return;
  }

  const keys = Object.keys(cart);

  if(!keys.length){

    alert("Cart is empty");

    return;
  }

  let items = [];
  let total = 0;

  keys.forEach(id=>{

    const dish = dishes.find(d => d.id == id);

    const quantity = cart[id];

    total += dish.price * quantity;

    items.push({

      name:dish.name,

      price:dish.price,

      quantity:quantity

    });

  });

  checkoutLoading = true;

  const checkoutBtn =
    document.getElementById("checkout-btn");

  if(checkoutBtn){

    checkoutBtn.disabled = true;

    checkoutBtn.innerText = "Opening Payment...";
  }

  try{

    // CREATE PAYMENT ORDER

    const orderRes = await fetch(
      `${API_URL}/create-payment-order`,
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          total
        })

      }
    );

    const orderData = await orderRes.json();

    // OPEN RAZORPAY

    const options = {

      key:"rzp_test_SoShtULzg0BlHv",

      amount:orderData.amount,

      currency:"INR",

      name:"Kathi King",

      description:"Food Order Payment",

      order_id:orderData.id,

      handler: async function(response){

        // SAVE ORDER AFTER SUCCESS

        const saveRes = await fetch(
          `${API_URL}/create-order`,
          {

            method:"POST",

            headers:{
              "Content-Type":"application/json"
            },

            body:JSON.stringify({

              userEmail:currentUser.email,

              userName:currentUser.name,

              items,

              total,

              paymentId:
                response.razorpay_payment_id

            })

          }
        );

        const saveData = await saveRes.json();

        console.log(saveData);

        alert(
          "Payment Successful 🎉\nOrder placed successfully."
        );

        cart = {};

        saveCart();

        renderCart();

        checkoutLoading = false;

        if(checkoutBtn){

          checkoutBtn.disabled = false;

          checkoutBtn.innerText = "Checkout";
        }

      },

      prefill:{

        name:currentUser.name,

        email:currentUser.email

      },

      theme:{
        color:"#e63946"
      },

      method:{
        upi:true,
        card:true
      },

      config:{
        display:{
          blocks:{

            upi:{
              name:"Pay using UPI",
              instruments:[
                {
                  method:"upi"
                }
              ]
            },

            cards:{
              name:"Pay using Card",
              instruments:[
                {
                  method:"card"
                }
              ]
            }

          },

          sequence:[
            "block.upi",
            "block.cards"
          ],

          preferences:{
            show_default_blocks:false
          }

        }
      }

    };

    const rzp = new Razorpay(options);

    rzp.open();

    rzp.on('payment.failed', function () {

      alert("Payment Failed");

      checkoutLoading = false;

      if(checkoutBtn){

        checkoutBtn.disabled = false;

        checkoutBtn.innerText = "Checkout";
      }

    });

  }catch(err){

    console.log(err);

    alert("Server error");

    checkoutLoading = false;

    if(checkoutBtn){

      checkoutBtn.disabled = false;

      checkoutBtn.innerText = "Checkout";
    }

  }

}

// ---------------- CART SIDEBAR ----------------

function toggleCart(){

  document
    .getElementById('cart-sidebar')
    .classList
    .toggle('open');

}
// ---------------- INIT ----------------

renderMenu('all');

restoreUser();

restoreCart();


