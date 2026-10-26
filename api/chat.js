export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Falta el historial de mensajes.' });
  }

  const last = messages[messages.length - 1];

  // INTERRUPTOR DE PRUEBA (se borra en la Parte 5c)
  if (last.text === 'error') {
    return res.status(500).json({ error: 'Fallo simulado del servidor.' });
  }

  return res.status(200).json({ reply: `(mock) Me dijiste: "${last.text}"` });
}