/**
 * CineLocadora - Script da Interface Integrada à API
 * JavaScript Puro (Sem dependências, frameworks ou dados fictícios)
 * 
 * Comunicação direta com a API REST:
 * - GET    /api/locadoradefilmes
 * - GET    /api/locadoradefilmes/{id}
 * - POST   /api/locadoradefilmes
 * - PUT    /api/locadoradefilmes/{id}
 * - DELETE /api/locadoradefilmes/{id}
 */

'use strict';

// --- Constantes da API ---
const API_URL = '/api/locadoradefilmes';

// --- Estado da Aplicação ---
let filmes = [];
let filmeEmEdicaoId = null; // null = novo cadastro; number = ID do filme em edição
let carregando = false;

// --- Referências aos Elementos do DOM ---
const elements = {
  // Cabeçalho e Status da API
  apiStatusText: document.getElementById('api-status-text'),

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
  tableContainer: document.getElementById('table-container'),
  tbody: document.getElementById('filmes-tbody'),
  totalBadge: document.getElementById('filmes-total'),
  btnRecarregar: document.getElementById('btn-recarregar'),
  buscaInput: document.getElementById('busca-input'),
  btnLimparBusca: document.getElementById('btn-limpar-busca'),
  
  // Estados Visuais (Loading, Erro, Vazio)
  loadingState: document.getElementById('loading-state'),
  loadingText: document.getElementById('loading-text'),
  errorState: document.getElementById('error-state'),
  errorMessage: document.getElementById('error-message'),
  btnTentarNovamente: document.getElementById('btn-tentar-novamente'),
  emptyState: document.getElementById('empty-state'),
  emptyMessage: document.getElementById('empty-message'),
  
  // Container de Alertas
  alertContainer: document.getElementById('alert-container')
};

// --- Funções Auxiliares de Feedback e Notificações ---

/**
 * Exibe alertas temporários com texto puro.
 * @param {string} mensagem - Texto do alerta.
 * @param {'success'|'info'|'warning'|'danger'} tipo - Tipo visual do alerta.
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
  btnClose.textContent = '×';
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

/**
 * Controla os estados de carregamento da interface.
 * @param {boolean} ativo - Indica se o carregamento está em andamento.
 * @param {string} [texto='Consultando catálogo na API...'] - Mensagem informativa.
 */
function setCarregando(ativo, texto = 'Consultando catálogo na API...') {
  carregando = ativo;
  
  if (ativo) {
    elements.loadingText.textContent = texto;
    elements.loadingState.style.display = 'flex';
    elements.btnSubmit.disabled = true;
    elements.btnReset.disabled = true;
    elements.btnCancel.disabled = true;
    if (elements.btnRecarregar) elements.btnRecarregar.disabled = true;
  } else {
    elements.loadingState.style.display = 'none';
    elements.btnSubmit.disabled = false;
    elements.btnReset.disabled = false;
    elements.btnCancel.disabled = false;
    if (elements.btnRecarregar) elements.btnRecarregar.disabled = false;
  }
}

// --- Renderização Segura com textContent ---

/**
 * Renderiza os filmes na tabela inserindo todos os valores com textContent.
 * @param {Array} listaFilmes - Filmes a serem exibidos.
 */
