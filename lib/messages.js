export const MAX_MESSAGES = 20; // cuántos mensajes recientes se envían a Gemini
export const MAX_TEXT_LENGTH = 500;

export function isValidMessage(message) {
  return (
    message !== null &&
    typeof message === 'object' &&
    (message.role === 'user' || message.role === 'character') &&
    typeof message.text === 'string' &&
    message.text.trim().length > 0 &&
    message.text.length <= MAX_TEXT_LENGTH
  );
}

// Traduce nuestro formato al de Gemini y recorta el historial
export function toGeminiContents(messages) {
  const recent = messages.slice(-MAX_MESSAGES);
  // Gemini espera que la conversación empiece con un turno del usuario
  while (recent.length > 0 && recent[0].role !== 'user') {
    recent.shift();
  }
  return recent.map((message) => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.text }],
  }));
}