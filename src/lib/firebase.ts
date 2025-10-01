
// A integração com o Firebase foi removida conforme solicitado.
// Este arquivo foi intencionalmente esvaziado para cortar a conexão com o Firestore.
// O aplicativo agora operará em um modo de demonstração com dados locais.

// Exportar funções vazias ou nulas para evitar que o resto do aplicativo quebre.
export const getDb = () => {
    // Retorna null ou lança um erro para indicar que o DB não está disponível.
    // Lançar um erro é mais seguro para garantir que nenhuma parte do código tente usá-lo.
    throw new Error("Firebase Firestore não está configurado. O aplicativo está em modo de demonstração.");
};

export const app = null;
