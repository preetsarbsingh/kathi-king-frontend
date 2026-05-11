const API_URL = "https://kathi-king-backend.onrender.com";

async function loadOrders(){

  try{

    const res = await fetch(`${API_URL}/orders`);

    const orders = await res.json();

    const container = document.getElementById("orders-container");

    container.innerHTML = "";

    let revenue = 0;

    document.getElementById("total-orders").textContent = orders.length;

    orders.forEach(order => {

      revenue += order.total;

      const itemsHTML = order.items.map(item => `
        <div class="item">
          ${item.name} × ${item.qty}
        </div>
      `).join("");

      container.innerHTML += `
        <div class="order-card">

          <div class="order-top">

            <div>
              <h3>${order.userName}</h3>
              <p>${order.userEmail}</p>
            </div>

            <div>
              <h3>₹${order.total}</h3>
              <p>${order.status}</p>
            </div>

          </div>

          <div class="items">
            ${itemsHTML}
          </div>

        </div>
      `;
    });

    document.getElementById("total-revenue").textContent = `₹${revenue}`;

  }catch(err){

    console.log(err);

    alert("Failed to load orders");

  }
}

loadOrders();