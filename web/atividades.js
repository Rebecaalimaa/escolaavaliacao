let turmaAtual = null;
let atividadeParaExcluir = null;

const turmaId = localStorage.getItem('turmaAtualId');
if (turmaId) {
    turmaAtual = { id: Number(turmaId) }; 
} else {
    window.location.href = 'principal.html';
}
async function carregarAtividades() {
    const loading = document.getElementById('loading');
    const listaAtividades = document.getElementById('listaAtividades');
    const nenhumaAtividade = document.getElementById('nenhumaAtividade');

    loading.style.display = 'none';
    listaAtividades.style.display = 'none';
    nenhumaAtividade.style.display = 'none';

       const response = await fetch(`http://localhost:3000/turmas/${turmaAtual.id}/atividades`);
    atividadesCarregadas = await response.json();

    if (!atividadesCarregadas || atividadesCarregadas.length === 0) {
        nenhumaAtividade.style.display = 'block';
    } else {
        listaAtividades.style.display = 'grid';
        renderizarAtividades(atividadesCarregadas);
    }
}

function renderizarAtividades(atividades) {
    const listaAtividades = document.getElementById('listaAtividades');
    listaAtividades.innerHTML = '';

    atividades.forEach(atividade => {
        const card = criarCardAtividade(atividade);
        listaAtividades.appendChild(card);
    });
}

function criarCardAtividade(atividade) {
    const card = document.createElement('div');
    card.className = 'atividade-card';

    const dataFormatada = formatarData(atividade.data);
    const hoje = new Date();
    const dataEntrega = new Date(atividade.data);
    const atrasada = dataEntrega < hoje;

    card.innerHTML = `
        <h3>${atividade.nome}</h3>
        <div class="atividade-descricao">${atividade.descricao}</div>
        <div class="atividade-data">
            <span style="color: ${atrasada ? '#e74c3c' : '#27ae60'}">
                📅 ${dataFormatada} ${atrasada ? '(Atrasada)' : ''}
            </span>
            <span class="atividade-pontos">📊 ${atividade.pontuacaoMaxima} pts</span>
        </div>
        <div class="atividade-actions">
            <button class="btn btn-small btn-edit" onclick="abrirModalEditar('${atividade.id}')">Editar</button>
            <button class="btn btn-small btn-delete" onclick="abrirModalExcluir('${atividade.id}')">Excluir</button>
        </div>
    `;

    return card;
}

function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    if (isNaN(data)) return '';
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function configurarEventos() {
    document.getElementById('formNovaAtividade').addEventListener('submit', cadastrarAtividade);
    document.getElementById('formEditarAtividade').addEventListener('submit', salvarEdicaoAtividade);
}

function abrirModalNovaAtividade() {
    document.getElementById('modalNovaAtividade').style.display = 'block';
}

function fecharModalNovaAtividade() {
    document.getElementById('modalNovaAtividade').style.display = 'none';
    document.getElementById('formNovaAtividade').reset();
}

async function cadastrarAtividade(e) {
    e.preventDefault();

    const atividade = {
        nome: document.getElementById('tituloAtividade').value,
        descricao: document.getElementById('descricaoAtividade').value,
        data: document.getElementById('dataEntrega').value,
        pontuacaoMaxima: parseFloat(document.getElementById('pontuacaoMaxima').value),
        turmaId: Number(turmaAtual.id)
    };

    await fetch('http://localhost:3000/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(atividade)
    });

    fecharModalNovaAtividade();
    carregarAtividades();
}

function abrirModalEditar(atividadeId) {
    const atividade = atividadesCarregadas.find(a => a.id == atividadeId);

    if (atividade) {
        document.getElementById('editAtividadeId').value = atividade.id;
        document.getElementById('editTituloAtividade').value = atividade.nome;
        document.getElementById('editDescricaoAtividade').value = atividade.descricao;
        document.getElementById('editDataEntrega').value = atividade.data.slice(0, 10); 
        document.getElementById('editPontuacaoMaxima').value = atividade.pontuacaoMaxima;

        document.getElementById('modalEditarAtividade').style.display = 'block';
    }
}

function fecharModalEditarAtividade() {
    document.getElementById('modalEditarAtividade').style.display = 'none';
    document.getElementById('formEditarAtividade').reset();
}

async function salvarEdicaoAtividade(e) {
    e.preventDefault();

    const atividadeId = document.getElementById('editAtividadeId').value;

    const atividadeEditada = {
        nome: document.getElementById('editTituloAtividade').value,
        descricao: document.getElementById('editDescricaoAtividade').value,
        data: document.getElementById('editDataEntrega').value,
        pontuacaoMaxima: parseFloat(document.getElementById('editPontuacaoMaxima').value),
    };

    await fetch(`http://localhost:3000/atividades/${atividadeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(atividadeEditada)
    });

    fecharModalEditarAtividade();
    carregarAtividades();
}

function abrirModalExcluir(atividadeId) {
    atividadeParaExcluir = atividadeId;
    document.getElementById('modalExcluir').style.display = 'block';
}

function fecharModalExcluir() {
    atividadeParaExcluir = null;
    document.getElementById('modalExcluir').style.display = 'none';
}

function confirmarExclusao() {
    if (atividadeParaExcluir) {
        const atividades = JSON.parse(localStorage.getItem(`atividades_${turmaAtual.id}`) || '[]');
        const novasAtividades = atividades.filter(a => a.id !== atividadeParaExcluir);

        localStorage.setItem(`atividades_${turmaAtual.id}`, JSON.stringify(novasAtividades));

        fecharModalExcluir();
        carregarAtividades();
    }
}

function voltarParaPrincipal() {
    localStorage.removeItem('turmaAtualId');
    window.location.href = 'principal.html';
}


function logout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('turmaAtualId');
    window.location.href = 'login.html';
}

window.onclick = function (event) {
    const modalNovaAtividade = document.getElementById('modalNovaAtividade');
    const modalEditarAtividade = document.getElementById('modalEditarAtividade');
    const modalExcluir = document.getElementById('modalExcluir');

    if (event.target === modalNovaAtividade) {
        fecharModalNovaAtividade();
    }
    if (event.target === modalEditarAtividade) {
        fecharModalEditarAtividade();
    }
    if (event.target === modalExcluir) {
        fecharModalExcluir();
    }
}

window.onload = function() {
    carregarAtividades();
    configurarEventos && configurarEventos(); 
};