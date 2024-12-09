import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import Admin from "./components/Admin";
import Products from "./components/Products";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
