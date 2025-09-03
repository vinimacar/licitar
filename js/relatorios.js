// Relatórios de Licitação - licitaPro
let licitacoes = [];
let itensLicitacao = [];

const selectLicitacao = document.getElementById('selectLicitacao');
const relatorioConteudo = document.getElementById('relatorioConteudo');

// Carrega licitações cadastradas
async function carregarLicitacoes() {
    const snap = await db.collection('licitacoes').orderBy('createdAt','desc').get();
    licitacoes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    selectLicitacao.innerHTML = '<option value="">Selecione...</option>' + licitacoes.map(l => `<option value="${l.id}">${l.nome}</option>`).join('');
}

// Carrega itens da licitação selecionada
selectLicitacao.addEventListener('change', async function() {
    relatorioConteudo.innerHTML = '';
    if(!this.value) return;
    const snap = await db.collection('licitacao_itens').where('licitacaoId','==',this.value).get();
    if(snap.empty) {
        relatorioConteudo.innerHTML = '<div class="alert alert-warning">Nenhum item cadastrado para esta licitação.</div>';
        return;
    }
    itensLicitacao = snap.docs[0].data().itens;
    gerarRelatorio();
});

function gerarRelatorio() {
    let html = `<table class='table table-bordered'><thead><tr><th>Nº</th><th>Item</th><th>Descrição</th><th>Unidade</th><th>Qtde</th><th>Marca Vencedora</th><th>Fornecedor</th><th>Valor Unitário</th><th>Valor Total</th></tr></thead><tbody>`;
    let totalPorFornecedor = {};
    let totalGeral = 0;
    itensLicitacao.forEach(item => {
        // Encontra a marca de menor valor
        let marcas = [item.marca1, item.marca2, item.marca3];
        let vencedora = marcas.reduce((min, m) => (parseFloat(m.valor)||Infinity) < (parseFloat(min.valor)||Infinity) ? m : min, marcas[0]);
        let valorTotal = (parseFloat(vencedora.valor)||0) * (parseFloat(item.qtde)||0);
        html += `<tr><td>${item.numero}</td><td>${item.nome}</td><td>${item.descricao}</td><td>${item.unidade}</td><td>${item.qtde}</td><td>${vencedora.nome}</td><td>${vencedora.fornecedor}</td><td>R$ ${parseFloat(vencedora.valor).toFixed(2)}</td><td>R$ ${valorTotal.toFixed(2)}</td></tr>`;
        if(vencedora.fornecedor) {
            if(!totalPorFornecedor[vencedora.fornecedor]) totalPorFornecedor[vencedora.fornecedor] = 0;
            totalPorFornecedor[vencedora.fornecedor] += valorTotal;
        }
        totalGeral += valorTotal;
    });
    html += `</tbody></table>`;
    html += `<h5 class='mt-4'>Totais por Fornecedor</h5><ul>`;
    Object.entries(totalPorFornecedor).forEach(([forn, total]) => {
        html += `<li><b>${forn}:</b> R$ ${total.toFixed(2)}</li>`;
    });
    html += `</ul><h5>Total Geral: R$ ${totalGeral.toFixed(2)}</h5>`;
    relatorioConteudo.innerHTML = html;
}

// Exportação PDF
window.jsPDF = window.jspdf.jsPDF;
document.getElementById('btnExportarPDF').addEventListener('click', function() {
    if(!itensLicitacao.length) return;
    const doc = new jsPDF();
    doc.text('Relatório de Licitação', 10, 10);
    let y = 20;
    itensLicitacao.forEach(item => {
        let marcas = [item.marca1, item.marca2, item.marca3];
        let vencedora = marcas.reduce((min, m) => (parseFloat(m.valor)||Infinity) < (parseFloat(min.valor)||Infinity) ? m : min, marcas[0]);
        doc.text(`${item.numero} - ${item.nome} (${item.qtde} ${item.unidade})`, 10, y);
        doc.text(`Vencedor: ${vencedora.fornecedor} (${vencedora.nome}) - R$ ${parseFloat(vencedora.valor).toFixed(2)}`, 10, y+6);
        y += 14;
        if(y > 270) { doc.addPage(); y = 20; }
    });
    doc.save('relatorio_licitacao.pdf');
});

// Exportação XLS
function tableToSheet() {
    const ws = XLSX.utils.json_to_sheet(itensLicitacao.map(item => {
        let marcas = [item.marca1, item.marca2, item.marca3];
        let vencedora = marcas.reduce((min, m) => (parseFloat(m.valor)||Infinity) < (parseFloat(min.valor)||Infinity) ? m : min, marcas[0]);
        return {
            Numero: item.numero,
            Item: item.nome,
            Descricao: item.descricao,
            Unidade: item.unidade,
            Qtde: item.qtde,
            MarcaVencedora: vencedora.nome,
            Fornecedor: vencedora.fornecedor,
            ValorUnitario: vencedora.valor,
            ValorTotal: (parseFloat(vencedora.valor)||0) * (parseFloat(item.qtde)||0)
        };
    }));
    return ws;
}
document.getElementById('btnExportarXLS').addEventListener('click', function() {
    if(!itensLicitacao.length) return;
    const wb = XLSX.utils.book_new();
    const ws = tableToSheet();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    XLSX.writeFile(wb, 'relatorio_licitacao.xlsx');
});

// Inicialização
carregarLicitacoes();