function renderizarTabela(listaFilmes = filmes) {
  elements.tbody.innerHTML = '';
  
  const total = listaFilmes.length;
  elements.totalBadge.textContent = `Total: ${total} ${total === 1 ? 'filme' : 'filmes'}`;

  // Se não houver itens para exibir
  if (total === 0) {
    elements.tableContainer.style.display = 'none';
    elements.emptyState.style.display = 'block';

    if (elements.buscaInput.value.trim() !== '') {
      elements.emptyMessage.textContent = 'Nenhum filme localizado com o termo pesquisado.';
    } else {
      elements.emptyMessage.textContent = 'Nenhum filme cadastrado na locadora.';
    }
    return;
  }

  elements.emptyState.style.display = 'none';
  elements.tableContainer.style.display = 'block';

  listaFilmes.forEach(filme => {
    const tr = document.createElement('tr');
    if (filmeEmEdicaoId === filme.id) {
      tr.classList.add('row-selected');
    }

    // Coluna ID (textContent)
    const tdId = document.createElement('td');
    tdId.className = 'td-id';
    tdId.textContent = String(filme.id);

    // Coluna Título (textContent)
    const tdTitulo = document.createElement('td');
    tdTitulo.className = 'td-titulo';
    tdTitulo.textContent = String(filme.titulo ?? '');

    // Coluna Gênero (textContent)
    const tdGenero = document.createElement('td');
    tdGenero.className = 'td-genero';
    tdGenero.textContent = String(filme.genero ?? '');

    // Coluna Status (textContent)
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
    btnEditar.setAttribute('aria-label', `Visualizar e editar filme ${filme.titulo}`);
    btnEditar.textContent = 'Visualizar / Editar';
    btnEditar.addEventListener('click', () => carregarFilmeParaEdicao(filme.id));

    // Botão Excluir
    const btnExcluir = document.createElement('button');
    btnExcluir.type = 'button';
    btnExcluir.className = 'btn btn-action-delete btn-sm';
    btnExcluir.setAttribute('aria-label', `Excluir filme ${filme.titulo}`);
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => excluirFilme(filme.id));

    divAcoes.appendChild(btnEditar);
    divAcoes.appendChild(btnExcluir);
    tdAcoes.appendChild(divAcoes);

    // Adiciona todas as células à linha
    tr.appendChild(tdId);
    tr.appendChild(tdTitulo);
    tr.appendChild(tdGenero);
    tr.appendChild(tdStatus);
    tr.appendChild(tdAcoes);

    elements.tbody.appendChild(tr);
  });
}

// --- Operações CRUD Integradas com a API ---

/**
 * Operação 1: Listar filmes (GET /api/locadoradefilmes).
 */
async function listarFilmes() {
  setCarregando(true, 'Consultando catálogo na API...');
  elements.errorState.style.display = 'none';

  try {
    const resposta = await fetch(API_URL);
    
    if (!resposta.ok) {
      throw new Error(`Falha ao obter filmes da API (Status HTTP: ${resposta.status}).`);
    }

    const dados = await resposta.json();
    filmes = Array.isArray(dados) ? dados : [];
    aplicarFiltroAtual();
  } catch (erro) {
    console.error('Erro na requisição GET /api/locadoradefilmes:', erro);
    elements.tableContainer.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.errorState.style.display = 'flex';
    elements.errorMessage.textContent = erro.message || 'Não foi possível se comunicar com o backend.';
    mostrarAlerta(erro.message || 'Erro de conexão com a API.', 'danger');
  } finally {
    setCarregando(false);
  }
}

/**
 * Operação 2: Buscar filme por ID para visualização e edição (GET /api/locadoradefilmes/{id}).
 * @param {number} id - Identificador do filme.
 */
async function carregarFilmeParaEdicao(id) {
  limparErrosValidacao();
  setCarregando(true, 'Buscando detalhes do filme na API...');

  try {
    const resposta = await fetch(`${API_URL}/${id}`);
    
    if (!resposta.ok) {
      throw new Error(`Filme ID ${id} não localizado na API (Status HTTP: ${resposta.status}).`);
    }

    const filme = await resposta.json();
    filmeEmEdicaoId = filme.id;

    // Preenche os campos do formulário
    elements.campoId.value = String(filme.id);
    elements.campoTitulo.value = String(filme.titulo ?? '');
    elements.campoGenero.value = String(filme.genero ?? '');
    elements.campoDisponivel.value = filme.disponivel ? 'true' : 'false';

    // Alterna estado visual do formulário para edição
    elements.formHeading.textContent = `Editar Filme (ID: ${filme.id})`;
    elements.formModeBadge.textContent = 'Modo Edição';
    elements.formModeBadge.className = 'mode-badge mode-edicao';
    elements.btnSubmitText.textContent = 'Salvar Alterações';
    elements.btnCancel.style.display = 'inline-flex';

    // Foco para digitação imediata
    elements.campoTitulo.focus();

    // Atualiza tabela para destacar a linha em edição
    aplicarFiltroAtual();

    mostrarAlerta(`Filme "${filme.titulo}" carregado no formulário para edição.`, 'info');
  } catch (erro) {
    console.error(`Erro na requisição GET /api/locadoradefilmes/${id}:`, erro);
    mostrarAlerta(erro.message || 'Não foi possível carregar os dados do filme.', 'danger');
  } finally {
    setCarregando(false);
  }
}

