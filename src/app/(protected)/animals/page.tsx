'use client';

import { AnimalsList } from '@/modules/animal/components/AnimalsList';

export default function AnimalsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <AnimalsList />
      </div>
    </div>
  );
}