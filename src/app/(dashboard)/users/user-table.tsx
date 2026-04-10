'use client'

import { MoreHorizontal, Search, UserX, UserCheck } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { toggleUserBlock } from '@/app/actions'
import { toast } from 'sonner'
import { Profile } from '@/types/database'
import { DashboardPagination } from '@/components/dashboard/pagination'

export default function UserTable({ 
  initialUsers, 
  currentPage, 
  totalPages,
  totalCount
}: { 
  initialUsers: Profile[]
  currentPage: number
  totalPages: number
  totalCount: number
}) {
  const [search, setSearch] = useState('')
  const [isPendingAction, setIsPendingAction] = useState(false)
  const [isPendingTransition, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/users?${params.toString()}`)
  }

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    setIsPendingAction(true)
    try {
      await toggleUserBlock(userId, isBlocked)
      toast.success(isBlocked ? 'User unblocked' : 'User blocked')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setIsPendingAction(false)
    }
  }



  const filteredUsers = initialUsers.filter(user => 
    !search || 
    user.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
          Total: {totalCount}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">User</TableHead>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Joined</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className={isPendingAction ? 'opacity-50 pointer-events-none' : ''}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.full_name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role === 'super_admin' ? 'default' : user.role === 'owner' ? 'outline' : 'secondary'}
                      className="capitalize"
                    >
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_blocked ? 'destructive' : 'default'}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 p-0 hover:bg-muted font-normal")}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>



                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Control Center</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => handleToggleBlock(user.id, user.is_blocked)}>
                            {user.is_blocked ? (
                              <><UserCheck className="mr-2 h-4 w-4 text-green-500" /> Unblock Access</>
                            ) : (
                              <><UserX className="mr-2 h-4 w-4 text-red-500" /> Block Access</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DashboardPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/users"
        searchParams={Object.fromEntries(searchParams.entries())}
      />
    </div>
  )
}
