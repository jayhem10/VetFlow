'use client'

import { useState } from 'react'
import { Search, MessageCircle, BarChart3, HelpCircle, ExternalLink, ChevronRight, Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { helpCategories, type HelpCategory, type HelpArticle } from '@/data/help-articles'

const ContactFloatingButton = () => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href="/contact"
      className={cn(
        "fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50",
        "flex items-center gap-3",
        isHovered ? "pr-6" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MessageCircle className="h-6 w-6 flex-shrink-0" />
      {isHovered && (
        <span className="text-sm font-medium whitespace-nowrap">
          Contactez-nous
        </span>
      )}
    </a>
  )
}

export default function HelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState('getting-started')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeArticle, setActiveArticle] = useState<string | null>(null)

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || searchQuery === '')

  // Pour la recherche, collecter tous les articles correspondants de toutes les catégories
  const allFilteredArticles = helpCategories.flatMap(category => 
    category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(article => ({ ...article, categoryTitle: category.title, categoryIcon: category.icon }))
  )

  const currentCategory = filteredCategories.find(cat => cat.id === activeCategory)
  const currentArticle = currentCategory?.articles.find(art => art.id === activeArticle)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Centre d'aide VetFlow
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Trouvez rapidement les réponses à vos questions et apprenez à tirer le meilleur parti de VetFlow
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Navigation des catégories */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Catégories
              </h2>
              <nav className="space-y-2">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id)
                      setActiveArticle(null)
                      setSearchQuery('')
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                      activeCategory === category.id && !searchQuery
                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    {category.icon}
                    <div>
                      <div className="font-medium">{category.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {category.articles.length} article{category.articles.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {searchQuery && searchQuery.length > 0 ? (
              /* Vue recherche - Articles en pêle-mêle */
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Résultats de recherche
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {allFilteredArticles.length} article{allFilteredArticles.length > 1 ? 's' : ''} trouvé{allFilteredArticles.length > 1 ? 's' : ''} pour "{searchQuery}"
                  </p>
                </div>

                {allFilteredArticles.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <HelpCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun résultat trouvé</h3>
                    <p className="text-gray-600 dark:text-gray-400">Essayez avec des mots-clés différents</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {allFilteredArticles.map((article) => (
                      <div key={`${article.id}-search`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                        {/* En-tête article */}
                        <div className="flex items-center gap-3 mb-4">
                          {article.categoryIcon}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{article.categoryTitle}</span>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{article.title}</h2>
                            {article.popular && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                                Populaire
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{article.description}</p>
                        
                        {/* Contenu de l'article */}
                        <div className="prose prose-gray dark:prose-invert max-w-none">
                          {article.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : !activeArticle ? (
              /* Vue catégorie normale */
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                {currentCategory && (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      {currentCategory.icon}
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {currentCategory.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                          {currentCategory.description}
                        </p>
                      </div>
                    </div>

                    {/* Articles populaires */}
                    {currentCategory.articles.some(art => art.popular) && (
                      <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-orange-500" />
                          Articles populaires
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                          {currentCategory.articles
                            .filter(article => article.popular)
                            .map((article) => (
                              <button
                                key={article.id}
                                onClick={() => setActiveArticle(article.id)}
                                className="text-left p-4 border border-orange-200 dark:border-orange-800 rounded-lg hover:border-orange-300 dark:hover:border-orange-700 transition-colors bg-orange-50 dark:bg-orange-900/10"
                              >
                                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                  {article.title}
                                  <ExternalLink className="h-4 w-4 text-orange-500" />
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {article.description}
                                </p>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Tous les articles */}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tous les articles
                      </h2>
                      <div className="space-y-3">
                        {currentCategory.articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => setActiveArticle(article.id)}
                            className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                  {article.title}
                                  {article.popular && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                                      Populaire
                                    </span>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {article.description}
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Vue article détaillé */
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                {currentArticle && (
                  <>
                    {/* Navigation */}
                    <button
                      onClick={() => setActiveArticle(null)}
                      className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 mb-6 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 transform rotate-180" />
                      Retour à {currentCategory?.title}
                    </button>

                    {/* Article */}
                    <article>
                      <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                          {currentArticle.title}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                          {currentArticle.description}
                        </p>
                      </header>

                      <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                        {currentArticle.content}
                      </div>
                    </article>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de contact flottant */}
      <ContactFloatingButton />
    </div>
  )
}