const API_URL = "https://kathi-king-backend.onrender.com";

async function loadOrders(){

  try{

    const res = await fetch(`${API_URL}/orders`);

    const data = await res.json();

    const container = document.getElementById('orders-container');

    container.innerHTML = "";

    let revenue = 0;

    document.getElementById('total-orders').textContent = data.length;

    data.forEach(order => {

      revenue += order.total;

      const itemsHTML = order.items.map(item => `
        <div class="item">
          ${item.name} × ${item.qty} — ₹${item.price}
        </div>
      `).join('');

      container.innerHTML += `
        <div class="order-card">

          <div class="order-top">
            <div>
              <h3>${order.userName}</h3>
              <p>${order.userEmail}</p>
            </div>

            <div>
              <h3>₹${order.total}</h3>
              <p>${order.status || 'Pending'}</p>
            </div>
          </div>

          <div class="items">
            ${itemsHTML}
          </div>

          <div class="actions">

            <button class="status-btn"
              onclick="updateStatus('${order._id}')">
              Mark Delivered
            </button>

            <button class="delete-btn"
              onclick="deleteOrder('${order._id}')">
              Delete
            </button>

          </div>

        </div>
      `;

    });

    document.getElementById('total-revenue').textContent = `₹${revenue}`;

  }catch(err){

    console.log(err);
    alert('Failed to load orders');

  }
}


async function updateStatus(id){

  try{

    const res = await fetch(`${API_URL}/orders/${id}`,
    {
      method:'PUT'
    });

    const data = await res.json();

    alert(data.message);

    loadOrders();

  }catch(err){

    console.log(err);
    alert('Failed to update order');

  }
}


async function deleteOrder(id){

  const ok = confirm('Delete this order?');

  if(!ok) return;

  try{

    const res = await fetch(`${API_URL}/orders/${id}`,
    {
      method:'DELETE'
    });

    const data = await res.json();

    alert(data.message);

    loadOrders();

  }catch(err){

    console.log(err);
    alert('Failed to delete order');

  }
}


loadOrders();