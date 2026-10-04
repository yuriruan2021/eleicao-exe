export interface Friend {
  name: string;
  /** Cor só para diferenciar os amigos; nada a ver com as cores dos candidatos no duelo. */
  color: string;
  /** Recado de "momento de tensão", durante a apuração. */
  message: string;
  /** Recado da tela de comemoração, quando o 22 é eleito. */
  celebrationMessage: string;
}

export const FRIENDS: readonly Friend[] = [
  {
    name: 'Fabio Carvalho',
    color: '#f0a23a',
    message: 'Relaxa, que o teu Lula não leva essa.',
    celebrationMessage: 'Avisamos, né? Fica pra próxima.',
  },
  {
    name: 'Carol Carvalho',
    color: '#7ee0a1',
    message:
      'Tá tudo sob controle. Quando a apuração passar dos 20%, pode cochilar tranquila que a gente te acorda nos 100%.',
    celebrationMessage: 'Pode acordar, chegou nos 100%!',
  },
  {
    name: 'Felipe Gonçalo',
    color: '#ff7a9a',
    message: 'Fica de boa aí e aguenta, coração. Sei que tá disparado, mas vai dar 22.',
    celebrationMessage: 'Pode respirar, coração. Deu 22!',
  },
  {
    name: 'Gabriella Carvalho',
    color: '#7aa2ff',
    message: 'Fica de boa, não precisa fazer as malas pra Espanha agora. O Bolsonaro tá na área.',
    celebrationMessage: 'Pode desfazer as malas. A Espanha fica pras férias.',
  },
  {
    name: 'Thiago Cantuario',
    color: '#f5d76e',
    message: 'Aqui não tem pra Augusto Cury, não. É 22.',
    celebrationMessage: 'Augusto Cury que nos perdoe, mas deu 22.',
  },
  {
    name: 'Amanda Oliveira',
    color: '#ff9f6b',
    message: 'Tá tudo sob controle. Já comprou os fogos? Pode apontar na direção do Fabio.',
    celebrationMessage: 'Pode soltar os fogos. Mira no Fabio!',
  },
  {
    name: 'Julia Damascena',
    color: '#c39bff',
    message: 'Nunca gostei do PT, nunca vou gostar do PT e nem gosto de petista. Achou ruim? Come abóbora que passa.',
    celebrationMessage: 'Achou ruim? Come abóbora que passa.',
  },
];

export function getFriendInitials(name: string): string {
  const words = name.split(' ');
  return `${words[0][0]}${words.at(-1)![0]}`;
}
