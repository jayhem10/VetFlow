'use client';

import { AnimalsList } from '@/modules/animal/components/AnimalsList';

export default function AnimalsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimalsList />
    </div>
  );
}