

// Renderiza o cabeçalho dos fornecedores
function renderCabecalhoFornecedores() {
    const head = document.getElementById('cabecalho-fornecedores');
    if (!head) return;
    head.innerHTML = `
        <th colspan="5"></th>
        <th>Marca</th><th>Valor Unit.</th><th colspan="2">${fornecedores[0] || 'Fornecedor 1'}</th>
        <th>Marca</th><th>Valor Unit.</th><th colspan="2">${fornecedores[1] || 'Fornecedor 2'}</th>
        <th>Marca</th><th>Valor Unit.</th><th colspan="2">${fornecedores[2] || 'Fornecedor 3'}</th>
        <th></th>
    `;
}
// Script para gerenciamento da tabela de licitação
let itens = [];
let fornecedores = [];

// Buscar os três primeiros fornecedores cadastrados
async function carregarFornecedores() {
    const snap = await db.collection('fornecedores').orderBy('createdAt').limit(3).get();
    fornecedores = snap.docs.map(doc => doc.data().nome);
}

carregarFornecedores();

function renderTabela() {
    renderCabecalhoFornecedores();
    const corpo = document.getElementById('corpoTabelaItens');
    corpo.innerHTML = '';
    itens.forEach((item, idx) => {
        // Calcula valor total de cada marca
        const qtde = parseFloat(item.qtde) || 0;
        const v1 = parseFloat(item.marca1.valor) || 0;
        const v2 = parseFloat(item.marca2.valor) || 0;
        const v3 = parseFloat(item.marca3.valor) || 0;
        const total1 = (qtde * v1).toFixed(2);
        const total2 = (qtde * v2).toFixed(2);
        const total3 = (qtde * v3).toFixed(2);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>${item.nome}</td>
            <td>${item.descricao}</td>
            <td>${item.unidade}</td>
            <td>${item.qtde}</td>
            <td><input type="text" class="form-control" value="${item.marca1.nome || ''}" onchange="atualizaMarca(${idx},1,'nome',this.value)"></td>
            <td><input type="number" class="form-control" value="${item.marca1.valor !== undefined ? item.marca1.valor : ''}" step="0.01" min="0" inputmode="decimal" autocomplete="off" oninput="atualizaValorUnitario(${idx},1,this.value)"></td>
            <td class="bg-light" colspan="2">R$ ${total1}</td>
            <td><input type="text" class="form-control" value="${item.marca2.nome || ''}" onchange="atualizaMarca(${idx},2,'nome',this.value)"></td>
            <td><input type="number" class="form-control" value="${item.marca2.valor !== undefined ? item.marca2.valor : ''}" step="0.01" min="0" inputmode="decimal" autocomplete="off" oninput="atualizaValorUnitario(${idx},2,this.value)"></td>
            <td class="bg-light" colspan="2">R$ ${total2}</td>
            <td><input type="text" class="form-control" value="${item.marca3.nome || ''}" onchange="atualizaMarca(${idx},3,'nome',this.value)"></td>
            <td><input type="number" class="form-control" value="${item.marca3.valor !== undefined ? item.marca3.valor : ''}" step="0.01" min="0" inputmode="decimal" autocomplete="off" oninput="atualizaValorUnitario(${idx},3,this.value)"></td>
        `;
        // Função para formatar valor como moeda brasileira
        function formatarMoeda(valor) {
            if (valor === undefined || valor === null || valor === "") return "";
            let num = typeof valor === 'string' ? valor.replace(/\D/g, "") : valor;
            num = (parseFloat(num) / 100).toFixed(2);
            return num === 'NaN' ? '' : 'R$ ' + num.replace('.', ',');
        }
        // fim do forEach
        // Adiciona as colunas finais
        row.innerHTML += `
            <td class="bg-light" colspan="2">R$ ${total3}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeItem(${idx})">Remover</button></td>
        `;
        corpo.appendChild(row);
    });
}

// Função de máscara de moeda para input
window.mascaraMoeda = function(input, idx, marca) {
    let v = input.value.replace(/\D/g, "");
    if (v.length < 3) v = v.padStart(3, '0');
    let valor = (parseFloat(v) / 100).toFixed(2);
    input.value = 'R$ ' + valor.replace('.', ',');
    // Atualiza valor numérico no array
    const key = 'marca'+marca;
    itens[idx][key]['valor'] = valor;
    renderTabela();
};

// Atualiza valor unitário e recalcula totais em tempo real
window.atualizaValorUnitario = function(idx, marca, valor) {
    const key = 'marca'+marca;
    itens[idx][key]['valor'] = valor;
    renderTabela();
};

document.getElementById('formLicitacaoItens').addEventListener('submit', async function(e) {
    e.preventDefault();
    // Garante que fornecedores estejam carregados
    if (fornecedores.length < 3) {
        await carregarFornecedores();
        if (fornecedores.length < 3) {
            alert('Cadastre pelo menos 3 fornecedores antes de adicionar itens!');
            return;
        }
    }
    const nome = document.getElementById('itemNome').value;
    const descricao = document.getElementById('itemDescricao').value;
    const unidade = document.getElementById('itemUnidade').value;
    const qtde = document.getElementById('itemQtde').value;
    itens.push({
        nome, descricao, unidade, qtde,
        marca1: {nome:'', valor:'', fornecedor: fornecedores[0]},
        marca2: {nome:'', valor:'', fornecedor: fornecedores[1]},
        marca3: {nome:'', valor:'', fornecedor: fornecedores[2]}
    });
    this.reset();
    renderTabela();
});

window.atualizaMarca = function(idx, marca, campo, valor) {
    const key = 'marca'+marca;
    itens[idx][key][campo] = valor;
};

window.removeItem = function(idx) {
    itens.splice(idx,1);
    renderTabela();
};

document.getElementById('btnSalvarLicitacao').addEventListener('click', async function() {
    if(itens.length === 0) {
        alert('Adicione ao menos um item!');
        return;
    }
    try {
        await db.collection('licitacao_itens').add({
            itens,
            createdAt: new Date()
        });
        document.getElementById('msgSucesso').classList.remove('d-none');
        itens = [];
        renderTabela();
    } catch (error) {
        alert('Erro ao salvar licitação: ' + error.message);
    }
});

// Inicializa tabela vazia ao carregar
renderTabela();
