import { createClient } from '@/utils/supabase/server'
import UserTable from './user-table'

export default async function UsersPage({
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
    .from('profiles')
    .select('*', { count: 'exact' })
    .neq('role', 'super_admin')
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: users, error, count } = await query

  if (error) {
    throw new Error('Failed to fetch users')
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage all customers and restaurant owners on the platform.</p>
      </div>

      <UserTable 
        initialUsers={users || []} 
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={count || 0}
      />
    </div>
  )
}
