import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

async function callApi(apiKey: string, prompt: string) {
  const system_prompt = `Eres un asistente creativo para un juego de rol. Basado en la idea del usuario, genera una aventura. Proporciona un nombre evocador y una premisa detallada (aproximadamente 100-200 palabras) que sirva como punto de partida. Tu respuesta DEBE ser un objeto JSON válido con dos claves: "name" y "premise". No incluyas nada más en tu respuesta, ni siquiera los marcadores de bloque de código JSON.

Ejemplo de idea del usuario: "un castillo encantado en un acantilado junto al mar tormentoso"
Tu respuesta JSON:
{
  "name": "El Lamento del Guardián del Acantilado",
  "premise": "En lo alto de los Acantilados de la Agonía se alza el Castillo de Finisterre, una silueta rota contra un cielo perpetuamente gris. Los lugareños susurran que el fantasma de su último señor, Lord Alistair, aún vaga por sus salones, lamentando una traición que le costó la vida y su amor. Se dice que una gran fortuna permanece oculta en el castillo, pero ninguna de las almas codiciosas que han entrado ha regresado jamás. Las mareas tormentosas parecen cantar una canción fúnebre, y una extraña luz verde a veces parpadea desde la torre más alta."
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
      max_tokens: 800,
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

    const adventureData = await callApi(apiKey, prompt);

    return NextResponse.json(adventureData);

  } catch (error: any) {
    console.error('Error generando la aventura:', error);
    return NextResponse.json({ error: `Ocurrió un error interno: ${error.message || 'Error desconocido'}` }, { status: 500 });
  }
}