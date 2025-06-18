import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { 
  Briefcase, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  ChevronDown,
  User,
  Settings,
  LogOut,
  Plus,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'employer': return '/employer';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-linkedin-blue rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-linkedin-blue dark:text-white">
                  JobPortal
                </div>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4 md:mx-8 hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Navigation Links */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-2">
                <Link href="/jobs">
                  <Button 
                    variant={location === '/jobs' ? 'default' : 'ghost'} 
                    size="sm"
                  >
                    Jobs
                  </Button>
                </Link>
                
                {user?.role === 'employer' && (
                  <Link href="/post-job">
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="hidden xl:inline">Post Job</span>
                    </Button>
                  </Link>
                )}
                
                <Link href={getDashboardPath()}>
                  <Button 
                    variant={location.startsWith('/dashboard') || location.startsWith('/admin') || location.startsWith('/employer') ? 'default' : 'ghost'} 
                    size="sm"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    <span className="hidden xl:inline">Dashboard</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Language Toggle */}
            <Button variant="ghost" size="sm" className="hidden lg:flex">
              <Globe className="h-4 w-4 mr-1" />
              <span className="hidden xl:inline">EN</span>
            </Button>

            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                  >
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profilePicture ?? undefined} />
                        <AvatarFallback className="bg-linkedin-blue text-white">
                          {user?.fullName ? getInitials(user.fullName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-gray-700 dark:text-gray-300 font-medium">
                        {user?.fullName || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardPath()}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative sm:hidden">
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </form>
              
              {isAuthenticated && (
                <div className="space-y-2">
                  <Link href="/jobs">
                    <Button 
                      variant={location === '/jobs' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Jobs
                    </Button>
                  </Link>
                  
                  {user?.role === 'employer' && (
                    <Link href="/post-job">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Post Job
                      </Button>
                    </Link>
                  )}
                  
                  <Link href={getDashboardPath()}>
                    <Button 
                      variant={location.startsWith('/dashboard') || location.startsWith('/admin') || location.startsWith('/employer') ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
              
              {!isAuthenticated && (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button 
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
