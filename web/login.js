const API_BASE_URL = "http://localhost:3000"; 

async function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const errorMessage = document.getElementById("errorMessage");
  const loadingMessage = document.getElementById("loadingMessage");

  errorMessage.textContent = "";
  loadingMessage.style.display = "block";

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (response.ok) {
  
      localStorage.setItem("professorLogado", JSON.stringify(data.professor));
      window.location.href = "principal.html";
    } else {
      errorMessage.textContent = data.message || "E-mail ou senha incorretos.";
    }
  } catch (error) {
    errorMessage.textContent = "Erro de conexão com o servidor.";
  } finally {
    loadingMessage.style.display = "none";
  }
}
