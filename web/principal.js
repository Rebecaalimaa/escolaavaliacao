const API_URL = "http://localhost:3000";
let turmaParaExcluir = null;

document.addEventListener("DOMContentLoaded", () => {
    verificarLogin();
    carregarTurmas();
});

function verificarLogin() {
    const professor = JSON.parse(localStorage.getItem("professorLogado"));
    if (!professor) {
        window.location.href = "login.html";
        return;
    }
    document.getElementById("userInfo").textContent = `Olá, ${professor.nome}`;
}

async function carregarTurmas() {
    const lista = document.getElementById("listaTurmas");
    const loading = document.getElementById("loading");
    const vazio = document.getElementById("nenhumaTurma");

    loading.style.display = "block";
    lista.style.display = "none";
    vazio.style.display = "none";

    try {
        const professor = JSON.parse(localStorage.getItem("professorLogado"));
        const res = await fetch(`${API_URL}/professores/${professor.id}/turmas`);
        const turmas = await res.json();

        loading.style.display = "none";

        if (!turmas.length) {
            vazio.style.display = "block";
            return;
        }

        lista.innerHTML = "";
        turmas.forEach(turma => {
            const card = document.createElement("div");
            card.className = "turma-card";
            card.innerHTML = `
        <h3>${turma.nome}</h3>
        <p>Número: ${turma.numero}</p>
        <div class="turma-actions">
          <button class="btn" onclick="verAtividades(${turma.id})">Atividades</button>
          <button class="btn btn-danger" onclick="abrirModalExcluir(${turma.id})">Excluir</button>
        </div>
      `;
            lista.appendChild(card);
        });
        lista.style.display = "grid";
    } catch {
        loading.innerHTML = "<p style='color:#ff6b6b;'>Erro ao carregar turmas.</p>";
    }
}

function abrirModalNovaTurma() {
    document.getElementById("modalNovaTurma").style.display = "block";
}

function fecharModalNovaTurma() {
    document.getElementById("modalNovaTurma").style.display = "none";
    document.getElementById("formNovaTurma").reset();
}

document.getElementById("formNovaTurma").addEventListener("submit", async e => {
    e.preventDefault();
    const nome = document.getElementById("nomeTurma").value;
    const numero = parseInt(document.getElementById("numeroTurma").value, 10);
    const professor = JSON.parse(localStorage.getItem("professorLogado"));

    try {
        const res = await fetch(`${API_URL}/turmas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, numero, professor_id: professor.id }),
        });

        if (res.ok) {
            fecharModalNovaTurma();
            carregarTurmas();
        } else {
            alert("Erro ao cadastrar turma.");
        }
    } catch {
        alert("Falha na comunicação com o servidor.");
    }
});

function abrirModalExcluir(id) {
    turmaParaExcluir = id;
    document.getElementById("modalExcluir").style.display = "block";
}

function fecharModalExcluir() {
    turmaParaExcluir = null;
    document.getElementById("modalExcluir").style.display = "none";
}

async function confirmarExclusao() {
    if (!turmaParaExcluir) return;

    try {
        const res = await fetch(`${API_URL}/turmas/${turmaParaExcluir}`, {
            method: "DELETE",
        });

        if (res.ok) {
            fecharModalExcluir();
            carregarTurmas();
        } else {
            alert("Erro ao excluir turma. Verifique se há atividades cadastradas.");
        }
    } catch {
        alert("Erro ao excluir turma.");
    }
}

function verAtividades(turmaId) {
    window.location.href = `atividades.html?turma=${turmaId}`;
}

function logout() {
    localStorage.removeItem("professorLogado");
    window.location.href = "login.html";
}
