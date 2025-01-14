const API_URL = 'http://localhost:3001/api/inventory';

inventoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemName = document.getElementById('itemName').value;
    const itemQuantity = document.getElementById('itemQuantity').value;
    const itemPrice = document.getElementById('itemPrice').value;

    const item = {
        name: itemName,
        quantity: parseInt(itemQuantity, 10),
        price: parseFloat(itemPrice),
    };

    try {
        // Send data to the backend
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });

        // Fetch and display updated inventory
        fetchInventory();
        inventoryForm.reset();
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to fetch inventory from backend
async function fetchInventory() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        displayInventory(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayInventory(inventory) {
    inventoryList.innerHTML = '';
    inventory.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - Quantity: ${item.quantity}, Price: $${item.price.toFixed(2)}`;
        inventoryList.appendChild(li);
    });
}

// Fetch inventory on page load
fetchInventory();
