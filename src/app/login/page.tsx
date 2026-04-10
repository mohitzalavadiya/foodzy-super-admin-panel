'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError || profile?.role !== 'super_admin') {
        await supabase.auth.signOut()
        toast.error('Access denied. Super Admin role required.')
        return
      }

      toast.success('Login successful!')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 auth-gradient overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 mb-6">
            <span className="text-white font-black text-2xl italic tracking-tighter">AI</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none text-center">
            Admin <span className="text-primary italic">Intelligence</span>
          </h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 font-medium text-sm">
            Central Command for the Unified Platform
          </p>
        </div>

        <Card className="glass-card border-none shadow-3xl">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl font-bold">Secure Access</CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Enter credentials to continue
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="grid gap-5 py-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@platform.com"
                  className="soft-input font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Password</Label>
                  <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">Forgot Password?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="soft-input font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 pb-8">
              <Button className="pill-button w-full h-14 text-base shadow-xl shadow-primary/20" type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authenticate Session"}
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <span>Unauthorized access is prohibited</span>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <p className="mt-8 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Platform Version 2.4.0 • System Secure
        </p>
      </div>
    </div>
  )

}
