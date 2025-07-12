import { NextResponse } from 'next/server';

// --- Tipos de Mensajes ---
interface AppMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// --- Funciones de Llamada a la API ---

async function callDeepSeekApi(messages: AppMessage[], apiKey: string, temperature: number, maxLength: number) {
  const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
  
  // DeepSeek funciona mejor si el system prompt se combina con el primer mensaje de usuario.
  // Pero para mantener la consistencia, lo enviaremos como un mensaje de sistema.
  // La API de DeepSeek lo manejará adecuadamente.
  const apiResponse = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      temperature: temperature,
      max_tokens: maxLength,
    }),
  });

  if (!apiResponse.ok) {
    const errorBody = await apiResponse.json();
    console.error('Error de la API de DeepSeek:', errorBody);
    throw new Error(errorBody.error?.message || 'No se pudo obtener respuesta de DeepSeek');
  }

  const data = await apiResponse.json();
  const assistantMessage = data.choices[0]?.message?.content;

  if (!assistantMessage) {
    throw new Error('Estructura de respuesta inválida de la IA de DeepSeek');
  }

  return assistantMessage;
}

async function callGeminiApi(messages: AppMessage[], apiKey: string, temperature: number, maxLength: number) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  // Gemini no tiene un rol 'system' explícito en el historial de 'contents'.
  // El contexto del sistema se pasa en un campo separado.
  let systemInstruction: { parts: { text: string }[] } | undefined = undefined;
  const regularMessages: AppMessage[] = [];

  messages.forEach(msg => {
    if (msg.role === 'system') {
      systemInstruction = { parts: [{ text: msg.content }] };
    } else {
      regularMessages.push(msg);
    }
  });

  const contents: GeminiMessage[] = regularMessages
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: contents,
      ...(systemInstruction && { systemInstruction }), // Añadir si existe
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxLength,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Error de la API de Gemini:', errorBody);
    throw new Error(errorBody.error?.message || 'No se pudo obtener respuesta de Gemini');
  }

  const data = await response.json();
  if (data.candidates?.[0]?.finishReason === 'SAFETY') {
    throw new Error('La respuesta fue bloqueada por motivos de seguridad por la API de Gemini.');
  }

  const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!assistantMessage) {
    console.error('Estructura de respuesta inválida de Gemini:', data);
    throw new Error('Estructura de respuesta inválida de la IA de Gemini');
  }

  return assistantMessage;
}


// --- Manejador POST ---

export async function POST(req: Request) {
  try {
    const { provider, messages, temperature, maxLength, systemPrompt } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Formato de mensajes inválido' }, { status: 400 });
    }

    let messagesWithPrompt = [...messages];
    if (systemPrompt) {
      messagesWithPrompt.unshift({ role: 'system', content: systemPrompt });
    }

    let assistantMessage: string;

    if (provider === 'Gemini') {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return NextResponse.json({ error: 'La clave de API de Gemini no está configurada. Por favor, añádela a tus variables de entorno.' }, { status: 500 });
      }
      assistantMessage = await callGeminiApi(messagesWithPrompt, geminiApiKey, temperature, maxLength);
    } else { // Por defecto, usar DeepSeek
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
      if (!deepseekApiKey) {
        return NextResponse.json({ error: 'La clave de API de DeepSeek no está configurada.' }, { status: 500 });
      }
      assistantMessage = await callDeepSeekApi(messagesWithPrompt, deepseekApiKey, temperature, maxLength);
    }

    return NextResponse.json({ message: assistantMessage });

  } catch (error: any) {
    console.error('Error procesando la solicitud de chat:', error);
    return NextResponse.json({ error: `Ocurrió un error interno: ${error.message || 'Error desconocido'}` }, { status: 500 });
  }
}