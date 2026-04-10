import { createClient } from '@/utils/supabase/server'
import OrderTable from './order-table'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page, search } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const offset = (currentPage - 1) * pageSize

  const supabase = await createClient()
  
  // 1. Pre-search profiles and restaurants for name matches if a search exists
  let matchedUserIds: string[] = []
  let matchedRestaurantIds: string[] = []
  const isUuid = search ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search) : false

  if (search && !isUuid) {
    const [profilesSearch, restaurantsSearch] = await Promise.all([
      supabase.from('profiles').select('id').ilike('full_name', `%${search}%`),
      supabase.from('restaurants').select('id').ilike('name', `%${search}%`)
    ])
    matchedUserIds = (profilesSearch.data || []).map(p => p.id)
    matchedRestaurantIds = (restaurantsSearch.data || []).map(r => r.id)
  }

  // 2. Build the Orders query
  let ordersQuery = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    if (isUuid) {
      ordersQuery = ordersQuery.eq('id', search)
    } else if (matchedUserIds.length > 0 || matchedRestaurantIds.length > 0) {
      const filters = []
      if (matchedUserIds.length > 0) filters.push(`user_id.in.(${matchedUserIds.join(',')})`, `customer_id.in.(${matchedUserIds.join(',')})`)
      if (matchedRestaurantIds.length > 0) filters.push(`restaurant_id.in.(${matchedRestaurantIds.join(',')})`)
      
      if (filters.length > 0) {
        ordersQuery = ordersQuery.or(filters.join(','))
      }
    } else {
      // If none match and it's not a UUID, return no results
      ordersQuery = ordersQuery.eq('id', '00000000-0000-0000-0000-000000000000') 
    }
  }

  const { data: rawOrders, error: ordersError, count } = await ordersQuery.range(offset, offset + pageSize - 1)

  if (ordersError) {
    console.error('Fetch Orders Error:', ordersError)
    throw new Error(`Failed to fetch orders: ${ordersError.message}`)
  }

  const orders = rawOrders || []

  // 2. Extract IDs for manual join
  // Prefer user_id, fallback to customer_id if user_id is not present
  const userIds = [...new Set(orders.map(o => o.user_id || o.customer_id).filter(Boolean))] as string[]
  const restaurantIds = [...new Set(orders.map(o => o.restaurant_id).filter(Boolean))] as string[]

  // 3. Fetch related data in parallel
  const [profilesRes, restaurantsRes] = await Promise.all([
    userIds.length > 0 
      ? supabase.from('profiles').select('id, full_name, email').in('id', userIds)
      : Promise.resolve({ data: [] }),
    restaurantIds.length > 0
      ? supabase.from('restaurants').select('id, name').in('id', restaurantIds)
      : Promise.resolve({ data: [] })
  ])

  // 4. Map the data back together
  const profilesMap = Object.fromEntries((profilesRes.data || []).map(p => [p.id, p]))
  const restaurantsMap = Object.fromEntries((restaurantsRes.data || []).map(r => [r.id, r]))

  const initialOrders = orders.map(order => {
    const userId = order.user_id || order.customer_id
    return {
      ...order,
      profiles: userId ? profilesMap[userId] : null,
      restaurants: order.restaurant_id ? restaurantsMap[order.restaurant_id] : null
    }
  })

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">Monitor all platform transactions and delivery statuses.</p>
      </div>

      <OrderTable 
        initialOrders={initialOrders as any} 
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  )
}
