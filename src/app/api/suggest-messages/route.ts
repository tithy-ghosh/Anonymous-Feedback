import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. Example output: 'What hobby have you recently started? || If you could have dinner with any historical figure, who would it be? || What simple thing makes you happy?'"

        const result = streamText({  // ✅ NO await
            model: openai('gpt-4o'),
            prompt,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ message: 'Internal server error' }),
            { status: 500 }
        );
    }
}