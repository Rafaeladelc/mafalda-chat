import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestReply, friendlyError } from '../src/chat-api.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

// Crea una respuesta falsa, como la que devolvería fetch
function fakeResponse({ ok, body }) {
  return { ok, json: async () => body };
}

describe('requestReply', () => {
  it('envía el historial por POST a /api/chat', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse({ ok: true, body: { reply: 'Hola' } }));
    vi.stubGlobal('fetch', fetchMock);
    const messages = [{ role: 'user', text: 'Hola Mafalda' }];

    await requestReply(messages);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/chat');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ messages });
  });

  it('devuelve la respuesta de Mafalda cuando todo sale bien', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse({ ok: true, body: { reply: '¡La sopa es un castigo!' } })));

    await expect(requestReply([{ role: 'user', text: 'Hola' }])).resolves.toBe('¡La sopa es un castigo!');
  });

  it('lanza el error que explica el servidor cuando responde con fallo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse({ ok: false, body: { error: 'Fallo simulado del servidor.' } })));

    await expect(requestReply([{ role: 'user', text: 'Hola' }])).rejects.toThrow('Fallo simulado del servidor.');
  });

  it('usa un mensaje por defecto si el servidor no devuelve JSON', async () => {
    const brokenResponse = { ok: false, json: async () => { throw new Error('no es JSON'); } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(brokenResponse));

    await expect(requestReply([{ role: 'user', text: 'Hola' }])).rejects.toThrow('Mafalda no pudo responder.');
  });
});

describe('friendlyError', () => {
  it('explica los problemas de conexión (TypeError) sin mostrar el error técnico', () => {
    expect(friendlyError(new TypeError('Failed to fetch'))).toContain('No pude conectarme');
  });

  it('muestra el mensaje del servidor para otros errores', () => {
    expect(friendlyError(new Error('Fallo simulado'))).toBe('Algo salió mal: Fallo simulado');
  });
});