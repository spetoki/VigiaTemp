
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, addDoc, Timestamp } from 'firebase/firestore';

/**
 * @fileoverview API endpoint para receber dados de temperatura de sensores IoT (como ESP32) e
 * persistir diretamente no Firestore. Otimizado para o ambiente Vercel.
 */

interface SensorData {
  macAddress: string;
  temperature: number;
  accessKey: string; // A chave de acesso do usuário, enviada pelo dispositivo.
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
 * contendo o endereço MAC, a temperatura e a chave de acesso.
 *
 * @param {Request} request A requisição recebida.
 * @returns {Promise<Response>} Uma resposta JSON com headers de CORS.
 */
export async function POST(request: Request) {
  try {
    const data: SensorData = await request.json();
    const { macAddress, temperature, accessKey } = data;
    
    console.log(`[VigiaTemp API] Requisição recebida: MAC=${macAddress}, Temp=${temperature}, Key=${accessKey}`);

    if (!macAddress || typeof temperature === 'undefined' || !accessKey) {
      console.warn('[VigiaTemp API] Requisição inválida: dados ausentes.');
      return createCorsResponse(
        { message: 'Dados ausentes: macAddress, temperature e accessKey são obrigatórios.' },
        400
      );
    }
    
    if (!db) {
        console.error('[VigiaTemp API] Erro crítico: Firestore não está configurado.');
        return createCorsResponse({ message: 'Erro interno do servidor: banco de dados não configurado.' }, 500);
    }

    // O caminho para a coleção de sensores agora é específico do usuário.
    const collectionPath = `users/${accessKey}/sensors`;
    const sensorsCollection = collection(db, collectionPath);
    
    // Procura na coleção específica do usuário pelo MAC address
    const q = query(sensorsCollection, where("macAddress", "==", macAddress));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`[VigiaTemp API] Nenhum sensor encontrado com o MAC Address: ${macAddress} para a chave ${accessKey}`);
      return createCorsResponse({ message: 'Sensor não encontrado para esta chave de acesso.' }, 404);
    }

    // Pega o primeiro sensor encontrado (MACs devem ser únicos por usuário)
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

    console.log(`[VigiaTemp API] Dados do sensor (${macAddress}) atualizados para o usuário ${accessKey}: Temp = ${temperature}°C`);

    return createCorsResponse({ message: 'Dados recebidos e salvos com sucesso!' }, 200);
  } catch (error) {
    console.error('[VigiaTemp API] Erro ao processar dados do sensor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return createCorsResponse({ message: `Erro interno do servidor: ${errorMessage}` }, 500);
  }
}
