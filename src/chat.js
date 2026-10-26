// Estado del chat: vive FUERA de la vista, así no se pierde al navegar
const messages = [
  { role: 'character', text: '¿Otra vez tú? Pregunta lo que quieras, pero ojo: yo también pregunto.' },
];

function createMessageElement(message) {
  const li = document.createElement('li');
  li.className = `message ${message.role}`;
  li.textContent = message.text; // textContent, nunca innerHTML
  return li;
}

function renderMessages(listElement) {
  listElement.replaceChildren(...messages.map(createMessageElement));
  listElement.scrollTop = listElement.scrollHeight;
}

export function mountChat() {
  const list = document.getElementById('messages');
  const form = document.getElementById('composer');
  const input = document.getElementById('message-input');

  renderMessages(list);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    messages.push({ role: 'user', text });
    input.value = '';
    renderMessages(list);
    input.focus();
  });
}