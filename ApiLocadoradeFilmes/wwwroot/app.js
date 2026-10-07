/**
 * CineLocadora - Script da Interface de Demonstração
 * JavaScript Puro (Sem dependências, bibliotecas ou conexão com API)
 * 
 * Todas as operações atuam exclusivamente no estado em memória deste script.
 */

'use strict';

// --- Dados Fictícios Iniciais para Demonstração Local ---
const DADOS_INICIAIS = [
  { id: 1, titulo: 'As Branquelas', genero: 'Comédia', disponivel: true },
  { id: 2, titulo: 'O Poderoso Chefão', genero: 'Drama', disponivel: true },
  { id: 3, titulo: 'Ponyo', genero: 'Animação', disponivel: false },
  { id: 4, titulo: 'Matrix', genero: 'Ficção Científica', disponivel: true }
];

// --- Estado da Aplicação em Memória ---
let filmes = [...DADOS_INICIAIS];
let filmeEmEdicaoId = null; // null = modo criação; número = ID do filme em edição

// --- Referências aos Elementos do DOM ---
const elements = {
  // Formulário e Campos
  form: document.getElementById('filme-form'),
  formHeading: document.getElementById('form-heading'),
  formModeBadge: document.getElementById('form-mode-badge'),
  campoId: document.getElementById('filme-id'),
  campoTitulo: document.getElementById('filme-titulo'),
  campoGenero: document.getElementById('filme-genero'),
  campoDisponivel: document.getElementById('filme-disponivel'),
  erroTitulo: document.getElementById('filme-titulo-erro'),
  erroGenero: document.getElementById('filme-genero-erro'),
  btnSubmit: document.getElementById('btn-submit'),
  btnSubmitText: document.getElementById('btn-submit-text'),
  btnCancel: document.getElementById('btn-cancel'),
  btnReset: document.getElementById('btn-reset'),
  
  // Listagem e Filtro
  tbody: document.getElementById('filmes-tbody'),
  totalBadge: document.getElementById('filmes-total'),
  buscaInput: document.getElementById('busca-input'),
  btnLimparBusca: document.getElementById('btn-limpar-busca'),
  emptyState: document.getElementById('empty-state'),
  emptyMessage: document.getElementById('empty-message'),
  
  // Alertas
  alertContainer: document.getElementById('alert-container')
};

// --- Funções Auxiliares de Notificação ---

/**
 * Exibe mensagem de feedback visual e acessível para o usuário.
 * @param {string} mensagem - Texto da mensagem.
 * @param {'success'|'info'|'warning'|'danger'} tipo - Tipo do alerta.
 */
