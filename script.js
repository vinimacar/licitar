// Configuração do Firebase
const firebaseConfig = {
        apiKey: "AIzaSyBUqFdxnLJb4LEpCCRHzbbcwx9ej-8rwck", 
        authDomain: "licitar-90263.firebaseapp.com", 
        projectId: "licitar-90263", 
        storageBucket: "licitar-90263.firebasestorage.app", 
        messagingSenderId: "413393154736", 
        appId: "1:413393154736:web:5a10db37e8f9f3b54fc175" 
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização do Firebase
    const firebaseConfig = { 
        apiKey: "AIzaSyBUqFdxnLJb4LEpCCRHzbbcwx9ej-8rwck", 
        authDomain: "licitar-90263.firebaseapp.com", 
        projectId: "licitar-90263", 
        storageBucket: "licitar-90263.firebasestorage.app", 
        messagingSenderId: "413393154736", 
        appId: "1:413393154736:web:5a10db37e8f9f3b54fc175" 
    };
    
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    // Elementos do DOM
    const addItemBtn = document.getElementById('add-item');
    const itemsContainer = document.getElementById('items-container');
    const itemTemplate = document.getElementById('item-template');
    const exportPdfBtn = document.getElementById('export-pdf');
    const printBtn = document.getElementById('print');
    const salvarFornecedoresBtn = document.getElementById('salvar-fornecedores');
    const salvarLicitacaoBtn = document.getElementById('salvar-licitacao');
    
    // Contadores e totais
    let itemCounter = 1;
    let fornecedores = {
        1: { nome: '', cnpj: '', contato: '' },
        2: { nome: '', cnpj: '', contato: '' },
        3: { nome: '', cnpj: '', contato: '' }
    };
    
    // Verificar se já existem fornecedores salvos
    const fornecedoresSalvos = localStorage.getItem('fornecedores');
    if (fornecedoresSalvos) {
        fornecedores = JSON.parse(fornecedoresSalvos);
        preencherFormularioFornecedores();
    }
    
    // Adicionar primeiro item automaticamente
    addItem();
    
    // Event Listeners
    addItemBtn.addEventListener('click', addItem);
    exportPdfBtn.addEventListener('click', exportToPdf);
    document.getElementById('export-xls').addEventListener('click', exportToXLS);
    printBtn.addEventListener('click', printTable);
    salvarFornecedoresBtn.addEventListener('click', salvarFornecedores);
    document.getElementById('finalizar-licitacao').addEventListener('click', finalizarLicitacao);
    salvarLicitacaoBtn.addEventListener('click', salvarLicitacao);
    
    // Modal
    const modal = document.getElementById('resultado-modal');
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Função para salvar fornecedores
    function salvarFornecedores() {
        for (let i = 1; i <= 3; i++) {
            fornecedores[i] = {
                nome: document.getElementById(`fornecedor${i}-nome`).value,
                cnpj: document.getElementById(`fornecedor${i}-cnpj`).value,
                contato: document.getElementById(`fornecedor${i}-contato`).value
            };
        }
        
        // Salvar no localStorage
        localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
        
        // Atualizar células de fornecedores na tabela
        atualizarCelulasFornecedores();
        
        alert('Fornecedores salvos com sucesso!');
    }
    
    // Função para preencher o formulário com fornecedores salvos
    function preencherFormularioFornecedores() {
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`fornecedor${i}-nome`).value = fornecedores[i].nome;
            document.getElementById(`fornecedor${i}-cnpj`).value = fornecedores[i].cnpj;
            document.getElementById(`fornecedor${i}-contato`).value = fornecedores[i].contato;
        }
    }
    
    // Função para atualizar células de fornecedores na tabela
    function atualizarCelulasFornecedores() {
        const rows = document.querySelectorAll('.item-row');
        rows.forEach(row => {
            for (let i = 1; i <= 3; i++) {
                const cell = row.querySelector(`.fornecedor-cell-${i}`);
                cell.textContent = fornecedores[i].nome;
            }
        });
    }
    
    // Função para adicionar um novo item
    function addItem() {
        const newItem = document.importNode(itemTemplate.content, true);
        const row = newItem.querySelector('.item-row');
        
        // Definir número do item
        row.querySelector('.item-number').textContent = itemCounter++;
        
        // Adicionar event listeners para cálculos
        setupItemListeners(row);
        
        // Adicionar event listener para botão de adicionar marca
        const addMarcaBtn = row.querySelector('.btn-add-marca');
        if (addMarcaBtn) {
            addMarcaBtn.addEventListener('click', () => adicionarMarca(row));
        }
        
        // Adicionar à tabela
        itemsContainer.appendChild(newItem);
    }
    
    // Função para adicionar nova marca
    function adicionarMarca(row) {
        // Cria uma nova linha de marca como sublinha do item
        const itemRow = row;
        const newRow = document.createElement('tr');
        newRow.className = 'marca-row';
        newRow.innerHTML = `
            <td></td>
            <td colspan="4"></td>
            <td><input type="text" class="item-marca" placeholder="Marca"></td>
            <td></td>
            <td><input type="number" class="valor-unit-marca-1" placeholder="Valor Unit. 1" step="0.01" min="0"></td>
            <td></td>
            <td></td>
            <td><input type="number" class="valor-unit-marca-2" placeholder="Valor Unit. 2" step="0.01" min="0"></td>
            <td></td>
            <td></td>
            <td><input type="number" class="valor-unit-marca-3" placeholder="Valor Unit. 3" step="0.01" min="0"></td>
            <td></td>
            <td colspan="6"></td>
            <td><button type="button" class="btn-remove-marca"><i class="fas fa-minus"></i></button></td>
        `;
        // Adiciona a linha logo após as outras marcas do mesmo item
        let next = itemRow.nextSibling;
        while (next && next.classList && next.classList.contains('marca-row')) {
            next = next.nextSibling;
        }
        itemRow.parentNode.insertBefore(newRow, next);

        // Atualiza o rowspan da célula de marca do item
        atualizarRowspanMarca(itemRow);

        // Remover marca
        const removeMarcaBtn = newRow.querySelector('.btn-remove-marca');
        removeMarcaBtn.addEventListener('click', () => {
            newRow.remove();
            atualizarRowspanMarca(itemRow);
            atualizarValoresPrincipaisDoItem(itemRow);
        });

        // Atualizar valores principais ao digitar
        ['valor-unit-marca-1','valor-unit-marca-2','valor-unit-marca-3'].forEach((cls, idx) => {
            newRow.querySelector('.' + cls).addEventListener('input', () => {
                atualizarValoresPrincipaisDoItem(itemRow);
            });
        });
        // Foco automático no campo de nome da marca
        newRow.querySelector('.item-marca').focus();

        // Atualiza os valores principais do item para refletir a última marca informada
        function atualizarValoresPrincipaisDoItem(itemRow) {
            // Busca todas as linhas de marca logo após o item
            let next = itemRow.nextSibling;
            let ultimaMarca = null;
            while (next && next.classList && next.classList.contains('marca-row')) {
                ultimaMarca = next;
                next = next.nextSibling;
            }
            if (ultimaMarca) {
                for (let i = 1; i <= 3; i++) {
                    const valor = ultimaMarca.querySelector('.valor-unit-marca-' + i).value;
                    itemRow.querySelector('.valor-unit-' + i).value = valor;
                }
                // Dispara cálculo
                if (typeof calcularItem === 'function') calcularItem(itemRow);
                if (typeof calcularTotais === 'function') calcularTotais();
            }
        }

        // Função para atualizar o rowspan da célula de marca
        function atualizarRowspanMarca(itemRow) {
            const marcaCell = itemRow.querySelector('.marca-cell');
            if (!marcaCell) return;
            // Conta quantas linhas de marca existem após o item
            let count = 1; // pelo menos 1 (linha principal)
            let next = itemRow.nextSibling;
            while (next && next.classList && next.classList.contains('marca-row')) {
                count++;
                next = next.nextSibling;
            }
            marcaCell.setAttribute('rowspan', count);
        }
    }
    

    
    // Configurar event listeners para um item
    function setupItemListeners(row) {
        // Inputs que afetam cálculos
        const qtdInput = row.querySelector('.item-quantidade');
        const valorUnit1 = row.querySelector('.valor-unit-1');
        const valorUnit2 = row.querySelector('.valor-unit-2');
        const valorUnit3 = row.querySelector('.valor-unit-3');
        
        // Elementos para exibir resultados
        const valorTotal1 = row.querySelector('.valor-total-1');
        const valorTotal2 = row.querySelector('.valor-total-2');
        const valorTotal3 = row.querySelector('.valor-total-3');
        const menorValorUnit = row.querySelector('.menor-valor-unit');
        const menorValorTotal = row.querySelector('.menor-valor-total');
        
        // Botão de excluir
        const deleteBtn = row.querySelector('.btn-delete');
        
        // Event listeners para cálculos
        [qtdInput, valorUnit1, valorUnit2, valorUnit3].forEach(input => {
            input.addEventListener('input', () => {
                calcularItem(row);
                calcularTotais();
            });
        });
        
        // Event listener para excluir item
        deleteBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.item-row').length > 1) {
                row.remove();
                renumerarItens();
                calcularTotais();
            } else {
                alert('É necessário manter pelo menos um item na tabela.');
            }
        });
    }
    
    // Calcular valores para um item específico
    function calcularItem(row) {
        const quantidade = parseFloat(row.querySelector('.item-quantidade').value) || 0;
        
        // Calcular para cada orçamento
        const valores = [];
        let somaValoresUnit = 0;
        let contadorValores = 0;
        
        for (let i = 1; i <= 3; i++) {
            const valorUnit = parseFloat(row.querySelector(`.valor-unit-${i}`).value) || 0;
            const valorTotal = valorUnit * quantidade;
            
            row.querySelector(`.valor-total-${i}`).textContent = formatarMoeda(valorTotal);
            
            if (valorUnit > 0) {
                valores.push({
                    indice: i,
                    valorUnit: valorUnit,
                    valorTotal: valorTotal
                });
                somaValoresUnit += valorUnit;
                contadorValores++;
            }
            
            // Remover classe de fornecedor vencedor
            row.querySelector(`.fornecedor-cell-${i}`).classList.remove('fornecedor-vencedor');
        }
        
        // Calcular valor médio
        if (contadorValores > 0) {
            const valorMedioUnit = somaValoresUnit / contadorValores;
            const valorMedioTotal = valorMedioUnit * quantidade;
            
            row.querySelector('.valor-medio-unit').textContent = formatarMoeda(valorMedioUnit);
            row.querySelector('.valor-medio-total').textContent = formatarMoeda(valorMedioTotal);
        } else {
            row.querySelector('.valor-medio-unit').textContent = 'R$ 0,00';
            row.querySelector('.valor-medio-total').textContent = 'R$ 0,00';
        }
        
        // Encontrar o menor preço
        if (valores.length > 0) {
            valores.sort((a, b) => a.valorUnit - b.valorUnit);
            const menor = valores[0];
            
            row.querySelector('.menor-valor-unit').textContent = formatarMoeda(menor.valorUnit);
            row.querySelector('.menor-valor-total').textContent = formatarMoeda(menor.valorTotal);
            
            // Destacar o menor preço e o fornecedor vencedor
            for (let i = 1; i <= 3; i++) {
                const unitCell = row.querySelector(`.valor-unit-${i}`).parentNode;
                const totalCell = row.querySelector(`.valor-total-${i}`).parentNode;
                
                if (i === menor.indice) {
                    unitCell.classList.add('menor-preco');
                    totalCell.classList.add('menor-preco');
                    // Destacar fornecedor vencedor
                    row.querySelector(`.fornecedor-cell-${i}`).classList.add('fornecedor-vencedor');
                } else {
                    unitCell.classList.remove('menor-preco');
                    totalCell.classList.remove('menor-preco');
                }
            }
        } else {
            row.querySelector('.menor-valor-unit').textContent = 'R$ 0,00';
            row.querySelector('.menor-valor-total').textContent = 'R$ 0,00';
        }
    }
    
    // Calcular totais gerais
    function calcularTotais() {
        const rows = document.querySelectorAll('.item-row');
        let totalOrcamento1 = 0;
        let totalOrcamento2 = 0;
        let totalOrcamento3 = 0;
        let totalFinal = 0;
        
        rows.forEach(row => {
            // Somar totais por orçamento
            for (let i = 1; i <= 3; i++) {
                const valorTexto = row.querySelector(`.valor-total-${i}`).textContent;
                const valor = parseFloat(valorTexto.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
                
                if (i === 1) totalOrcamento1 += valor;
                if (i === 2) totalOrcamento2 += valor;
                if (i === 3) totalOrcamento3 += valor;
            }
            
            // Somar total final (menores preços)
            const menorValorTexto = row.querySelector('.menor-valor-total').textContent;
            const menorValor = parseFloat(menorValorTexto.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
            totalFinal += menorValor;
        });
        
        // Atualizar totais na tabela
        document.getElementById('total-orcamento-1').textContent = formatarMoeda(totalOrcamento1);
        document.getElementById('total-orcamento-2').textContent = formatarMoeda(totalOrcamento2);
        document.getElementById('total-orcamento-3').textContent = formatarMoeda(totalOrcamento3);
        document.getElementById('total-final').textContent = formatarMoeda(totalFinal);
    }
    
    // Renumerar itens após exclusão
    function renumerarItens() {
        const rows = document.querySelectorAll('.item-row');
        rows.forEach((row, index) => {
            row.querySelector('.item-number').textContent = index + 1;
        });
        itemCounter = rows.length + 1;
    }
    
    // Exportar para PDF
    function exportToPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4');
        
        // Título
        doc.setFontSize(16);
        doc.text('Planilha de Licitação', 14, 15);
        
        // Informações dos fornecedores
        doc.setFontSize(12);
        let yPos = 25;
        for (let i = 1; i <= 3; i++) {
            doc.text(`Fornecedor ${i}: ${fornecedores[i].nome} - CNPJ: ${fornecedores[i].cnpj}`, 14, yPos);
            yPos += 7;
        }
        
        // Tabela de itens
        const tableData = [];
        const rows = document.querySelectorAll('.item-row');
        
        // Cabeçalhos
        const headers = [
            'N.', 'Item', 'Descrição', 'Unidade', 'Marca', 'Qtd', 
            'Valor Unit. 1', 'Total 1', 'Valor Unit. 2', 'Total 2', 
            'Valor Unit. 3', 'Total 3', 'Valor Médio', 'Menor Preço'
        ];
        
        // Dados
        rows.forEach(row => {
            // Obter todas as marcas
            const marcaItems = row.querySelectorAll('.marca-item');
            const marcasInfo = Array.from(marcaItems).map(item => {
                return item.querySelector('.item-marca').value;
            }).filter(Boolean).join(', ');
            
            const item = [
                row.querySelector('.item-number').textContent,
                row.querySelector('.item-nome').value,
                row.querySelector('.item-descricao').value,
                row.querySelector('.item-unidade').value,
                marcasInfo,
                row.querySelector('.item-quantidade').value
            ];
            
            // Valores dos fornecedores
            for (let i = 1; i <= 3; i++) {
                const valorUnit = row.querySelector(`.valor-unit-${i}`).value;
                const valorTotal = row.querySelector(`.valor-total-${i}`).textContent;
                item.push(valorUnit, valorTotal);
            }
            
            // Valores médios e menor preço
            item.push(
                row.querySelector('.valor-medio-unit').textContent,
                row.querySelector('.menor-valor-unit').textContent
            );
            
            tableData.push(item);
        });
        
        // Adicionar totais
        const totais = [
            '', 'TOTAL', '', '', '', '',
            '', document.getElementById('total-orcamento-1').textContent,
            '', document.getElementById('total-orcamento-2').textContent,
            '', document.getElementById('total-orcamento-3').textContent,
            document.getElementById('total-medio').textContent,
            document.getElementById('total-final').textContent
        ];
        tableData.push(totais);
        
        // Gerar tabela
        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: yPos + 5,
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                1: { cellWidth: 30 },
                2: { cellWidth: 40 }
            }
        });
        
        // Salvar o PDF
        doc.save('licitacao.pdf');
    }
    
    // Função para exportar para XLS
    function exportToXLS() {
        // Criar uma planilha
        const wb = XLSX.utils.book_new();
        
        // Dados dos fornecedores
        const fornecedoresData = [
            ['Fornecedores'],
            ['Fornecedor', 'Nome', 'CNPJ', 'Contato']
        ];
        
        for (let i = 1; i <= 3; i++) {
            fornecedoresData.push([
                `Fornecedor ${i}`,
                fornecedores[i].nome,
                fornecedores[i].cnpj,
                fornecedores[i].contato
            ]);
        }
        
        // Dados da tabela de licitação
        const licitacaoData = [
            ['Planilha de Licitação'],
            [
                'N.', 'Item', 'Descrição', 'Unidade', 'Marca', 'Qtd', 
                'Valor Unit. 1', 'Total 1', 'Valor Unit. 2', 'Total 2', 
                'Valor Unit. 3', 'Total 3', 'Valor Médio Unit.', 'Valor Médio Total',
                'Menor Preço Unit.', 'Menor Preço Total'
            ]
        ];
        
        const rows = document.querySelectorAll('.item-row');
        rows.forEach(row => {
            // Obter todas as marcas
            const marcaItems = row.querySelectorAll('.marca-item');
            const marcasInfo = Array.from(marcaItems).map(item => {
                return item.querySelector('.item-marca').value;
            }).filter(Boolean).join(', ');
            
            const rowData = [
                 row.querySelector('.item-number').textContent,
                 row.querySelector('.item-nome').value,
                 row.querySelector('.item-descricao').value,
                 row.querySelector('.item-unidade').value,
                 marcasInfo,
                 row.querySelector('.item-quantidade').value
            ];
            
            // Valores dos fornecedores
            for (let i = 1; i <= 3; i++) {
                const valorUnit = row.querySelector(`.valor-unit-${i}`).value;
                const valorTotal = row.querySelector(`.valor-total-${i}`).textContent;
                rowData.push(valorUnit, valorTotal);
            }
            
            // Valores médios e menor preço
            rowData.push(
                row.querySelector('.valor-medio-unit').textContent,
                row.querySelector('.valor-medio-total').textContent,
                row.querySelector('.menor-valor-unit').textContent,
                row.querySelector('.menor-valor-total').textContent
            );
            
            licitacaoData.push(rowData);
        });
        
        // Adicionar totais
        licitacaoData.push([
            '', 'TOTAL', '', '', '', '',
            '', document.getElementById('total-orcamento-1').textContent,
            '', document.getElementById('total-orcamento-2').textContent,
            '', document.getElementById('total-orcamento-3').textContent,
            '', document.getElementById('total-medio').textContent,
            '', document.getElementById('total-final').textContent
        ]);
        
        // Criar planilhas
        const wsFornecedores = XLSX.utils.aoa_to_sheet(fornecedoresData);
        const wsLicitacao = XLSX.utils.aoa_to_sheet(licitacaoData);
        
        // Adicionar planilhas ao workbook
        XLSX.utils.book_append_sheet(wb, wsFornecedores, "Fornecedores");
        XLSX.utils.book_append_sheet(wb, wsLicitacao, "Licitação");
        
        // Salvar arquivo
        XLSX.writeFile(wb, "licitacao.xlsx");
    }
    
    // Imprimir tabela
    function printTable() {
        window.print();
    }
    
    // Função para finalizar a licitação e mostrar o fornecedor vencedor
    function finalizarLicitacao() {
        // Calcular totais por fornecedor
        const totaisPorFornecedor = [0, 0, 0];
        const rows = document.querySelectorAll('.item-row');
        let totalItens = rows.length;
        
        rows.forEach(row => {
            for (let i = 1; i <= 3; i++) {
                const valorTotal = row.querySelector(`.valor-total-${i}`);
                if (valorTotal && valorTotal.textContent) {
                    const valor = parseFloat(valorTotal.textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));
                    if (!isNaN(valor)) {
                        totaisPorFornecedor[i-1] += valor;
                    }
                }
            }
        });
        
        // Encontrar o fornecedor com menor valor total
        let menorValor = Infinity;
        let fornecedorVencedor = 0;
        
        totaisPorFornecedor.forEach((total, index) => {
            if (total > 0 && total < menorValor) {
                menorValor = total;
                fornecedorVencedor = index + 1;
            }
        });
        
        // Exibir resultado no modal
        if (fornecedorVencedor > 0) {
            document.getElementById('vencedor-nome').textContent = fornecedores[fornecedorVencedor].nome;
            document.getElementById('vencedor-cnpj').textContent = 'CNPJ: ' + fornecedores[fornecedorVencedor].cnpj;
            document.getElementById('vencedor-contato').textContent = 'Contato: ' + fornecedores[fornecedorVencedor].contato;
            
            document.getElementById('valor-total-licitacao').textContent = 'R$ ' + formatarMoeda(menorValor);
            document.getElementById('total-itens-licitacao').textContent = totalItens;
            
            // Exibir o modal
            document.getElementById('resultado-modal').style.display = 'block';
        } else {
            alert('Não foi possível determinar um vencedor. Verifique se todos os valores foram preenchidos corretamente.');
        }
    }
    
    // Função para salvar licitação no Firebase
    function salvarLicitacao() {
        // Coletar dados da licitação
        const dadosLicitacao = {
            fornecedores: fornecedores,
            itens: [],
            dataCriacao: new Date(),
            totais: {
                orcamento1: parseFloat(document.getElementById('total-orcamento-1').textContent.replace('R$ ', '').replace('.', '').replace(',', '.')),
                orcamento2: parseFloat(document.getElementById('total-orcamento-2').textContent.replace('R$ ', '').replace('.', '').replace(',', '.')),
                orcamento3: parseFloat(document.getElementById('total-orcamento-3').textContent.replace('R$ ', '').replace('.', '').replace(',', '.')),
                final: parseFloat(document.getElementById('total-final').textContent.replace('R$ ', '').replace('.', '').replace(',', '.'))
            }
        };
        
        // Coletar dados de cada item
        const rows = document.querySelectorAll('.item-row');
        rows.forEach(row => {
            const item = {
                numero: row.querySelector('.item-number').textContent,
                nome: row.querySelector('.item-nome').value,
                descricao: row.querySelector('.item-descricao').value,
                unidade: row.querySelector('.item-unidade').value,
                marca: row.querySelector('.item-marca').value,
                quantidade: parseInt(row.querySelector('.item-quantidade').value),
                orcamentos: []
            };
            
            // Coletar dados de cada orçamento para o item
            for (let i = 1; i <= 3; i++) {
                const valorUnit = parseFloat(row.querySelector(`.valor-unit-${i}`).value) || 0;
                const valorTotal = parseFloat(row.querySelector(`.valor-total-${i}`).textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
                
                item.orcamentos.push({
                    fornecedor: i,
                    valorUnitario: valorUnit,
                    valorTotal: valorTotal
                });
            }
            
            // Adicionar valores médios e menor preço
            item.valorMedioUnitario = parseFloat(row.querySelector('.valor-medio-unit').textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
            item.valorMedioTotal = parseFloat(row.querySelector('.valor-medio-total').textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
            item.menorValorUnitario = parseFloat(row.querySelector('.menor-valor-unit').textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
            item.menorValorTotal = parseFloat(row.querySelector('.menor-valor-total').textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0;
            
            dadosLicitacao.itens.push(item);
        });
        
        // Salvar no Firebase
        db.collection('licitacoes').add(dadosLicitacao)
            .then((docRef) => {
                alert(`Licitação salva com sucesso! ID: ${docRef.id}`);
                // Salvar ID no localStorage para referência futura
                localStorage.setItem('ultimaLicitacaoId', docRef.id);
            })
            .catch((error) => {
                console.error('Erro ao salvar licitação:', error);
                alert('Erro ao salvar licitação. Verifique o console para mais detalhes.');
            });
    }
    
    // Formatar valor como moeda
    function formatarMoeda(valor) {
        return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
});
