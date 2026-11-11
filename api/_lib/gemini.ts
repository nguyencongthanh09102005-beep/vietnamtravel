interface GeminiPayload {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}
export async function generateGeminiText(
  prompt: string,
  options: { json?: boolean; signal?: AbortSignal } = {},
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const models = [...new Set([
    process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite',
  ])];
  const deadline = Date.now() + 28_000;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (options.signal?.aborted || deadline - Date.now() < 1200) return null;
      const controller = new AbortController();
      const abort = () => controller.abort();
      options.signal?.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(() => controller.abort(), Math.min(11_000, deadline - Date.now()));
      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/' +
            encodeURIComponent(model) + ':generateContent',
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              ...(options.json ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
            }),
          },
        );
        if (response.ok) {
          const payload = await response.json() as GeminiPayload;
          const value = payload.candidates?.[0]?.content?.parts?.map(p => p.text ?? '').join('').trim();
          if (value) return value;
        } else {
          // Do not log API keys or entire responses.
          console.warn('[Gemini] HTTP', response.status, 'model', model);
          if (![408, 429, 500, 502, 503, 504].includes(response.status)) break;
        }
      } catch (error) {
        console.warn('[Gemini] request timed out or network error', String(error).slice(0, 150));
      } finally {
        clearTimeout(timer);
        options.signal?.removeEventListener('abort', abort);
      }
      if (attempt === 0 && deadline - Date.now() > 1400) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }
  }
  return null;
}
