// Lista de emails autorizados a acessar o sistema
// Adicione aqui os emails dos usuários que devem ter acesso
export const AUTHORIZED_EMAILS = [
  'crisnabto@gmail.com',
  'aullus.88@gmail.com'
  // Adicione mais emails conforme necessário
  // 'usuario2@gmail.com',
  // 'usuario3@gmail.com',
];

// Função para verificar se um email está autorizado
export function isEmailAuthorized(email: string): boolean {
  return AUTHORIZED_EMAILS.includes(email.toLowerCase());
}

// Função para adicionar um novo email à lista (para uso futuro)
export function addAuthorizedEmail(email: string): void {
  const normalizedEmail = email.toLowerCase();
  if (!AUTHORIZED_EMAILS.includes(normalizedEmail)) {
    AUTHORIZED_EMAILS.push(normalizedEmail);
  }
}

// Função para remover um email da lista (para uso futuro)
export function removeAuthorizedEmail(email: string): void {
  const normalizedEmail = email.toLowerCase();
  const index = AUTHORIZED_EMAILS.indexOf(normalizedEmail);
  if (index > -1) {
    AUTHORIZED_EMAILS.splice(index, 1);
  }
}