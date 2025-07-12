import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: Request) {
  try {
    // Destructurar mensajes y parámetros del modelo desde el cuerpo de la solicitud
    const { messages, temperature, maxLength } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Formato de mensajes inválido' }, { status: 400 });
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

    if (!deepseekApiKey) {
      console.error('DEEPSEEK_API_KEY no está configurada en las variables de entorno.');
      return NextResponse.json({ error: 'Error de configuración del servidor: falta la clave de API de DeepSeek.' }, { status: 500 });
    }

    const apiResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: temperature || 0.7, // Usar temperatura proporcionada o un valor por defecto
        max_tokens: maxLength || 500,   // Usar longitud proporcionada o un valor por defecto
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.json();
      console.error('Error de la API de DeepSeek:', errorBody);
      return NextResponse.json({ error: errorBody.error?.message || 'No se pudo obtener respuesta de la IA' }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
        return NextResponse.json({ error: 'Estructura de respuesta inválida de la IA' }, { status: 500 });
    }

    return NextResponse.json({ message: assistantMessage });

  } catch (error: any) {
    console.error('Error procesando la solicitud de chat:', error);
    return NextResponse.json({ error: `Ocurrió un error interno en el servidor: ${error.message || 'Error desconocido'}` }, { status: 500 });
  }
}