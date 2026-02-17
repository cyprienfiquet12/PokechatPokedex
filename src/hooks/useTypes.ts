'use client';

import { useEffect, useState } from 'react';
import type { TypeInfo } from '@/components/TypeBadge';
import { TYPE_NAME_EN_TO_FR, TYPE_NAME_FR_TO_EN } from '@/lib/typeNames';

export function useTypes() {
  const [types, setTypes] = useState<TypeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/types', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setTypes(data.types ?? []))
      .catch(() => setTypes([]))
      .finally(() => setLoading(false));
  }, []);

  const typesByName: Record<string, TypeInfo> = {};
  types.forEach((t) => {
    typesByName[t.name] = t;
    const other =
      TYPE_NAME_EN_TO_FR[t.name] ?? TYPE_NAME_FR_TO_EN[t.name];
    if (other) typesByName[other] = t;
  });

  return { types, typesByName, loading };
}
