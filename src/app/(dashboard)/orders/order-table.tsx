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
import { cn, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Search, Eye, FileText } from 'lucide-react'
import { Order } from '@/types/database'
import { DashboardPagination } from '@/components/dashboard/pagination'

export default function OrderTable({ 
  initialOrders, 
  currentPage, 
  totalPages,
  totalCount
}: { 
  initialOrders: Order[]
  currentPage: number
  totalPages: number
  totalCount: number
}) {
  const [search, setSearch] = useState('')
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
    router.push(`/orders?${params.toString()}`)
  }

  const filteredOrders = initialOrders.filter(order => 
    !search || 
    order.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    order.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
    order.restaurants?.name?.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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
              <TableHead className="font-bold">Order ID</TableHead>
              <TableHead className="font-bold">Restaurant</TableHead>
              <TableHead className="font-bold">Customer</TableHead>
              <TableHead className="font-bold">Amount</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold">
                    {order.id?.slice(0, 12)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.restaurants?.name || 'Unknown Restaurant'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.profiles?.full_name || 'Anonymous'}</span>
                      <span className="text-[10px] text-muted-foreground">{order.profiles?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ${order.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'completed' ? 'default' : 
                      order.status === 'cancelled' ? 'destructive' : 
                      'outline'
                    } className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-8 w-8 p-0 font-normal")}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>



                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Order Options</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" /> Generate Invoice
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
        baseUrl="/orders"
        searchParams={Object.fromEntries(searchParams.entries())}
      />
    </div>
  )
}
