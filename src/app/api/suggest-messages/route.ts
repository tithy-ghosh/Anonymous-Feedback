import OpenAI from 'openai';

const FALLBACK = [
    "What's something you've always wanted to tell me?",
    "What's your favorite memory of us?",
    "If you could give me one piece of advice, what would it be?"
]

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST() {
    try {
        const prompt = "Create a list of three open-ended and engaging questions for an anonymous social messaging platform. Return ONLY the three questions separated by '||' with no extra text, numbering, or formatting. Example: What hobby have you recently started? || If you could have dinner with any historical figure, who would it be? || What simple thing makes you happy?"

        const response = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.9,
        })

        const text = response.choices[0]?.message?.content?.trim() || ''
        const suggestions = text.split('||').map((s) => s.trim()).filter(Boolean).slice(0, 3)

        if (suggestions.length === 0) {
            return Response.json({ success: true, suggestions: FALLBACK })
        }

        return Response.json({ success: true, suggestions })

    } catch (error) {
        console.error('Suggestions error:', error)
        return Response.json({ success: true, suggestions: FALLBACK })
    }
}
