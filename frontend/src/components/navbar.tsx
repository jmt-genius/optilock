import Logo from '@/components/ui/logo'
import Image from 'next/image'

// ... other imports ...

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="dydx" width={100} height={100} />
          <span className="font-bold">dydx</span>
        </div>
        {/* ... rest of your navbar code ... */}
      </div>
    </header>
  )
} 