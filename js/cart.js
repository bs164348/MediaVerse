class ShoppingCart {
  constructor() {
    this.cart = this.loadCart();
    this.init();
  }

  init() {
    this.renderCart();

    const addToCartButtons = document.querySelectorAll(
      ".cart-button, .button-cart"
    );
    addToCartButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.addToCart(e));
    });
  }

  loadCart() {
    const cartData = localStorage.getItem("shoppingCart");
    return cartData ? JSON.parse(cartData) : [];
  }

  saveCart() {
    localStorage.setItem("shoppingCart", JSON.stringify(this.cart));
  }

  addToCart(event) {
    const button = event.target;
    const article = button.closest("article");

    let productData = {};

    if (button.dataset.name && button.dataset.price) {
      productData = {
        id:
          button.dataset.id ||
          button.dataset.name.toLowerCase().replace(/\s+/g, "-"),
        name: button.dataset.name,
        price: parseFloat(button.dataset.price),
        image: button.dataset.image,
      };
    } else if (article) {
      const nameElement = article.querySelector(".item-name");
      const priceElement = article.querySelector(".item-price");

      if (nameElement && priceElement) {
        const name = nameElement.textContent.trim();
        const priceText = priceElement.textContent.trim();
        const price = parseFloat(
          priceText.replace("EUR", "").replace(",", ".").trim()
        );

        let image = "";
        const articleClass = article.className;
        if (articleClass.includes("item-cd")) image = "/assets/yeezus.jpg";
        else if (articleClass.includes("item-vhs"))
          image = "/assets/scarface.jpg";
        else if (articleClass.includes("item-game"))
          image = "/assets/kingdomHearts.jpg";
        else if (articleClass.includes("item-vinyl"))
          image = "/assets/discovery.jpg";
        else if (articleClass.includes("item-casette"))
          image = "/assets/afterHours.jpg";
        else if (articleClass.includes("item-dvd"))
          image = "/assets/interstella.jpg";

        productData = {
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name: name,
          price: price,
          image: image,
        };
      }
    }

    if (!productData.name || !productData.price) {
      console.error("Could not extract product data");
      return;
    }

    const existingItem = this.cart.find((item) => item.id === productData.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...productData,
        quantity: 1,
      });
    }

    this.saveCart();
    this.renderCart();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveCart();
    this.renderCart();
  }

  calculateTotal() {
    return this.cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  renderCart() {
    const cartContainers = document.querySelectorAll(".cart, .cart-desktop");

    cartContainers.forEach((container) => {
      const header = container.querySelector("p");
      const headerText = header
        ? header.innerHTML
        : '<i class="fa-solid fa-basket-shopping"></i> Shopping Cart';

      container.innerHTML = "";

      const headerElement = document.createElement("p");
      headerElement.innerHTML = headerText;
      container.appendChild(headerElement);

      if (this.cart.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Your cart is empty";
        emptyMessage.style.padding = "20px";
        emptyMessage.style.textAlign = "center";
        emptyMessage.style.color = "#666";
        container.appendChild(emptyMessage);
      } else {
        const itemsContainer = document.createElement("div");
        itemsContainer.className = "cart-items";

        this.cart.forEach((item) => {
          const cartItem = document.createElement("div");
          cartItem.className = "cart-item";
          cartItem.dataset.productId = item.id;

          const itemContent = document.createElement("div");
          itemContent.className = "cart-item-content";

          const img = document.createElement("img");
          img.src = item.image;
          img.alt = item.name;
          img.className = "cart-item-image";

          const itemInfo = document.createElement("div");
          itemInfo.className = "cart-item-info";

          const itemName = document.createElement("div");
          itemName.className = "cart-item-name";
          itemName.textContent =
            item.quantity > 1 ? `${item.name} (${item.quantity})` : item.name;

          const itemPrice = document.createElement("div");
          itemPrice.className = "cart-item-price";
          const totalPrice = (item.price * item.quantity).toFixed(2);
          itemPrice.textContent = `${totalPrice} EUR`;

          itemInfo.appendChild(itemName);
          itemInfo.appendChild(itemPrice);

          itemContent.appendChild(img);
          itemContent.appendChild(itemInfo);

          const removeBtn = document.createElement("button");
          removeBtn.className = "cart-item-remove";
          removeBtn.innerHTML = "❌";
          removeBtn.setAttribute("aria-label", "Remove item");
          removeBtn.addEventListener("click", () =>
            this.removeFromCart(item.id)
          );

          cartItem.appendChild(itemContent);
          cartItem.appendChild(removeBtn);
          itemsContainer.appendChild(cartItem);
        });

        container.appendChild(itemsContainer);

        const totalContainer = document.createElement("div");
        totalContainer.className = "cart-total";
        const totalLabel = document.createElement("span");
        totalLabel.textContent = "Total: ";
        totalLabel.className = "cart-total-label";
        const totalValue = document.createElement("span");
        totalValue.className = "cart-total-value";
        totalValue.textContent = `${this.calculateTotal().toFixed(2)} EUR`;
        totalContainer.appendChild(totalLabel);
        totalContainer.appendChild(totalValue);
        container.appendChild(totalContainer);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new ShoppingCart();
  });
} else {
  new ShoppingCart();
}
