
import { NextRequest, NextResponse } from 'next/server';
import { updateSensorDataFromDevice } from '@/services/sensor-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { macAddress, temperature, accessKey } = body;

    if (!macAddress || typeof temperature !== 'number' || !accessKey) {
      return NextResponse.json({ message: 'Endereço MAC, temperatura e chave de acesso são obrigatórios.' }, { status: 400 });
    }

    // Chama a função de serviço para encontrar o sensor pelo MAC e atualizar seus dados
    const updatedSensor = await updateSensorDataFromDevice(accessKey, macAddress, temperature);

    if (!updatedSensor) {
        return NextResponse.json({ message: `Sensor com MAC ${macAddress} não encontrado no espaço de trabalho fornecido. Cadastre o sensor primeiro.` }, { status: 404 });
    }

    return NextResponse.json({ message: 'Dados do sensor recebidos com sucesso', sensorId: updatedSensor.id }, { status: 200 });

  } catch (error) {
    console.error('Erro na API do sensor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido no servidor.';
    return NextResponse.json({ message: 'Erro interno do servidor', error: errorMessage }, { status: 500 });
  }
}

    