import * as DeepSeekModule from 'deepseek'; // Importa todo el módulo
import { NextResponse } from 'next/server';

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

    // Accede al constructor DeepSeek a través de la propiedad 'default' del módulo importado
    // Esto es un patrón común para resolver problemas de importación/exportación con Webpack
    const deepseek = new (DeepSeekModule as any).default({
      apiKey: deepseekApiKey,
    });

    // Convertir el formato de mensajes para la API de DeepSeek
    const deepseekMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    const chatCompletion = await deepseek.chat.completions.create({
      model: "deepseek-chat", // Puedes cambiar el modelo si DeepSeek ofrece otros
      messages: deepseekMessages,
      temperature: 0.7, // Usaremos un valor fijo por ahora, luego lo haremos dinámico
      max_tokens: 500, // Usaremos un valor fijo por ahora, luego lo haremos dinámico
    });

    const assistantMessage = chatCompletion.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error('Error calling DeepSeek API or processing request:', error);
    // Si el error tiene un mensaje, lo incluimos para depuración
    return NextResponse.json({ error: `Failed to get response from AI: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}