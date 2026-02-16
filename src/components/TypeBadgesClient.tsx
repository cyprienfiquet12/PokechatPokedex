'use client';

import { TypeBadge } from '@/components/TypeBadge';
import { useTypes } from '@/hooks/useTypes';

interface TypeBadgesClientProps {
  type1: string;
  type2?: string | null;
  size?: 'sm' | 'md';
}

export function TypeBadgesClient({ type1, type2, size = 'md' }: TypeBadgesClientProps) {
  const { typesByName } = useTypes();
  return (
    <div className="flex flex-wrap gap-1.5">
      <TypeBadge typeName={type1} typesByName={typesByName} size={size} />
      {type2 && <TypeBadge typeName={type2} typesByName={typesByName} size={size} />}
    </div>
  );
}
