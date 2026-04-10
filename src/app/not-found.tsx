import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Compass, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-6 auth-gradient overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <Card className="glass-card border-none shadow-3xl bg-white/90 dark:bg-zinc-900/90 overflow-hidden text-center">
          <div className="h-2 bg-primary/50 w-full" />
          <CardHeader className="pt-8 pb-4">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
              <Compass className="h-10 w-10 text-primary animate-spin-slow" />
            </div>
            <CardTitle className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
              404
            </CardTitle>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Coordinates Not Found
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              The requested resource is outside the platform's current intelligence mapping.
            </p>
            
            <Button asChild className="pill-button w-full h-14 bg-primary text-white shadow-xl shadow-primary/20">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Return to Session
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
          Central Intelligence System • Sector Missing
        </p>
      </div>
    </div>
  )
}

