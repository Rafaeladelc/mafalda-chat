import { describe, it, expect, vi, beforeEach } from 'vitest';

// Gemini simulado: nunca se llama a Google de verdad
const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

import handler from '../api/chat.js';

// Respuesta falsa de Vercel: guarda el código y el cuerpo que se envían
function createRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

const validBody = { messages: [{ role: 'user', text: 'Hola Mafalda' }] };

beforeEach(() => {
  generateContent.mockReset();
  vi.stubEnv('GEMINI_API_KEY', 'clave-falsa-de-prueba');
});

describe('handler de /api/chat', () => {
  it('rechaza métodos que no son POST con 405', async () => {
    const res = createRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(405);
  });

  it('rechaza un historial inválido con 400 sin llamar a Gemini', async () => {
    const res = createRes();
    await handler({ method: 'POST', body: { messages: [{ role: 'admin', text: 'x' }] } }, res);
    expect(res.statusCode).toBe(400);
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('devuelve la respuesta de Gemini con 200', async () => {
    generateContent.mockResolvedValue({ text: '  ¿La sopa? Un castigo.  ' });
    const res = createRes();
    await handler({ method: 'POST', body: validBody }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ reply: '¿La sopa? Un castigo.' });
  });

  it('envía a Gemini el historial traducido y las instrucciones de Mafalda', async () => {
    generateContent.mockResolvedValue({ text: 'ok' });
    await handler({ method: 'POST', body: validBody }, createRes());
    const request = generateContent.mock.calls[0][0];
    expect(request.contents).toEqual([{ role: 'user', parts: [{ text: 'Hola Mafalda' }] }]);
    expect(request.config.systemInstruction).toContain('Mafalda');
  });

  it('responde 502 si Gemini devuelve texto vacío', async () => {
    generateContent.mockResolvedValue({ text: '' });
    const res = createRes();
    await handler({ method: 'POST', body: validBody }, res);
    expect(res.statusCode).toBe(502);
  });

  it('responde 429 con mensaje amable si Gemini limita las solicitudes', async () => {
    generateContent.mockRejectedValue(Object.assign(new Error('quota'), { status: 429 }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = createRes();
    await handler({ method: 'POST', body: validBody }, res);
    expect(res.statusCode).toBe(429);
  });

  it('responde 500 sin filtrar detalles técnicos si Gemini falla', async () => {
    generateContent.mockRejectedValue(new Error('API key not valid: secreto-interno'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = createRes();
    await handler({ method: 'POST', body: validBody }, res);
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('secreto-interno');
  });
});