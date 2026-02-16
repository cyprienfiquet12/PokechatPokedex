'use client';

import Image from 'next/image';

export interface TypeInfo {
  id: number;
  name: string;
  sprite_url: string | null;
}

interface TypeBadgeProps {
  typeName: string;
  typesByName: Record<string, TypeInfo>;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function TypeBadge({
  typeName,
  typesByName,
  size = 'md',
  showLabel = false,
}: TypeBadgeProps) {
  const type = typesByName[typeName];
  const spriteUrl = type?.sprite_url;
  const pixel = size === 'sm' ? 16 : 24;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-slate-700/80 px-2 py-0.5"
      title={typeName}
    >
      {spriteUrl ? (
        <Image
          src={spriteUrl}
          alt={typeName}
          width={pixel}
          height={pixel}
          className="object-contain"
          unoptimized
        />
      ) : null}
      {(showLabel || !spriteUrl) && (
        <span className="text-xs font-medium text-slate-200">{typeName}</span>
      )}
    </span>
  );
}

export function typeMapFromList(types: TypeInfo[]): Record<string, TypeInfo> {
  const map: Record<string, TypeInfo> = {};
  types.forEach((t) => {
    map[t.name] = t;
  });
  return map;
}
