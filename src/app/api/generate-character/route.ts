import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

async function callApi(apiKey: string, prompt: string) {
  const system_prompt = `Eres un asistente creativo para un juego de rol. Basado en la idea del usuario, genera un personaje. Proporciona un nombre apropiado y una descripción detallada (aproximadamente 50-100 palabras). Tu respuesta DEBE ser un objeto JSON válido con dos claves: "name" y "description". No incluyas nada más en tu respuesta, ni siquiera los marcadores de bloque de código JSON.

Ejemplo de idea del usuario: "un enano guerrero gruñón que ama el oro"
Tu respuesta JSON:
{
  "name": "Borin Martillo de Hierro",
  "description": "Borin es un enano de barba canosa y rostro curtido por mil batallas. Su armadura está abollada y su hacha siempre lista. Aunque su ceño es perpetuo y su humor agrio, sus ojos brillan con una codicia inconfundible ante la visión del oro. Es leal a sus compañeros, siempre y cuando la recompensa sea buena."
}`;

  const apiResponse = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: "json_object" }
    }),
  });

  if (!apiResponse.ok) {
    const errorBody = await apiResponse.json();
    console.error('Error de la API de DeepSeek:', errorBody);
    throw new Error(errorBody.error?.message || 'No se pudo obtener respuesta de DeepSeek');
  }

  const data = await apiResponse.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Estructura de respuesta inválida de la IA de DeepSeek');
  }

  return JSON.parse(content);
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Se requiere un prompt' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'La clave de API de DeepSeek no está configurada.' }, { status: 500 });
    }

    const characterData = await callApi(apiKey, prompt);

    return NextResponse.json(characterData);

  } catch (error: any) {
    console.error('Error generando el personaje:', error);
    return NextResponse.json({ error: `Ocurrió un error interno: ${error.message || 'Error desconocido'}` }, { status: 500 });
  }
}