/**
 * Operação 3 & 4: Criar ou Atualizar filme (POST /api/locadoradefilmes ou PUT /api/locadoradefilmes/{id}).
 */
async function tratarEnvioFormulario(event) {
  event.preventDefault();

  if (!validarFormulario()) {
    mostrarAlerta('Preencha os campos obrigatórios antes de salvar.', 'warning');
    return;
  }

  const titulo = elements.campoTitulo.value.trim();
  const genero = elements.campoGenero.value.trim();
  const disponivel = elements.campoDisponivel.value === 'true';

  const payload = {
    titulo: titulo,
    genero: genero,
    disponivel: disponivel
  };

  if (filmeEmEdicaoId === null) {
    // --- CRIAR NOVO FILME (POST) ---
    setCarregando(true, 'Cadastrando filme na API...');

    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao cadastrar filme na API (Status HTTP: ${resposta.status}).`);
      }

      const filmeCriado = await resposta.json().catch(() => null);
      const nomeFilme = filmeCriado?.titulo || titulo;

      mostrarAlerta(`Filme "${nomeFilme}" cadastrado com sucesso!`, 'success');
      cancelarEdicao();

      // Recarrega os dados da API após gravação
      await listarFilmes();
    } catch (erro) {
      console.error('Erro na requisição POST /api/locadoradefilmes:', erro);
      mostrarAlerta(erro.message || 'Erro ao cadastrar filme.', 'danger');
    } finally {
      setCarregando(false);
    }
  } else {
    // --- ATUALIZAR FILME EXISTENTE (PUT) ---
    const idAtualizar = filmeEmEdicaoId;
    setCarregando(true, `Atualizando filme ID ${idAtualizar} na API...`);

    try {
      const resposta = await fetch(`${API_URL}/${idAtualizar}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao atualizar filme ID ${idAtualizar} na API (Status HTTP: ${resposta.status}).`);
      }

      mostrarAlerta(`Filme "${titulo}" (ID: ${idAtualizar}) atualizado com sucesso!`, 'success');
      cancelarEdicao();

      // Recarrega os dados da API após gravação
      await listarFilmes();
    } catch (erro) {
      console.error(`Erro na requisição PUT /api/locadoradefilmes/${idAtualizar}:`, erro);
      mostrarAlerta(erro.message || 'Erro ao atualizar filme.', 'danger');
    } finally {
      setCarregando(false);
    }
  }
}

/**
 * Operação 5: Excluir filme (DELETE /api/locadoradefilmes/{id}).
 * @param {number} id - Identificador do filme a remover.
 */
async function excluirFilme(id) {
  const filme = filmes.find(f => f.id === id);
  const titulo = filme ? filme.titulo : `ID ${id}`;

  const confirmou = window.confirm(`Deseja realmente excluir o filme "${titulo}" da locadora?`);
  if (!confirmou) return;

  setCarregando(true, `Excluindo filme ID ${id} na API...`);

  try {
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!resposta.ok) {
      throw new Error(`Falha ao excluir filme ID ${id} na API (Status HTTP: ${resposta.status}).`);
    }

    mostrarAlerta(`Filme "${titulo}" excluído com sucesso!`, 'danger');

    // Se o filme excluído estava aberto em edição, cancela o formulário
    if (filmeEmEdicaoId === id) {
      cancelarEdicao();
    }

    // Recarrega os dados da API após gravação
    await listarFilmes();
  } catch (erro) {
    console.error(`Erro na requisição DELETE /api/locadoradefilmes/${id}:`, erro);
    mostrarAlerta(erro.message || 'Erro ao excluir filme.', 'danger');
  } finally {
    setCarregando(false);
  }
}

// --- Validação e Controle do Formulário ---

/**
 * Limpa erros de validação dos campos.
 */
function limparErrosValidacao() {
  elements.campoTitulo.classList.remove('input-error');
  elements.campoGenero.classList.remove('input-error');
  elements.erroTitulo.textContent = '';
  elements.erroGenero.textContent = '';
}

/**
 * Valida o preenchimento dos campos obrigatórios.
 * @returns {boolean} True se válido.
 */
function validarFormulario() {
  limparErrosValidacao();
  let valido = true;

  const titulo = elements.campoTitulo.value.trim();
  const genero = elements.campoGenero.value.trim();

  if (!titulo) {
    elements.campoTitulo.classList.add('input-error');
    elements.erroTitulo.textContent = 'Informe o título do filme.';
    valido = false;
  }

  if (!genero) {
    elements.campoGenero.classList.add('input-error');
    elements.erroGenero.textContent = 'Informe o gênero do filme.';
    valido = false;
  }

  return valido;
}

/**
 * Cancela a edição e restaura o formulário para cadastro novo.
 */
function cancelarEdicao() {
  filmeEmEdicaoId = null;
  limparErrosValidacao();
  elements.form.reset();
  
  elements.campoId.value = '(Gerado automaticamente pela API)';
  elements.campoDisponivel.value = 'true';
  elements.formHeading.textContent = 'Cadastrar Novo Filme';
  elements.formModeBadge.textContent = 'Novo Cadastro';
  elements.formModeBadge.className = 'mode-badge mode-novo';
  elements.btnSubmitText.textContent = 'Cadastrar Filme';
  elements.btnCancel.style.display = 'none';

  aplicarFiltroAtual();
}

// --- Filtro Local de Busca ---

/**
 * Filtra a lista já carregada da API por título ou gênero.
 */
function aplicarFiltroAtual() {
  const termo = elements.buscaInput.value.trim().toLowerCase();
  
  if (!termo) {
    renderizarTabela(filmes);
    return;
  }

  const filtrados = filmes.filter(f => 
    (f.titulo && f.titulo.toLowerCase().includes(termo)) ||
    (f.genero && f.genero.toLowerCase().includes(termo))
  );

  renderizarTabela(filtrados);
}

// --- Inicialização de Eventos e Carga Inicial ---

function inicializarEventos() {
  // Envio e cancelamento do formulário
  elements.form.addEventListener('submit', tratarEnvioFormulario);
  elements.btnCancel.addEventListener('click', cancelarEdicao);
  
  // Limpeza dos campos
  elements.btnReset.addEventListener('click', () => {
    cancelarEdicao();
    mostrarAlerta('Formulário limpo.', 'info');
  });

  // Botões de recarga e repetição
  if (elements.btnRecarregar) {
    elements.btnRecarregar.addEventListener('click', () => listarFilmes());
  }

  if (elements.btnTentarNovamente) {
    elements.btnTentarNovamente.addEventListener('click', () => listarFilmes());
  }

  // Filtro de busca
  elements.buscaInput.addEventListener('input', aplicarFiltroAtual);
  elements.btnLimparBusca.addEventListener('click', () => {
    elements.buscaInput.value = '';
    aplicarFiltroAtual();
    elements.buscaInput.focus();
  });

  // Primeira carga dos dados reais vindos da API
  listarFilmes();
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarEventos);
