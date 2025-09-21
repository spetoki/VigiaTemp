
'use server';

import { db } from '@/lib/firebase';
import { collectionGroup, query, where, getDocs, updateDoc, addDoc, Timestamp, collection } from 'firebase/firestore';

/**
 * @fileoverview API endpoint para receber dados de temperatura de sensores IoT (como ESP32) e
 * persistir diretamente no Firestore. Otimizado para o ambiente Vercel.
 */

interface SensorData {
  macAddress: string;
  temperature: number;
}

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
 * Lida com requisições POST para receber e salvar dados de sensores.
 * O dispositivo IoT (ESP32) envia um POST para /api/sensor com um corpo JSON
 * contendo o endereço MAC e a temperatura.
 *
 * @param {Request} request A requisição recebida.
 * @returns {Promise<Response>} Uma resposta JSON com headers de CORS.
 */
export async function POST(request: Request) {
  try {
    const data: SensorData = await request.json();
    const { macAddress, temperature } = data;
    
    console.log(`[VigiaTemp API] Recebida requisição: MAC=${macAddress}, Temp=${temperature}`);

    if (!macAddress || typeof temperature === 'undefined') {
      console.warn('[VigiaTemp API] Requisição inválida: dados ausentes.');
      return createCorsResponse(
        { message: 'Dados ausentes: macAddress e temperature são obrigatórios.' },
        400
      );
    }
    
    if (!db) {
        console.error('[VigiaTemp API] Erro crítico: Firestore não está configurado.');
        return createCorsResponse({ message: 'Erro interno do servidor: banco de dados não configurado.' }, 500);
    }

    // Procura na coleção 'sensors' de todos os usuários pelo MAC address
    const sensorsCollectionGroup = collectionGroup(db, 'sensors');
    const q = query(sensorsCollectionGroup, where("macAddress", "==", macAddress));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`[VigiaTemp API] Nenhum sensor encontrado com o MAC Address: ${macAddress}`);
      return createCorsResponse({ message: 'Sensor não encontrado no sistema.' }, 404);
    }

    // Pega o primeiro sensor encontrado (MACs devem ser únicos)
    const sensorDoc = querySnapshot.docs[0];
    
    // 1. Atualizar a temperatura atual no documento principal do sensor
    await updateDoc(sensorDoc.ref, {
      currentTemperature: temperature
    });

    // 2. Adicionar à subcoleção de dados históricos
    const historyCollection = collection(sensorDoc.ref, 'historicalData');
    await addDoc(historyCollection, {
        temperature: temperature,
        timestamp: Timestamp.now()
    });

    // O path do documento do sensor é algo como 'users/USER_KEY/sensors/SENSOR_ID'
    const userKey = sensorDoc.ref.parent.parent?.id; 
    console.log(`[VigiaTemp API] Dados do sensor (${macAddress}) atualizados para o usuário ${userKey}: Temp = ${temperature}°C`);

    return createCorsResponse({ message: 'Dados recebidos e salvos com sucesso!' }, 200);
  } catch (error) {
    console.error('[VigiaTemp API] Erro ao processar dados do sensor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return createCorsResponse({ message: `Erro interno do servidor: ${errorMessage}` }, 500);
  }
}
