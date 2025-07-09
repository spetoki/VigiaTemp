
'use server';

import { NextResponse } from 'next/server';
import { getLatestReading } from '@/services/sensor-cache-service';

/**
 * @fileoverview API endpoint para buscar a última leitura de um sensor específico.
 */

/**
 * Lida com requisições GET para buscar a leitura de um sensor pelo seu MAC address.
 *
 * @param {Request} request A requisição recebida.
 * @param {object} context O contexto da rota, contendo os parâmetros dinâmicos.
 * @param {string} context.params.mac O MAC address do sensor, extraído da URL.
 * @returns {Promise<NextResponse>} Uma resposta JSON com os dados do sensor ou um erro 404.
 */
export async function GET(
  request: Request,
  { params }: { params: { mac: string } }
) {
  const { mac } = params;

  if (!mac) {
    return NextResponse.json({ message: 'MAC address não fornecido.' }, { status: 400 });
  }

  const reading = getLatestReading(mac);

  if (reading) {
    return NextResponse.json(reading);
  } else {
    // Retorna 404 mas com um JSON para ser mais informativo.
    // É normal não ter dados no início, então não é um erro de servidor.
    return NextResponse.json(
        { temperature: null, timestamp: null, message: 'Nenhuma leitura encontrada para este MAC address.' },
        { status: 404 }
    );
  }
}
