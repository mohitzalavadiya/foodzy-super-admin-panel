'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <Card className="glass-card border-none shadow-3xl bg-white/90 dark:bg-zinc-900/90 overflow-hidden">
          <div className="h-2 bg-destructive/50 w-full" />
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 shadow-inner">
              <AlertCircle className="h-10 w-10 text-destructive animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
              System <span className="text-destructive">Alert</span>
            </CardTitle>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Unexpected execution failure
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center px-8 pb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-destructive/20 to-orange-500/20 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-zinc-50 dark:bg-zinc-950/50 border border-destructive/10 p-4 rounded-xl font-mono text-[10px] text-destructive/80 leading-relaxed overflow-auto max-h-40 break-all text-left shadow-inner">
                {error.message || 'Error authentication or data fetching failure detected.'}
                {error.digest && <div className="mt-2 opacity-50">Digest: {error.digest}</div>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button 
                onClick={() => reset()} 
                className="pill-button w-full h-12 bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'} 
                className="pill-button w-full h-12 border-zinc-200 dark:border-zinc-800 text-sm font-bold uppercase tracking-widest"
              >
                Return to Command Center
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
          Central Intelligence System • Error Logged
        </p>
      </div>
    </div>
  )

}
