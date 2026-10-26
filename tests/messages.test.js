import { describe, it, expect } from 'vitest';
import { isValidMessage, toGeminiContents, MAX_MESSAGES } from '../lib/messages.js';

describe('isValidMessage', () => {
  it('acepta un mensaje de usuario con texto', () => {
    expect(isValidMessage({ role: 'user', text: 'Hola' })).toBe(true);
  });

  it('rechaza roles desconocidos y textos vacíos o demasiado largos', () => {
    expect(isValidMessage({ role: 'admin', text: 'Hola' })).toBe(false);
    expect(isValidMessage({ role: 'user', text: '   ' })).toBe(false);
    expect(isValidMessage({ role: 'user', text: 'a'.repeat(501) })).toBe(false);
  });
});

describe('toGeminiContents', () => {
  it('traduce character a model y usa el formato parts', () => {
    const result = toGeminiContents([
      { role: 'user', text: 'Hola' },
      { role: 'character', text: 'Qué hay' },
    ]);
    expect(result).toEqual([
      { role: 'user', parts: [{ text: 'Hola' }] },
      { role: 'model', parts: [{ text: 'Qué hay' }] },
    ]);
  });

  it('descarta el saludo inicial de Mafalda porque Gemini debe empezar con user', () => {
    const result = toGeminiContents([
      { role: 'character', text: 'saludo inicial' },
      { role: 'user', text: 'Hola' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('user');
  });

  it('recorta el historial largo y sigue empezando con user', () => {
    const many = Array.from({ length: 31 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'character',
      text: `m${i}`,
    }));
    const result = toGeminiContents(many);
    expect(result.length).toBeLessThanOrEqual(MAX_MESSAGES);
    expect(result[0].role).toBe('user');
    expect(result.at(-1).parts[0].text).toBe('m30');
  });
});