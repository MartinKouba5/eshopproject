import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!validateEmail(email)) {
      setErrorMessage("Neplatný email");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Heslo musí mít alespoň 6 znaků");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 404) {
        setErrorMessage("Uživatel nenalezen");
        return;
      }

      if (response.status === 401) {
        setErrorMessage("Špatné heslo");
        return;
      }

      if (!response.ok) {
        setErrorMessage("Chyba při přihlášení");
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // Zavolání onLogin s předáním dat uživatele
      if (onLogin) {
        onLogin({ isAdmin: data.isAdmin, id: data.id, email: data.email });
        navigate("/"); // Přesměrování na hlavní stránku
      } else {
        console.error("onLogin function is not defined");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Nelze se připojit k serveru");
    }
  };

  const handleSignUp = async () => {
    if (!validateEmail(email)) {
      setErrorMessage("Neplatný email");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Heslo musí mít alespoň 6 znaků");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Nový Uživatel",
          email,
          password,
          is_admin: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Chyba při registraci");
        return;
      }

      const data = await response.json();
      console.log("User registered:", data);

      setErrorMessage("Registrace proběhla úspěšně, nyní se můžete přihlásit.");
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("Nelze se připojit k serveru");
    }
  };

  return (
    <div className="login">
      <h1>Přihlášení</h1>
      <form>
        <div className="form-outline mb-4">
          <label className="form-label" htmlFor="emailInput">
            Email
          </label>
          <input
            type="email"
            id="emailInput"
            className="form-control"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="form-outline mb-4">
          <label className="form-label" htmlFor="passwordInput">
            Heslo
          </label>
          <input
            type="password"
            id="passwordInput"
            className="form-control"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        {errorMessage && <p style={{ color: "red" }}>{"*" + errorMessage}</p>}
        <button
          type="button"
          className="btn btn-info btn-block mb-4"
          onClick={handleSignIn}
        >
          Přihlásit se
        </button>
        <button
          type="button"
          className="btn btn-link btn-block mb-4"
          onClick={handleSignUp}
        >
          Registrovat se
        </button>
      </form>
    </div>
  );
};

export default LoginPage;