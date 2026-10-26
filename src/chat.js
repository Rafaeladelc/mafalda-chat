// Estado del chat: vive FUERA de la vista, así no se pierde al navegar
const messages = [
  { role: 'character', text: '¿Otra vez tú? Pregunta lo que quieras, pero ojo: yo también pregunto.' },
];
let isTyping = false;

// Respuestas de mentira, solo para probar la interfaz (luego las reemplaza Gemini)
const mockReplies = [
  'Eso lo tengo que pensar... mientras tanto, ¿tú sabías que la sopa es un castigo?',
  '¿Y por qué siempre los grandes dicen "es por tu bien"?',
  'Interesante. Pero yo pregunté primero.',
];
let mockIndex = 0;

function getMockReply() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockReplies[mockIndex++ % mockReplies.length]);
    }, 1200);
  });
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

function renderMessages(listElement) {
  const items = messages.map(createMessageElement);
  if (isTyping) items.push(createTypingElement());
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
    isTyping = true;
    refresh();

    try {
      const reply = await getMockReply(text);
      messages.push({ role: 'character', text: reply });
    } finally {
      isTyping = false;
      refresh();
      document.getElementById('message-input')?.focus();
    }
  });
}