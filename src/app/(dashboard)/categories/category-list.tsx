'use client'

import { useState } from 'react'
import { Plus, Trash2, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { deleteCategory } from '@/app/actions'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Category } from '@/types/database'
import Image from 'next/image'

export default function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', image_url: '' })
  const [isPending, setIsPending] = useState(false)
  const supabase = createClient()

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory])

      if (error) throw error
      
      toast.success('Category added')
      setIsAddOpen(false)
      setNewCategory({ name: '', image_url: '' })
      // Since it's a server component parent, we might need a router.refresh() 
      // but if we use a server action it would be better. For now...
      window.location.reload() 
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    setIsPending(true)
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPending(false)
    }
  }

  const filteredCategories = initialCategories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search categories..." 
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>

          <DialogContent className="p-0 border-none overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <DialogHeader className="p-8 pb-4 text-left">
              <DialogTitle className="text-2xl font-black tracking-tight uppercase">Add <span className="text-primary italic">Category</span></DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">
                Central Intelligence Asset Registry
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="px-8 pb-8 space-y-6">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Category Designation</label>
                  <Input 
                    placeholder="e.g. Italian, Desserts, Japanese" 
                    className="soft-input font-bold"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Visual Resource URL (Optional)</label>
                  <Input 
                    placeholder="https://images.unsplash.com/..." 
                    className="soft-input font-medium text-xs"
                    value={newCategory.image_url}
                    onChange={(e) => setNewCategory({...newCategory, image_url: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isPending} className="pill-button w-full h-14 bg-primary text-white shadow-xl shadow-primary/20 text-sm font-bold uppercase tracking-widest">
                  {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Deployment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>

        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden group">
            <div className="relative aspect-video w-full bg-muted">
              {category.image_url ? (
                <Image 
                  src={category.image_url} 
                  alt={category.name} 
                  className="object-cover transition-transform group-hover:scale-105"
                  fill
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => handleDelete(category.id)}
                  disabled={isPending}
                  className="h-7 w-7"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>

              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Created {new Date(category.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
