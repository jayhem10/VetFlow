'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import SearchInput from '@/components/atoms/SearchInput'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface OwnerItem {
  id: string
  first_name: string
  last_name: string
  email?: string
  animals?: number
}

interface AnimalItem {
  id: string
  owner_id: string
  name: string
  species: string
  owner_name?: string
}

interface CollaboratorItem {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  role?: string
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const [owners, setOwners] = useState<OwnerItem[]>([])
  const [animals, setAnimals] = useState<AnimalItem[]>([])
  const [collabs, setCollabs] = useState<CollaboratorItem[]>([])

  const [loadingOwners, setLoadingOwners] = useState(false)
  const [loadingAnimals, setLoadingAnimals] = useState(false)
  const [loadingCollabs, setLoadingCollabs] = useState(false)

  const controllerRef = useRef<AbortController | null>(null)
  const typingRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const showResults = useMemo(() => isOpen && query.length >= 2, [isOpen, query])

  const runSearch = async (q: string) => {
    if (controllerRef.current) controllerRef.current.abort()
    const ctrl = new AbortController()
    controllerRef.current = ctrl

    // Owners
    setLoadingOwners(true)
    fetch(`/api/owners/search?query=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((data) => setOwners(data.owners || []))
      .catch(() => setOwners([]))
      .finally(() => setLoadingOwners(false))

    // Animals
    setLoadingAnimals(true)
    fetch(`/api/animals/search?query=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((data) => setAnimals(data.animals || []))
      .catch(() => setAnimals([]))
      .finally(() => setLoadingAnimals(false))

    // Collaborators
    setLoadingCollabs(true)
    fetch(`/api/collaborators/search?query=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
      .then((data) => setCollabs(data.collaborators || []))
      .catch(() => setCollabs([]))
      .finally(() => setLoadingCollabs(false))
  }

  useEffect(() => {
    if (typingRef.current) clearTimeout(typingRef.current)
    if (query.length < 2) {
      setOwners([])
      setAnimals([])
      setCollabs([])
      return
    }
    typingRef.current = setTimeout(() => runSearch(query), 300)
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current)
      }
    }
  }, [query])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const Results = (
    <div
      className={cn(
        'mt-2 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl',
        'w-[560px] max-w-[90vw] max-h-[70vh] overflow-auto'
      )}
      role="listbox"
      aria-label="Résultats de recherche"
    >
      {/* Owners */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-gray-500">Propriétaires</div>
          <a href="/owners" className="text-xs text-green-700 dark:text-green-400 hover:underline">Voir tout</a>
        </div>
        {loadingOwners ? (
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="h-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </ul>
        ) : owners.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun résultat</div>
        ) : (
          <ul className="space-y-1">
            {owners.slice(0, 5).map((o) => (
              <li key={o.id}>
                <a href={`/owners/${o.id}`} className="relative flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-sm font-semibold">
                    {(o.first_name?.[0] || '') + (o.last_name?.[0] || '')}
                  </div>
                  <div className="min-w-0 flex-1 pr-6">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{o.first_name} {o.last_name}</div>
                    <div className="text-xs text-gray-500 break-all">{o.email || '—'}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">🐾 {typeof o.animals === 'number' ? (o.animals > 0 ? `${o.animals} animal${o.animals > 1 ? 's' : ''}` : 'Aucun animal') : '—'}</div>
                  </div>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Animals */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-gray-500">Animaux</div>
          <a href="/animals" className="text-xs text-green-700 dark:text-green-400 hover:underline">Voir tout</a>
        </div>
        {loadingAnimals ? (
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="h-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </ul>
        ) : animals.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun résultat</div>
        ) : (
          <ul className="space-y-1">
            {animals.slice(0, 5).map((a) => (
              <li key={a.id}>
                <a href={`/owners/${a.owner_id}`} className="relative flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-base">🐾</div>
                  <div className="min-w-0 flex-1 pr-6">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.name}</div>
                    <div className="text-xs text-gray-500">{a.species}</div>
                    {a.owner_name && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {a.owner_name}
                      </div>
                    )}
                  </div>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Collaborateurs */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-gray-500">Collaborateurs</div>
          <a href="/collaborators" className="text-xs text-green-700 dark:text-green-400 hover:underline">Voir tout</a>
        </div>
        {loadingCollabs ? (
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="h-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </ul>
        ) : collabs.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun résultat</div>
        ) : (
          <ul className="space-y-1">
            {collabs.slice(0, 5).map((c) => (
              <li key={c.id}>
                <div className="relative flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 text-sm font-semibold">
                    {(c.first_name?.[0] || '') + (c.last_name?.[0] || '') || <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1 pr-6">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.first_name} {c.last_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {c.role && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 text-[10px] uppercase tracking-wide">{c.role}</span>
                      )}
                      {c.email && (
                        <div className="text-xs text-gray-500 break-all">{c.email}</div>
                      )}
                    </div>
                  </div>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  return (
    <div className="relative" ref={containerRef}>
      {/* Desktop input */}
      <div className="hidden md:block min-w-[460px]">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher (propriétaires, animaux, collaborateurs)"
          onFocus={() => setIsOpen(true)}
          className="h-10 rounded-xl"
        />
        {showResults && (
          <div className="absolute right-0 z-40">{Results}</div>
        )}
      </div>

      {/* Mobile trigger */}
      <button
        type="button"
        className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Ouvrir la recherche"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <span>Rechercher</span>
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <button
              type="button"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Fermer"
              onClick={() => setIsMobileOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex-1">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Rechercher..."
                onFocus={() => setIsOpen(true)}
              />
            </div>
          </div>
          <div className="p-3">{Results}</div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearch


