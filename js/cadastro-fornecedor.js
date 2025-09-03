// Cadastro de Fornecedor no Firestore

document.getElementById('formFornecedor').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.getElementById('nomeFornecedor').value;
    const cnpj = document.getElementById('cnpjFornecedor').value;
    const email = document.getElementById('emailFornecedor').value;
    const telefone = document.getElementById('telefoneFornecedor').value;
    try {
        await db.collection('fornecedores').add({
            nome,
            cnpj,
            email,
            telefone,
            createdAt: new Date()
        });
        document.getElementById('msgSucesso').classList.remove('d-none');
        this.reset();
    } catch (error) {
        alert('Erro ao cadastrar fornecedor: ' + error.message);
    }
});
