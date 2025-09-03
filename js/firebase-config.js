// Configuração do Firebase para licitaPro
const firebaseConfig = {
    apiKey: "AIzaSyBUqFdxnLJb4LEpCCRHzbbcwx9ej-8rwck",
    authDomain: "licitar-90263.firebaseapp.com",
    projectId: "licitar-90263",
    storageBucket: "licitar-90263.firebasestorage.app",
    messagingSenderId: "413393154736",
    appId: "1:413393154736:web:5a10db37e8f9f3b54fc175"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
