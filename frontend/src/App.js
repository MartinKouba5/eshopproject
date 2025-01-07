import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import Admin from "./components/Admin";
import Products from "./components/Products";

function App() {
  const [user, setUser] = useState(null); // Stav pro přihlášeného uživatele

  const handleLogin = (userData) => {
    console.log("User logged in:", userData);
    setUser(userData); // Uložení přihlášeného uživatele
  };

  const handleLogout = () => {
    setUser(null); // Odhlášení uživatele
    console.log("User logged out");
  };

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={!!user} isAdmin={user?.isAdmin} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          {user?.isAdmin && <Route path="/admin" element={<Admin />} />} {/* Admin route pouze pro adminy */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
