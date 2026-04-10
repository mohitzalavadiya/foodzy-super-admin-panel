import { createClient } from '@/utils/supabase/server'
import RestaurantTable from './restaurant-table'

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page, search } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const offset = (currentPage - 1) * pageSize

  const supabase = await createClient()
  
  let query = supabase
    .from('restaurants')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: restaurants, error, count } = await query

  if (error) {
    throw new Error('Failed to fetch restaurants')
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Restaurant Management</h1>
        <p className="text-muted-foreground">Approve or reject new restaurant registrations on the platform.</p>
      </div>

      <RestaurantTable 
        initialRestaurants={restaurants || []} 
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  )
}
