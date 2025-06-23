import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, User, Settings, LogOut, Menu } from "lucide-react";

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <header className="bg-white dark:bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Briefcase className="text-primary text-2xl mr-2" />
              <span className="text-2xl font-bold text-secondary dark:text-foreground">JobHub</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className={`text-gray-700 dark:text-gray-300 hover:text-primary font-medium ${location === '/' ? 'text-primary' : ''}`}>
                Jobs
              </Link>
              <Link href="/companies" className={`text-gray-700 dark:text-gray-300 hover:text-primary font-medium ${location === '/companies' ? 'text-primary' : ''}`}>
                Companies
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className={`text-gray-700 dark:text-gray-300 hover:text-primary font-medium ${location === '/dashboard' ? 'text-primary' : ''}`}>
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  className="text-primary hover:text-secondary"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Sign In
                </Button>
                <Button
                  className="btn-primary"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || 'User'} />
                      <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={() => window.location.href = '/api/logout'}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
