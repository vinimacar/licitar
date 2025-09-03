// Cadastro de Licitação no Firestore

document.getElementById('formLicitacao').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('nomeLicitacao').value;
    const descricao = document.getElementById('descricaoLicitacao').value;
    const data = document.getElementById('dataLicitacao').value;
    try {
        await db.collection('licitacoes').add({
            nome,
            descricao,
            data,
            createdAt: new Date()
        });
        document.getElementById('msgSucesso').classList.remove('d-none');
        this.reset();
    } catch (error) {
        alert('Erro ao cadastrar licitação: ' + error.message);
    }
});
