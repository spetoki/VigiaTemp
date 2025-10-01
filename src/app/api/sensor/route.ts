
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, Timestamp, collectionGroup } from 'firebase/firestore';

// Habilita o CORS para a API
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

    // Validação básica dos dados recebidos
    if (!macAddress || typeof temperature !== 'number') {
      return NextResponse.json({ message: 'Dados inválidos. É necessário "macAddress" e "temperature".' }, { status: 400 });
    }

    const db = getDb();

    // 1. Encontrar o sensor correspondente em todas as coleções de usuários
    const sensorsQuery = query(collectionGroup(db, 'sensors'), where('macAddress', '==', macAddress));
    const querySnapshot = await getDocs(sensorsQuery);

    if (querySnapshot.empty) {
      console.warn(`[VigiaTemp API] Sensor com MAC ${macAddress} não encontrado no banco de dados.`);
      return NextResponse.json({ message: `Sensor com MAC ${macAddress} não encontrado.` }, { status: 404 });
    }

    // Pega a primeira correspondência (MAC address deve ser único)
    const sensorDoc = querySnapshot.docs[0];
    const sensorRef = sensorDoc.ref;
    
    // 2. Atualizar a temperatura atual no documento do sensor
    await updateDoc(sensorRef, {
      currentTemperature: temperature
    });

    // 3. Adicionar um novo ponto de dado na subcoleção de histórico
    const historicalDataRef = collection(sensorRef, 'historicalData');
    await addDoc(historicalDataRef, {
      timestamp: Timestamp.now(), // Usa o timestamp do servidor para consistência
      temperature: temperature
    });
    
    console.log(`[VigiaTemp API] Dados recebidos para MAC ${macAddress}. Temp: ${temperature}°C. Dados atualizados com sucesso.`);

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
