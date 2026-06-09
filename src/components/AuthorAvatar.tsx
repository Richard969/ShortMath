function getInitials(name: string): string {
  const parts = name.split(/[\s()-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  // "3Blue1Brown" → "3B"
  const match = name.match(/[A-Za-z0-9]/g);
  if (match && match.length >= 2) {
    return (match[0] + match[1]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [20, 140, 200, 280, 340, 40, 170, 320, 60];
  const h = hues[Math.abs(hash) % hues.length];
  const s = 55 + (Math.abs(hash) % 30);
  const l = 45 + (Math.abs(hash >> 3) % 15);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

interface AuthorAvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

export default function AuthorAvatar({ name, size = 'sm' }: AuthorAvatarProps) {
  const initials = getInitials(name);
  const bg = getColor(name);
  const dims = size === 'md' ? 'w-8 h-8 text-xs' : 'w-5 h-5 text-[9px]';

  return (
    <span
      className={`${dims} rounded-full flex items-center justify-center font-bold font-mono text-white/90 flex-shrink-0`}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {initials}
    </span>
  );
}
