
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collectionGroup, query, where, getDocs, updateDoc, addDoc, Timestamp, collection } from 'firebase/firestore';

/**
 * @fileoverview API endpoint para receber dados de temperatura de sensores IoT (como ESP32) e
 * persistir diretamente no Firestore.
 */

interface SensorData {
  macAddress: string;
  temperature: number;
}

/**
 * Lida com requisições POST para receber e salvar dados de sensores.
 * O dispositivo IoT (ESP32) envia um POST para /api/sensor com um corpo JSON
 * contendo o endereço MAC e a temperatura.
 * 
 * Esta função agora faz duas coisas:
 * 1. Atualiza o campo `currentTemperature` no documento principal do sensor.
 * 2. Adiciona um novo registro na subcoleção `historicalData` do sensor.
 *
 * @param {Request} request A requisição recebida.
 * @returns {Promise<NextResponse>} Uma resposta JSON.
 */
export async function POST(request: Request) {
  try {
    const data: SensorData = await request.json();
    const { macAddress, temperature } = data;

    if (!macAddress || typeof temperature === 'undefined') {
      return NextResponse.json(
        { message: 'Dados ausentes: macAddress e temperature são obrigatórios.' },
        { status: 400 }
      );
    }
    
    if (!db) {
        console.error('Firestore não está configurado. Não é possível persistir os dados do sensor.');
        return NextResponse.json({ message: 'Erro interno do servidor: banco de dados não configurado.' }, { status: 500 });
    }

    // Procura na coleção 'sensors' de todos os usuários pelo MAC address
    const sensorsCollectionGroup = collectionGroup(db, 'sensors');
    const q = query(sensorsCollectionGroup, where("macAddress", "==", macAddress));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`Nenhum sensor encontrado com o MAC Address: ${macAddress}`);
      return NextResponse.json({ message: 'Sensor não encontrado no sistema.' }, { status: 404 });
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
    console.log(`Dados do sensor (${macAddress}) atualizados para o usuário ${userKey}: Temperatura = ${temperature}°C`);

    return NextResponse.json({ message: 'Dados recebidos e salvos com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar dados do sensor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ message: `Erro interno do servidor: ${errorMessage}` }, { status: 500 });
  }
}
