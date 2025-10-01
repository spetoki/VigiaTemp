
// A integração com Firebase foi removida.
// Esta rota de API, que dependia do Firestore para salvar os dados do sensor,
// foi desativada. O aplicativo agora opera em modo de demonstração com dados locais.

import { NextResponse } from 'next/server';

// Helper para criar uma resposta com os headers de CORS corretos
function createCorsResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Lida com requisições OPTIONS para o pre-flight de CORS.
 */
export async function OPTIONS(request: Request) {
  return createCorsResponse({ message: 'OK' }, 200);
}

/**
 * Lida com requisições POST para receber dados de sensores.
 * Como o banco de dados foi removido, esta função agora apenas retorna uma mensagem
 * indicando que a funcionalidade está desativada no modo de demonstração.
 */
export async function POST(request: Request) {
  console.log('[VigiaTemp API] Recebida uma requisição de sensor, mas o banco de dados está desativado (Modo Demo).');
  return createCorsResponse({ message: 'Funcionalidade desativada no modo de demonstração. Nenhum dado foi salvo.' }, 410); // 410 Gone
}
