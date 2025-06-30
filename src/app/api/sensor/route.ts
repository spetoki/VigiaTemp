'use server';

import {NextResponse} from 'next/server';

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

    // Em um aplicativo real, você salvaria esses dados em um banco de dados (como Firebase Firestore).
    // Para este protótipo, vamos apenas registrar os dados no console do servidor para que você possa ver que está funcionando.
    console.log(`Dados recebidos do sensor (${macAddress}): Temperatura = ${temperature}°C`);

    // Aqui, você buscaria o sensor no banco de dados pelo macAddress e atualizaria sua temperatura.
    // Como estamos usando localStorage no lado do cliente, não podemos atualizá-lo diretamente daqui.
    // A comunicação do ESP32 com o servidor está funcionando, que é o passo mais importante.

    return NextResponse.json({message: 'Dados recebidos com sucesso!'});
  } catch (error) {
    console.error('Erro ao processar dados do sensor:', error);
    return NextResponse.json({message: 'Erro interno do servidor'}, {status: 500});
  }
}
