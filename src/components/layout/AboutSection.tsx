import type { CSSProperties } from 'react';
import { Database, FlaskConical, MessagesSquare, ShieldCheck, type LucideIcon } from 'lucide-react';
import { FRIENDS, getFriendInitials } from '@/utils/friends';
import { CreatorCard } from './CreatorCredit';
import { WindowTitle } from './WindowTitle';

const ABOUT_TOPICS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Database,
    title: 'Só números oficiais',
    text: 'Os números vêm exclusivamente dos arquivos oficiais de divulgação do Tribunal Superior Eleitoral.',
  },
  {
    icon: MessagesSquare,
    title: 'Zoeira não é análise',
    text: 'O termômetro, o narrador e as piadas são só a forma de mostrar esses números e não são análise eleitoral.',
  },
  {
    icon: FlaskConical,
    title: 'Modo demonstração',
    text: 'Usa candidatos e votos inventados para testar a interface. Quando ele está ligado, uma faixa amarela fica fixa no topo da tela.',
  },
];

function AboutPanel() {
  return (
    <section
      aria-labelledby="about-title"
      className="overflow-hidden rounded-2xl border border-line bg-panel lg:col-span-5"
    >
      <WindowTitle>~/eleicao.exe/sobre.txt</WindowTitle>
      <div className="p-5 sm:p-7">
        <h2 id="about-title" className="font-display text-2xl leading-tight font-bold">
          Sobre o ELEIÇÃO.EXE
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/90">
          Um painel feito entre amigos para acompanhar a apuração da eleição para Presidente da República. Os números
          são só os oficiais e o painel não prevê resultado. Já o grupo torce, e muito.
        </p>

        <ul className="mt-6 space-y-4">
          {ABOUT_TOPICS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-raised text-ink">
                <Icon aria-hidden className="size-4" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-dim">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <CreatorCard />

        <p className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-xs text-dim">
          <ShieldCheck aria-hidden className="size-4 shrink-0" />
          Este site é independente e não possui vínculo com o TSE.
        </p>
      </div>
    </section>
  );
}

function FriendMessages() {
  return (
    <section
      aria-labelledby="friends-title"
      className="overflow-hidden rounded-2xl border border-line bg-panel lg:col-span-7"
    >
      <WindowTitle>#grupo-da-apuração</WindowTitle>
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="friends-title" className="font-display text-2xl leading-tight font-bold">
              Momento de tensão
            </h2>
            <p className="mt-1 text-sm text-dim">Recados para o grupo, para ler com o coração na mão.</p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-heat-hot/40 bg-heat-hot/10 px-3 py-1 font-display text-xs font-semibold text-heat-hot">
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-heat-hot opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-heat-hot" />
            </span>
            {FRIENDS.length} recados
          </span>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {FRIENDS.map(({ name, message, color: accent }) => {
            return (
              <li
                key={name}
                style={{ '--accent': accent } as CSSProperties}
                className="group relative rounded-xl border border-line bg-raised/70 p-4 transition-colors hover:border-(--accent) sm:odd:last:col-span-2"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1 right-3 font-display text-5xl leading-none text-(--accent) opacity-20 transition-opacity group-hover:opacity-40"
                >
                  ”
                </span>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-void"
                    style={{ backgroundColor: accent }}
                  >
                    {getFriendInitials(name)}
                  </span>
                  <p className="font-display font-semibold">{name}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink/90">{message}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <AboutPanel />
      <FriendMessages />
    </div>
  );
}
