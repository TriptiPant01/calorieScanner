const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5-5';

const PROMPT = `Identify each food item visible in this meal photo and estimate its nutrition for the portion shown.
The meal may be Nepali or other South Asian food (for example dal, bhat, tarkari, momo, sel roti, chiura, gundruk, achar, dhido, saag, chana, paneer dishes, chai). Name such dishes as they are commonly called and estimate typical home-cooked portions.
If you are unsure of an exact dish, still list the most likely food with a reasonable estimate rather than skipping it.
Respond with JSON only, in this exact shape:
{"items":[{"name":"string","calories":number,"protein":number,"carbs":number,"fat":number}]}
Use kcal for calories and grams for protein, carbs and fat. Return {"items":[]} only if no food is visible.`;

type FoodItem = { name: string; calories: number; protein: number; carbs: number; fat: number };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : 0;
}

function sanitizeItems(raw: unknown): FoodItem[] {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { items?: unknown }).items)) {
    return [];
  }

  return (raw as { items: Record<string, unknown>[] }).items
    .filter((item) => typeof item.name === 'string' && item.name.trim() !== '')
    .map((item) => ({
      name: String(item.name).trim().slice(0, 80),
      calories: toNumber(item.calories),
      protein: toNumber(item.protein),
      carbs: toNumber(item.carbs),
      fat: toNumber(item.fat),
    }));
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const { image, mimeType } = await req.json().catch(() => ({}));
  if (typeof image !== 'string' || typeof mimeType !== 'string') {
    return json({ error: 'image and mimeType are required' }, 400);
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    return json({ error: 'Food analysis failed' }, 502);
  }

  const result = await response.json();
  const text: string = result.content?.find((block: { type: string }) => block.type === 'text')?.text ?? '';

  try {
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '');
    return json({ items: sanitizeItems(parsed) });
  } catch {
    return json({ error: 'Could not read the food analysis' }, 502);
  }
});
