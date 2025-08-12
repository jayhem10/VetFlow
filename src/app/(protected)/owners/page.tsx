'use client';

import { OwnersList } from '@/modules/owner/components/OwnersList';

export default function OwnersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <OwnersList />
      </div>
    </div>
  );
}