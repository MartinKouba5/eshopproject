import React, { useState, useEffect } from "react";
import "./Admin.css";


const Admin = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceKc, setPriceKc] = useState("");
  const [priceEur, setPriceEur] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); // Pole produktů
  const [error, setError] = useState("");
  const [image, setImage] = useState(null); // Obrázek pro nový produkt

  // Načtení kategorií z backendu při načtení komponenty
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

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
      setError("Chyba při načítání kategorií.");
    }
  };

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
      setError("Chyba při načítání produktů.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !priceKc || !priceEur || !stock || !category) {
      setError("Všechna pole jsou povinná.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price_kc", priceKc);
    formData.append("price_eur", priceEur);
    formData.append("stock", stock);
    formData.append("category_id", category);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch("http://localhost:5000/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Chyba při ukládání produktu.");
      }

      alert("Produkt byl úspěšně uložen.");
      setName("");
      setDescription("");
      setPriceKc("");
      setPriceEur("");
      setStock("");
      setCategory("");
      setImage(null);
      setError("");
      fetchProducts(); // Aktualizace seznamu produktů
    } catch (error) {
      console.error("Error:", error);
      setError("Chyba při odesílání dat na server.");
    }
  };

  const handleEdit = async (product) => {
    const updatedStock = prompt("Zadejte nové množství na skladě:", product.stock);
    if (updatedStock === null || updatedStock === "") return;

    try {
      const response = await fetch(`http://localhost:5000/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: updatedStock }),
      });

      if (!response.ok) {
        throw new Error("Chyba při aktualizaci produktu.");
      }

      alert("Produkt byl úspěšně aktualizován.");
      fetchProducts(); // Aktualizace seznamu produktů
    } catch (error) {
      console.error("Error:", error);
      setError("Chyba při aktualizaci produktu.");
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Název</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Popis</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Cena (Kč)</label>
          <input
            type="number"
            value={priceKc}
            onChange={(e) => setPriceKc(e.target.value)}
          />
        </div>
        <div>
          <label>Cena (€)</label>
          <input
            type="number"
            value={priceEur}
            onChange={(e) => setPriceEur(e.target.value)}
          />
        </div>
        <div>
          <label>Počet na skladě</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
        <div>
          <label>Kategorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Vyber kategorii</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Obrázek</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <button type="submit">Uložit produkt</button>
      </form>

      <h2>Produkty</h2>
      <table>
        <thead>
          <tr>
            <th>Název</th>
            <th>Popis</th>
            <th>Cena (Kč)</th>
            <th>Cena (€)</th>
            <th>Kategorie</th>
            <th>Počet na skladě</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price_kc}</td>
              <td>{product.price_eur}</td>
              <td>{categories.find((cat) => cat.id === product.category_id)?.name || "Neznámá"}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => handleEdit(product)}>Upravit množství</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
