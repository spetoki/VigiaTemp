

import { NextResponse } from 'next/server';
import { getDb } from '@/services/db';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, Timestamp, collectionGroup } from 'firebase/firestore';

// Habilita o CORS para a API, permitindo que dispositivos externos enviem dados.
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { macAddress, temperature } = body;

    // Validação dos dados recebidos
    if (!macAddress || typeof temperature !== 'number') {
      return NextResponse.json({ message: 'Dados inválidos. É necessário "macAddress" e "temperature".' }, { status: 400 });
    }

    const db = getDb();

    // 1. Encontrar o sensor correspondente em todas as coleções de usuários
    // Usamos collectionGroup para buscar na subcoleção "sensors" de todos os documentos "users".
    const sensorsQuery = query(collectionGroup(db, 'sensors'), where('macAddress', '==', macAddress));
    const querySnapshot = await getDocs(sensorsQuery);

    if (querySnapshot.empty) {
      console.warn(`[VigiaTemp API] Sensor com MAC ${macAddress} não foi encontrado em nenhum usuário.`);
      return NextResponse.json({ message: `Sensor com MAC ${macAddress} não encontrado.` }, { status: 404 });
    }

    // Pega a primeira correspondência (MAC address deve ser único em todo o sistema)
    const sensorDoc = querySnapshot.docs[0];
    const sensorRef = sensorDoc.ref;
    
    // 2. Atualizar a temperatura atual no documento do sensor encontrado
    await updateDoc(sensorRef, {
      currentTemperature: temperature
    });

    // 3. Adicionar um novo ponto de dado na subcoleção de histórico do sensor
    const historicalDataRef = collection(sensorRef, 'historicalData');
    await addDoc(historicalDataRef, {
      timestamp: Timestamp.now(), // Usa o timestamp do servidor para consistência
      temperature: temperature
    });
    
    console.log(`[VigiaTemp API] Dados recebidos para MAC ${macAddress}. Temp: ${temperature}. Dados atualizados com sucesso.`);

    // Retorna uma resposta de sucesso com CORS habilitado
    return NextResponse.json({ message: 'Dados recebidos com sucesso!' }, { 
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' } 
    });

  } catch (error) {
    console.error('[VigiaTemp API] Erro ao processar requisição:', error);
    let errorMessage = 'Ocorreu um erro no servidor.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Erro interno do servidor', error: errorMessage }, { status: 500 });
  }
}
