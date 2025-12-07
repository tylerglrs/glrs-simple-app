import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { BottomTabBar } from "./BottomTabBar"
import { NavigationDrawer } from "./NavigationDrawer"
import { cn } from "@/lib/utils"

// Breakpoint for desktop sidebar
const DESKTOP_BREAKPOINT = 1024

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= DESKTOP_BREAKPOINT)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleRefresh = () => {
    // Trigger a page refresh or data reload
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {isDesktop && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          isDesktop && (sidebarCollapsed ? "lg:ml-16" : "lg:ml-64")
        )}
      >
        {/* Header */}
        <Header onRefresh={handleRefresh} />

        {/* Page Content */}
        <main className={cn("flex-1 p-4 lg:p-6", !isDesktop && "pb-20")}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {!isDesktop && <BottomTabBar onMoreClick={() => setMoreDrawerOpen(true)} />}

      {/* Mobile Navigation Drawer */}
      <NavigationDrawer open={moreDrawerOpen} onOpenChange={setMoreDrawerOpen} />
    </div>
  )
}

export default AppLayout
