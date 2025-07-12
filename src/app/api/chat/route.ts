import { NextResponse } from 'next/server';

// Usando `require` para manejar un módulo CommonJS que podría tener problemas de exportación.
const DeepSeekModule = require('deepseek');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

    if (!deepseekApiKey) {
      console.error('DEEPSEEK_API_KEY is not set in environment variables.');
      return NextResponse.json({ error: 'Server configuration error: DeepSeek API key missing.' }, { status: 500 });
    }

    // Comprobamos si el constructor está en la propiedad 'default' o si es el módulo mismo.
    const DeepSeek = DeepSeekModule.default || DeepSeekModule;

    const deepseek = new DeepSeek({
      apiKey: deepseekApiKey,
    });

    // Convertir el formato de mensajes para la API de DeepSeek
    const deepseekMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    const chatCompletion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: deepseekMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = chatCompletion.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error('Error calling DeepSeek API or processing request:', error);
    return NextResponse.json({ error: `Failed to get response from AI: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}