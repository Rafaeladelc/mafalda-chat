// Pide la respuesta de Mafalda a nuestro servidor (api/chat.js)
export async function requestReply(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Mafalda no pudo responder.');
  }
  return data.reply;
}

// Convierte un error técnico en un mensaje entendible
export function friendlyError(error) {
  if (error instanceof TypeError) {
    return 'No pude conectarme con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  return `Algo salió mal: ${error.message}`;
}