function mostrarAlerta(mensagem, tipo = 'success') {
  elements.alertContainer.innerHTML = '';

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${tipo}`;
  
  const spanText = document.createElement('span');
  spanText.textContent = mensagem;

  const btnClose = document.createElement('button');
  btnClose.type = 'button';
  btnClose.className = 'alert-close';
  btnClose.setAttribute('aria-label', 'Fechar notificação');
  btnClose.innerHTML = '&times;';
  btnClose.addEventListener('click', () => alertDiv.remove());

  alertDiv.appendChild(spanText);
  alertDiv.appendChild(btnClose);
  elements.alertContainer.appendChild(alertDiv);

  // Auto-remoção após 5 segundos
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.remove();
    }
  }, 5000);
}

// --- Funções de Renderização da Listagem ---

/**
 * Renderiza a lista de filmes na tabela com dados locais.
 * @param {Array} listaFilmes - Coleção de filmes para exibir.
 */
function renderizarTabela(listaFilmes = filmes) {
  elements.tbody.innerHTML = '';
  
  // Atualiza badge de total
  const total = listaFilmes.length;
  elements.totalBadge.textContent = `Total: ${total} ${total === 1 ? 'filme' : 'filmes'}`;

  if (total === 0) {
    elements.emptyState.style.display = 'block';
    if (elements.buscaInput.value.trim() !== '') {
      elements.emptyMessage.textContent = 'Nenhum filme localizado com o termo pesquisado.';
    } else {
      elements.emptyMessage.textContent = 'Nenhum filme cadastrado na demonstração.';
    }
    return;
  }

  elements.emptyState.style.display = 'none';

  listaFilmes.forEach(filme => {
    const tr = document.createElement('tr');
    if (filmeEmEdicaoId === filme.id) {
      tr.classList.add('row-selected');
    }

    // Coluna ID
    const tdId = document.createElement('td');
    tdId.className = 'td-id';
    tdId.textContent = filme.id;

    // Coluna Título
    const tdTitulo = document.createElement('td');
    tdTitulo.className = 'td-titulo';
    tdTitulo.textContent = filme.titulo;

    // Coluna Gênero
    const tdGenero = document.createElement('td');
    tdGenero.className = 'td-genero';
    tdGenero.textContent = filme.genero;

    // Coluna Status (Disponível ou Indisponível)
    const tdStatus = document.createElement('td');
    const badgeStatus = document.createElement('span');
    badgeStatus.className = `badge-status ${filme.disponivel ? 'badge-disponivel' : 'badge-indisponivel'}`;
    
    const dot = document.createElement('span');
    dot.className = 'badge-status-dot';
    dot.setAttribute('aria-hidden', 'true');

    badgeStatus.appendChild(dot);
    badgeStatus.appendChild(document.createTextNode(filme.disponivel ? 'Disponível' : 'Indisponível'));
    tdStatus.appendChild(badgeStatus);

    // Coluna Ações
    const tdAcoes = document.createElement('td');
    tdAcoes.className = 'td-acoes';

    const divAcoes = document.createElement('div');
    divAcoes.className = 'row-actions';

    // Botão Visualizar / Editar
    const btnEditar = document.createElement('button');
    btnEditar.type = 'button';
    btnEditar.className = 'btn btn-action-edit btn-sm';
    btnEditar.setAttribute('aria-label', `Visualizar e editar o filme "${filme.titulo}"`);
    btnEditar.textContent = 'Visualizar / Editar';
    btnEditar.addEventListener('click', () => carregarFilmeParaEdicao(filme.id));

    // Botão Excluir
    const btnExcluir = document.createElement('button');
    btnExcluir.type = 'button';
    btnExcluir.className = 'btn btn-action-delete btn-sm';
    btnExcluir.setAttribute('aria-label', `Excluir o filme "${filme.titulo}"`);
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => excluirFilmeLocal(filme.id));

    divAcoes.appendChild(btnEditar);
    divAcoes.appendChild(btnExcluir);
    tdAcoes.appendChild(divAcoes);

    // Monta a linha
    tr.appendChild(tdId);
    tr.appendChild(tdTitulo);
    tr.appendChild(tdGenero);
    tr.appendChild(tdStatus);
    tr.appendChild(tdAcoes);

    elements.tbody.appendChild(tr);
  });
}

// --- Operações do Formulário (Visualizar, Adicionar, Atualizar, Deletar) ---

/**
 * Limpa mensagens de erro de validação do formulário.
 */
function limparErrosValidacao() {
  elements.campoTitulo.classList.remove('input-error');
  elements.campoGenero.classList.remove('input-error');
  elements.erroTitulo.textContent = '';
  elements.erroGenero.textContent = '';
}

/**
 * Preenche o formulário com dados do filme selecionado (modo edição/visualização).
 * @param {number} id - Identificador do filme.
 */
function carregarFilmeParaEdicao(id) {
  const filme = filmes.find(f => f.id === id);
  if (!filme) {
    mostrarAlerta('Filme não encontrado na lista de demonstração.', 'warning');
    return;
  }

  limparErrosValidacao();
  filmeEmEdicaoId = filme.id;

  // Atualiza campos
  elements.campoId.value = String(filme.id);
  elements.campoTitulo.value = filme.titulo;
  elements.campoGenero.value = filme.genero;
  elements.campoDisponivel.value = filme.disponivel ? 'true' : 'false';

  // Atualiza estado visual do formulário
  elements.formHeading.textContent = `Visualizar / Editar Filme (ID: ${filme.id})`;
  elements.formModeBadge.textContent = 'Modo Edição';
  elements.formModeBadge.className = 'mode-badge mode-edicao';
  elements.btnSubmitText.textContent = 'Salvar Alterações';
  elements.btnCancel.style.display = 'inline-flex';

  // Foco no campo título para agilidade
  elements.campoTitulo.focus();

  // Re-renderiza para destacar a linha selecionada
  aplicarFiltroAtual();

  mostrarAlerta(`Filme "${filme.titulo}" carregado no formulário para visualização/edição.`, 'info');
}

/**
 * Cancela o modo de edição e restaura o formulário para cadastro novo.
 */
function cancelarEdicao() {
  filmeEmEdicaoId = null;
  limparErrosValidacao();
  elements.form.reset();
  
  elements.campoId.value = 'Automático (Modo Demonstração)';
  elements.campoDisponivel.value = 'true';
  elements.formHeading.textContent = 'Cadastrar Novo Filme';
  elements.formModeBadge.textContent = 'Novo Cadastro';
  elements.formModeBadge.className = 'mode-badge mode-novo';
  elements.btnSubmitText.textContent = 'Adicionar Filme';
  elements.btnCancel.style.display = 'none';

  aplicarFiltroAtual();
}

/**
 * Valida os campos obrigatórios.
 * @returns {boolean} Retorna true se os campos forem válidos.
 */
function validarFormulario() {
  limparErrosValidacao();
  let valido = true;

  const tituloValor = elements.campoTitulo.value.trim();
  const generoValor = elements.campoGenero.value.trim();

  if (!tituloValor) {
    elements.campoTitulo.classList.add('input-error');
    elements.erroTitulo.textContent = 'Por favor, informe o título do filme.';
    valido = false;
  }

  if (!generoValor) {
    elements.campoGenero.classList.add('input-error');
    elements.erroGenero.textContent = 'Por favor, informe o gênero do filme.';
    valido = false;
  }

  return valido;
}

/**
 * Trata o envio do formulário (Adicionar ou Atualizar na memória local).
 */
function tratarEnvioFormulario(event) {
  event.preventDefault();

  if (!validarFormulario()) {
    mostrarAlerta('Verifique os campos obrigatórios antes de continuar.', 'warning');
    return;
  }

  const titulo = elements.campoTitulo.value.trim();
  const genero = elements.campoGenero.value.trim();
  const disponivel = elements.campoDisponivel.value === 'true';

  if (filmeEmEdicaoId === null) {
    // Ação: Adicionar novo filme
    const proximoId = filmes.length > 0 ? Math.max(...filmes.map(f => f.id)) + 1 : 1;
    const novoFilme = { id: proximoId, titulo, genero, disponivel };
    
    filmes.push(novoFilme);
    mostrarAlerta(`Filme "${novoFilme.titulo}" (ID: ${novoFilme.id}) adicionado com sucesso! (Modo demonstração)`, 'success');
    cancelarEdicao();
  } else {
    // Ação: Atualizar filme existente
    const index = filmes.findIndex(f => f.id === filmeEmEdicaoId);
    if (index !== -1) {
      filmes[index] = { id: filmeEmEdicaoId, titulo, genero, disponivel };
      mostrarAlerta(`Filme "${titulo}" (ID: ${filmeEmEdicaoId}) atualizado com sucesso! (Modo demonstração)`, 'success');
    }
    cancelarEdicao();
  }
}

/**
 * Remove um filme do estado local em memória após confirmação.
 * @param {number} id - ID do filme a excluir.
 */
function excluirFilmeLocal(id) {
  const filme = filmes.find(f => f.id === id);
  if (!filme) return;

  const confirmou = window.confirm(`Deseja realmente remover o filme "${filme.titulo}" (ID: ${filme.id}) da demonstração local?`);
  if (!confirmou) return;

  // Se o filme excluído estiver em edição, cancela o modo edição
  if (filmeEmEdicaoId === id) {
    cancelarEdicao();
  }

  filmes = filmes.filter(f => f.id !== id);
  aplicarFiltroAtual();
  mostrarAlerta(`Filme "${filme.titulo}" removido da demonstração.`, 'danger');
}

// --- Funções de Busca e Filtro ---

/**
 * Filtra a lista pelo texto informado no campo de busca (título ou gênero).
 */
function aplicarFiltroAtual() {
  const termo = elements.buscaInput.value.trim().toLowerCase();
  if (!termo) {
    renderizarTabela(filmes);
    return;
  }

  const filmesFiltrados = filmes.filter(f => 
    f.titulo.toLowerCase().includes(termo) ||
    f.genero.toLowerCase().includes(termo)
  );

  renderizarTabela(filmesFiltrados);
}

// --- Inicialização de Eventos ---

function inicializarEventos() {
  // Envio e cancelamento do formulário
  elements.form.addEventListener('submit', tratarEnvioFormulario);
  elements.btnCancel.addEventListener('click', cancelarEdicao);
  
  // Limpeza rápida dos campos
  elements.btnReset.addEventListener('click', () => {
    cancelarEdicao();
    mostrarAlerta('Formulário limpo.', 'info');
  });

  // Filtro de pesquisa
  elements.buscaInput.addEventListener('input', aplicarFiltroAtual);
  elements.btnLimparBusca.addEventListener('click', () => {
    elements.buscaInput.value = '';
    aplicarFiltroAtual();
    elements.buscaInput.focus();
  });

  // Render inicial
  renderizarTabela();
}

// Inicializa quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', inicializarEventos);
