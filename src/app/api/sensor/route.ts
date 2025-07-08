
'use server';

import {NextResponse} from 'next/server';
import { setLatestReading } from '@/services/sensor-cache-service';

/**
 * @fileoverview API endpoint para receber dados de temperatura de sensores IoT (como ESP32).
 */

/**
 * Lida com requisições POST para receber dados de sensores.
 * O ESP32 deve enviar uma requisição POST para /api/sensor com um corpo JSON
 * contendo o endereço MAC e a temperatura.
 *
 * @param {Request} request A requisição recebida.
 * @returns {Promise<NextResponse>} Uma resposta JSON.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {macAddress, temperature} = data;

    if (!macAddress || typeof temperature === 'undefined') {
      return NextResponse.json(
        {message: 'Dados ausentes: macAddress e temperature são obrigatórios.'},
        {status: 400}
      );
    }

    // Armazena a leitura mais recente no cache do servidor.
    setLatestReading(macAddress, temperature);

    // O log é útil para depuração no servidor (ex: Vercel logs).
    console.log(`Dados recebidos e cacheados do sensor (${macAddress}): Temperatura = ${temperature}°C`);

    return NextResponse.json({message: 'Dados recebidos com sucesso!'});
  } catch (error) {
    console.error('Erro ao processar dados do sensor:', error);
    return NextResponse.json({message: 'Erro interno do servidor'}, {status: 500});
  }
}
