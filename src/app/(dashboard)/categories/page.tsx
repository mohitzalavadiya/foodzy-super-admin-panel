import { createClient } from '@/utils/supabase/server'
import CategoryList from './category-list'

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch categories')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
        <p className="text-muted-foreground">Create and manage restaurant categories across the platform.</p>
      </div>

      <CategoryList initialCategories={categories || []} />
    </div>
  )
}
