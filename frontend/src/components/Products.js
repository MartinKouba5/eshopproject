import React, { useState, useEffect } from "react";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [currency, setCurrency] = useState("Kč");

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/products");
        if (!response.ok) {
          throw new Error("Chyba při načítání produktů.");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/categories");
        if (!response.ok) {
          throw new Error("Chyba při načítání kategorií.");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleAddToCart = (product) => {
    alert(`Produkt "${product.name}" byl přidán do košíku.`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category_id === parseInt(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="products-container">
      <div className="filters">
        <input
          type="text"
          placeholder="Hledat produkty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Všechny kategorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="Kč">Kč</option>
          <option value="€">€</option>
        </select>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <img
              src={`http://localhost:5000${product.image_url}`}
              alt={product.name}
              className="product-image"
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>
              Cena:{" "}
              {currency === "Kč"
                ? `${product.price_kc} Kč`
                : `${product.price_eur} €`}
            </p>
            <p>Kusů skladem: {product.stock}</p>
            <button onClick={() => handleAddToCart(product)}>Přidat do košíku</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
