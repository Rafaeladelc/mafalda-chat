// Estado del chat: vive FUERA de la vista, así no se pierde al navegar
const messages = [
  { role: 'character', text: '¿Otra vez tú? Pregunta lo que quieras, pero ojo: yo también pregunto.' },
];
let isTyping = false;
let lastError = null;

// Pide la respuesta de Mafalda a nuestro servidor (api/chat.js)
async function requestReply() {
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
function friendlyError(error) {
  if (error instanceof TypeError) {
    return 'No pude conectarme con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }
  return `Algo salió mal: ${error.message}`;
}

function createMessageElement(message) {
  const li = document.createElement('li');
  li.className = `message ${message.role}`;
  li.textContent = message.text;
  return li;
}

function createTypingElement() {
  const li = document.createElement('li');
  li.className = 'message character typing';
  li.textContent = 'Mafalda está escribiendo...';
  return li;
}

function createErrorElement(text) {
  const li = document.createElement('li');
  li.className = 'message error';
  li.setAttribute('role', 'alert');
  li.textContent = text;
  return li;
}

function renderMessages(listElement) {
  const items = messages.map(createMessageElement);
  if (isTyping) items.push(createTypingElement());
  if (lastError) items.push(createErrorElement(lastError));
  listElement.replaceChildren(...items);
  listElement.scrollTop = listElement.scrollHeight;
}

// Vuelve a buscar los elementos en el DOM actual y actualiza la pantalla
function refresh() {
  const list = document.getElementById('messages');
  const input = document.getElementById('message-input');
  const button = document.querySelector('#composer button');
  if (!list) return; // la persona salió del chat mientras esperaba
  renderMessages(list);
  input.disabled = isTyping;
  button.disabled = isTyping;
}

export function mountChat() {
  const form = document.getElementById('composer');
  const input = document.getElementById('message-input');

  refresh();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || isTyping) return;

    messages.push({ role: 'user', text });
    input.value = '';
    lastError = null;
    isTyping = true;
    refresh();

    let failedText = '';
    try {
      const reply = await requestReply();
      messages.push({ role: 'character', text: reply });
    } catch (error) {
      messages.pop(); // el mensaje no llegó: no lo dejamos en el historial
      failedText = text;
      lastError = friendlyError(error);
    } finally {
      isTyping = false;
      refresh();
      const currentInput = document.getElementById('message-input');
      if (currentInput) {
        if (failedText) currentInput.value = failedText; // para reintentar con Enter
        currentInput.focus();
      }
    }
  });
}