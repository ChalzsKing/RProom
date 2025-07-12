import { DeepSeek } from 'deepseek';
import { NextResponse } from 'next/server';

const deepseek = new DeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

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
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return NextResponse.json({ error: 'Failed to get response from AI' }, { status: 500 });
  }
}