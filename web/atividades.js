// ...existing code...
let turmaAtual = null;
let atividadeParaExcluir = null;

// Carrega turmaAtual do localStorage
const turmaId = localStorage.getItem('turmaAtualId');
if (turmaId) {
    turmaAtual = { id: turmaId };
} else {
    // Se não houver turma selecionada, redireciona para a página principal
    window.location.href = 'principal.html';
}
// ...existing code...

// Carrega as atividades da turma
function carregarAtividades() {
    const loading = document.getElementById('loading');
    const listaAtividades = document.getElementById('listaAtividades');
    const nenhumaAtividade = document.getElementById('nenhumaAtividade');

    loading.style.display = 'block';
    listaAtividades.style.display = 'none';
    nenhumaAtividade.style.display = 'none';

    setTimeout(() => {
        const atividades = JSON.parse(localStorage.getItem(`atividades_${turmaAtual.id}`) || '[]');

        loading.style.display = 'none';

        if (atividades.length === 0) {
            nenhumaAtividade.style.display = 'block';
        } else {
            listaAtividades.style.display = 'grid';
            renderizarAtividades(atividades);
            if (!turmaAtual) return;
        }
    }, 500);
}

// Renderiza as atividades na tela
function renderizarAtividades(atividades) {
    const listaAtividades = document.getElementById('listaAtividades');
    listaAtividades.innerHTML = '';

    atividades.forEach(atividade => {
        const card = criarCardAtividade(atividade);
        listaAtividades.appendChild(card);
    });
}

// Cria um card de atividade
function criarCardAtividade(atividade) {
    const card = document.createElement('div');
    card.className = 'atividade-card';

    const dataFormatada = formatarData(atividade.dataEntrega);
    const hoje = new Date();
    const dataEntrega = new Date(atividade.dataEntrega);
    const atrasada = dataEntrega < hoje;

    card.innerHTML = `
        <h3>${atividade.titulo}</h3>
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

// Formata a data para exibição
function formatarData(dataString) {
    const data = new Date(dataString + 'T00:00:00');
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Configura os eventos dos formulários
function configurarEventos() {
    document.getElementById('formNovaAtividade').addEventListener('submit', cadastrarAtividade);
    document.getElementById('formEditarAtividade').addEventListener('submit', salvarEdicaoAtividade);
}

// Abre o modal de nova atividade
function abrirModalNovaAtividade() {
    document.getElementById('modalNovaAtividade').style.display = 'block';
}

// Fecha o modal de nova atividade
function fecharModalNovaAtividade() {
    document.getElementById('modalNovaAtividade').style.display = 'none';
    document.getElementById('formNovaAtividade').reset();
}

// Cadastra uma nova atividade
function cadastrarAtividade(e) {
    e.preventDefault();

    const novaAtividade = {
        id: Date.now().toString(),
        titulo: document.getElementById('tituloAtividade').value,
        descricao: document.getElementById('descricaoAtividade').value,
        dataEntrega: document.getElementById('dataEntrega').value,
        pontuacaoMaxima: parseFloat(document.getElementById('pontuacaoMaxima').value),
        dataCriacao: new Date().toISOString()
    };

    const atividades = JSON.parse(localStorage.getItem(`atividades_${turmaAtual.id}`) || '[]');
    atividades.push(novaAtividade);
    localStorage.setItem(`atividades_${turmaAtual.id}`, JSON.stringify(atividades));

    fecharModalNovaAtividade();
    carregarAtividades();
}

// Abre o modal de edição
function abrirModalEditar(atividadeId) {
    const atividades = JSON.parse(localStorage.getItem(`atividades_${turmaAtual.id}`) || '[]');
    const atividade = atividades.find(a => a.id === atividadeId);

    if (atividade) {
        document.getElementById('editAtividadeId').value = atividade.id;
        document.getElementById('editTituloAtividade').value = atividade.titulo;
        document.getElementById('editDescricaoAtividade').value = atividade.descricao;
        document.getElementById('editDataEntrega').value = atividade.dataEntrega;
        document.getElementById('editPontuacaoMaxima').value = atividade.pontuacaoMaxima;

        document.getElementById('modalEditarAtividade').style.display = 'block';
    }
}

// Fecha o modal de edição
function fecharModalEditarAtividade() {
    document.getElementById('modalEditarAtividade').style.display = 'none';
    document.getElementById('formEditarAtividade').reset();
}

// Salva a edição da atividade
function salvarEdicaoAtividade(e) {
    e.preventDefault();

    const atividadeId = document.getElementById('editAtividadeId').value;
    const atividades = JSON.parse(localStorage.getItem(`atividades_${turmaAtual.id}`) || '[]');
    const index = atividades.findIndex(a => a.id === atividadeId);

    if (index !== -1) {
        atividades[index] = {
            ...atividades[index],
            titulo: document.getElementById('editTituloAtividade').value,
            descricao: document.getElementById('editDescricaoAtividade').value,
            dataEntrega: document.getElementById('editDataEntrega').value,
            pontuacaoMaxima: parseFloat(document.getElementById('editPontuacaoMaxima').value)
        };

        localStorage.setItem(`atividades_${turmaAtual.id}`, JSON.stringify(atividades));
        fecharModalEditarAtividade();
        carregarAtividades();
    }
}

// Abre o modal de exclusão
function abrirModalExcluir(atividadeId) {
    atividadeParaExcluir = atividadeId;
    document.getElementById('modalExcluir').style.display = 'block';
}

// Fecha o modal de exclusão
function fecharModalExcluir() {
    atividadeParaExcluir = null;
    document.getElementById('modalExcluir').style.display = 'none';
}

// Confirma a exclusão da atividade
function confirmarExclusao() {
    if (atividadeParaExcluir) {
        const atividades = JSON.parse(localStorage.getItem(`atividades_${turmaAtual.id}`) || '[]');
        const novasAtividades = atividades.filter(a => a.id !== atividadeParaExcluir);

        localStorage.setItem(`atividades_${turmaAtual.id}`, JSON.stringify(novasAtividades));

        fecharModalExcluir();
        carregarAtividades();
    }
}

// Volta para a página principal
function voltarParaPrincipal() {
    localStorage.removeItem('turmaAtualId');
    window.location.href = 'principal.html';
}

// Faz logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('turmaAtualId');
    window.location.href = 'login.html';
}

// Fecha modais ao clicar fora deles
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

