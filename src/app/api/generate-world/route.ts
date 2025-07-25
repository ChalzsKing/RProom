import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

async function callApi(apiKey: string, prompt: string) {
  const system_prompt = `Eres un asistente de creación de mundos para un juego de rol. Basado en la idea del usuario, genera un mundo completo y coherente. Tu respuesta DEBE ser un único objeto JSON válido.

Es crucial que generes exactamente 3 elementos para cada una de las siguientes listas: \`campaignNpcs\`, \`locations\`, \`factions\`, \`glossary\`, \`importantItems\`, \`houseRules\`, y \`adventures\`.

La estructura del JSON debe ser la siguiente, sin texto adicional ni marcadores de bloque de código:
{
  "worldDescription": "Una descripción rica y evocadora del mundo (2-3 párrafos).",
  "uniqueFeatures": "Una lista de 2-3 características o leyes únicas que definen el mundo (ej: 'La magia es salvaje e impredecible', 'No existen los metales', 'Los sueños tienen poder físico').",
  "campaignNpcs": [
    { "name": "Nombre del PNJ 1", "description": "Descripción del PNJ 1, su rol en el mundo y su personalidad." },
    { "name": "Nombre del PNJ 2", "description": "Descripción del PNJ 2." },
    { "name": "Nombre del PNJ 3", "description": "Descripción del PNJ 3." }
  ],
  "locations": [
    { "name": "Nombre del Lugar 1", "type": "Ciudad/Ruina/Región...", "description": "Descripción del Lugar 1." },
    { "name": "Nombre del Lugar 2", "type": "Ciudad/Ruina/Región...", "description": "Descripción del Lugar 2." },
    { "name": "Nombre del Lugar 3", "type": "Ciudad/Ruina/Región...", "description": "Descripción del Lugar 3." }
  ],
  "factions": [
    { "name": "Nombre de la Facción 1", "description": "Descripción de sus objetivos, ideología y métodos.", "keyLeaders": "Líder 1, Líder 2", "relationships": "Relaciones con otras facciones (ej: 'Aliados con X, enemigos de Y')." },
    { "name": "Nombre de la Facción 2", "description": "Descripción de la facción 2.", "keyLeaders": "Líder 3", "relationships": "Relaciones de la facción 2." },
    { "name": "Nombre de la Facción 3", "description": "Descripción de la facción 3.", "keyLeaders": "Líder 4", "relationships": "Relaciones de la facción 3." }
  ],
  "glossary": [
    { "term": "Término Clave 1", "definition": "Definición del término clave 1, relevante para el mundo." },
    { "term": "Término Clave 2", "definition": "Definición del término clave 2." },
    { "term": "Término Clave 3", "definition": "Definición del término clave 3." }
  ],
  "importantItems": [
    { "name": "Objeto Importante 1", "description": "Descripción del objeto, su historia o apariencia.", "properties": "Efectos o habilidades del objeto." },
    { "name": "Objeto Importante 2", "description": "Descripción del objeto 2.", "properties": "Efectos del objeto 2." },
    { "name": "Objeto Importante 3", "description": "Descripción del objeto 3.", "properties": "Efectos del objeto 3." }
  ],
  "houseRules": [
    { "title": "Regla de la Casa 1", "rule": "Descripción de una mecánica de juego única para este mundo." },
    { "title": "Regla de la Casa 2", "rule": "Descripción de otra mecánica de juego." },
    { "title": "Regla de la Casa 3", "rule": "Descripción de una tercera mecánica de juego." }
  ],
  "adventures": [
    { "name": "Nombre de la Aventura 1", "premise": "La premisa o gancho inicial de la aventura 1." },
    { "name": "Nombre de la Aventura 2", "premise": "La premisa o gancho inicial de la aventura 2." },
    { "name": "Nombre de la Aventura 3", "premise": "La premisa o gancho inicial de la aventura 3." }
  ]
}
Asegúrate de que todo el contenido sea coherente con la idea inicial del usuario.`;

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
      max_tokens: 4000, // Aumentamos el límite para una respuesta completa
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

    const worldData = await callApi(apiKey, prompt);

    return NextResponse.json(worldData);

  } catch (error: any) {
    console.error('Error generando el mundo:', error);
    return NextResponse.json({ error: `Ocurrió un error interno: ${error.message || 'Error desconocido'}` }, { status: 500 });
  }
}