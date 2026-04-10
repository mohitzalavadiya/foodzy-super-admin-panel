'use client'

import { useState } from 'react'
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
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal, Search, CheckCircle, XCircle } from 'lucide-react'
import { updateRestaurantStatus } from '@/app/actions'
import { toast } from 'sonner'
import { Restaurant } from '@/types/database'
import { DashboardPagination } from '@/components/dashboard/pagination'

export default function RestaurantTable({ 
  initialRestaurants, 
  currentPage, 
  totalPages,
  totalCount
}: { 
  initialRestaurants: Restaurant[]
  currentPage: number
  totalPages: number
  totalCount: number
}) {
  const [search, setSearch] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null)
  
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
    router.push(`/restaurants?${params.toString()}`)
  }

  const handleStatusUpdate = async () => {
    if (!selectedRestaurant || !dialogType) return

    setIsPending(true)
    const newStatus = dialogType === 'approve' ? 'approved' : 'rejected'
    
    try {
      await updateRestaurantStatus(selectedRestaurant.id, newStatus)
      toast.success(`Restaurant ${newStatus} successfully`)
      setSelectedRestaurant(null)
      setDialogType(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setIsPending(false)
    }
  }

  const filteredRestaurants = initialRestaurants.filter(res => 
    !search || 
    res.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
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
              <TableHead className="font-bold">Restaurant</TableHead>
              <TableHead className="font-bold">Location</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Joined</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRestaurants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No restaurants found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRestaurants.map((res) => (
                <TableRow key={res.id} className={isPending ? 'opacity-50 pointer-events-none' : ''}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{res.name}</span>
                      <span className="text-xs text-muted-foreground">{res.address}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {res.owner_id?.slice(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      res.status === 'approved' ? 'default' : 
                      res.status === 'rejected' ? 'destructive' : 
                      'outline'
                    }>
                      {res.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(res.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 p-0 font-normal")}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>



                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Control Center</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedRestaurant(res)
                            setDialogType('approve')
                          }}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedRestaurant(res)
                            setDialogType('reject')
                          }}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
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
        baseUrl="/restaurants"
        searchParams={Object.fromEntries(searchParams.entries())}
      />

      <Dialog open={!!selectedRestaurant} onOpenChange={(open) => !open && setSelectedRestaurant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogType === 'approve' ? 'Approve' : 'Reject'} Restaurant</DialogTitle>
            <DialogDescription>
              Are you sure you want to {dialogType} <strong>{selectedRestaurant?.name}</strong>?
              This action can be reversed later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRestaurant(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button 
              variant={dialogType === 'approve' ? 'default' : 'destructive'} 
              onClick={handleStatusUpdate}
              disabled={isPending}
            >
              Confirm {dialogType === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
