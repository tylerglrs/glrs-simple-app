import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  X,
  BookOpen,
  Briefcase,
  Heart,
  Users,
  ShieldAlert,
  Phone,
  MapPin,
} from 'lucide-react'
import { useResourcesData } from '../hooks/useResources'
import { CategoryGrid } from './CategoryGrid'
import { ResourceList } from './ResourceList'
import { useModalStore } from '@/stores/modalStore'
import { haptics } from '@/lib/animations'
import type { ResourceWithProgress } from '../hooks/useResources'

// Tab icon mapping
const tabIcons: Record<string, typeof BookOpen> = {
  BookOpen: BookOpen,
  Briefcase: Briefcase,
  Heart: Heart,
  Users: Users,
  ShieldAlert: ShieldAlert,
}

export function ResourcesTab() {
  const {
    filteredResources,
    categoryCounts,
    selectedCategory,
    setSelectedCategory,
    selectedTab,
    setSelectedTab,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    isLoading,
    categories,
    tabs,
  } = useResourcesData()

  const { openModal } = useModalStore()

  const handleResourceClick = (resource: ResourceWithProgress) => {
    openModal('resourceViewer', { resource })
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setFilterType('all')
    setSearchQuery('')
  }

  const hasActiveFilters = selectedCategory || filterType !== 'all' || searchQuery

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="w-full h-auto p-1 grid grid-cols-5 bg-muted/50">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab.icon] || BookOpen
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 px-1 text-xs md:text-sm',
                    'data-[state=active]:bg-background data-[state=active]:shadow-sm'
                  )}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.label.split(' ')[0] === 'My' ? 'Library' : tab.label.split(' ')[0]}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container p-4 space-y-4 pb-20">
          {/* Crisis Toolkit - Quick Actions (only visible on crisis tab) */}
          {selectedTab === 'crisis' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {/* Crisis Hotline */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <a
                      href="tel:988"
                      onClick={() => haptics.tap()}
                      className="flex flex-col items-start"
                    >
                      <div className="p-2 rounded-full bg-white/20 mb-2">
                        <Phone className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-sm">Crisis Hotline</span>
                      <span className="text-xs opacity-90">988 - 24/7 support</span>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Find a Meeting */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <button
                      onClick={() => {
                        haptics.tap()
                        window.location.href = '/community'
                      }}
                      className="flex flex-col items-start text-left w-full"
                    >
                      <div className="p-2 rounded-full bg-white/20 mb-2">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-sm">Find a Meeting</span>
                      <span className="text-xs opacity-90">Connect with others</span>
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Description */}
          <div className="text-center pb-2">
            <p className="text-sm text-muted-foreground">
              Curated recovery resources, tools, and educational content to support your journey
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filter Button / Select */}
            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as typeof filterType)}
              >
                <SelectTrigger className="w-[130px] h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="worksheet">Worksheets</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                  <SelectItem value="tool">Tools</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Category Grid (only on Library tab and when no category selected) */}
          {selectedTab === 'library' && !selectedCategory && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Browse by Category</h2>
              <CategoryGrid
                categories={categories}
                counts={categoryCounts}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>
          )}

          {/* Selected Category Header */}
          {selectedCategory && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <span className="text-sm text-muted-foreground">
                  Showing: {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
              </span>
            </div>
          )}

          {/* Resource List */}
          <ResourceList
            resources={filteredResources}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onResourceClick={handleResourceClick}
            emptyTitle={
              selectedTab === 'crisis'
                ? 'No Crisis Resources Yet'
                : searchQuery
                ? 'No matching resources'
                : 'No resources available'
            }
            emptyDescription={
              selectedTab === 'crisis'
                ? 'Crisis resources will appear here as they become available. Use the Quick Tools above for immediate support.'
                : searchQuery
                ? 'Try adjusting your search or filters.'
                : 'Check back later for new resources.'
            }
          />
        </div>
      </div>
    </div>
  )
}

export default ResourcesTab
