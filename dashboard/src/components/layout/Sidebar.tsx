import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Brain,
  FlaskConical,
  SlidersHorizontal,
  Scale,
  Bell,
  History,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Item Inspector', href: '/inspector', icon: Search },
  { name: 'Ask AI', href: '/ask-ai', icon: Brain },
  { name: 'Impact Preview', href: '/impact', icon: FlaskConical },
  { name: 'Manual Controls', href: '/controls', icon: SlidersHorizontal },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const settingsSubItems = [
  { name: 'Alerts', href: '/settings/alerts', icon: Bell },
  { name: 'Audit Logs', href: '/settings/audit', icon: History },
  { name: 'Integrations', href: '/settings/integrations', icon: Plug },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const location = useLocation();

  // Auto-expand settings if we're on a settings sub-route
  const isSettingsRoute = location.pathname.startsWith('/settings');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg text-sidebar-accent-foreground tracking-tight">
              ReSights
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = item.name === 'Settings' 
              ? isSettingsRoute 
              : location.pathname === item.href;
            const isSettings = item.name === 'Settings';
            
            return (
              <li key={item.name}>
                {isSettings ? (
                  <>
                    <button
                      onClick={() => setSettingsExpanded(!settingsExpanded)}
                      className={cn(
                        'sidebar-item group w-full',
                        isActive && 'active',
                        collapsed && 'justify-center px-0'
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          'w-5 h-5 flex-shrink-0 transition-colors',
                          isActive ? 'text-sidebar-primary' : 'text-sidebar-muted group-hover:text-sidebar-accent-foreground'
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1 text-left">{item.name}</span>
                          <ChevronRight className={cn(
                            'w-4 h-4 transition-transform',
                            (settingsExpanded || isSettingsRoute) && 'rotate-90'
                          )} />
                        </>
                      )}
                    </button>
                    {!collapsed && (settingsExpanded || isSettingsRoute) && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {settingsSubItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.href;
                          return (
                            <li key={subItem.name}>
                              <NavLink
                                to={subItem.href}
                                className={cn(
                                  'sidebar-item group text-sm',
                                  isSubActive && 'active'
                                )}
                              >
                                <subItem.icon
                                  className={cn(
                                    'w-4 h-4 flex-shrink-0 transition-colors',
                                    isSubActive ? 'text-sidebar-primary' : 'text-sidebar-muted group-hover:text-sidebar-accent-foreground'
                                  )}
                                />
                                <span className="truncate">{subItem.name}</span>
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.href}
                    className={cn(
                      'sidebar-item group',
                      isActive && 'active',
                      collapsed && 'justify-center px-0'
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition-colors',
                        isActive ? 'text-sidebar-primary' : 'text-sidebar-muted group-hover:text-sidebar-accent-foreground'
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-all',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
