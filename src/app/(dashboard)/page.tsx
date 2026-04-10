import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OverviewCharts, GrowthChart } from '@/components/dashboard/overview-charts'
import { formatTime } from '@/lib/utils'

import { Users, Store, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, Activity } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Core Platform Metrics
  const [
    { count: usersCount },
    { count: restaurantsCount },
    { count: ordersCount },
    { count: pendingRestaurantsCount },
    { data: allOrders }, // For revenue and chart aggregation
    { data: allProfiles }, // For growth chart
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('restaurants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*').order('created_at', { ascending: true }),
    supabase.from('profiles').select('created_at').order('created_at', { ascending: true }),
  ])

  // 2. Transformed Analytics Data
  const orders = allOrders || []
  const profiles = allProfiles || []
  
  // Calculate Total Revenue
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0)

  // Generate Chart Data (Last 6 Months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return {
      name: monthNames[d.getMonth()],
      month: d.getMonth(),
      year: d.getFullYear(),
      total: 0
    }
  }).reverse()

  orders.forEach(order => {
    const d = new Date(order.created_at)
    const monthData = chartData.find(m => m.month === d.getMonth() && m.year === d.getFullYear())
    if (monthData) {
      monthData.total += (order.total_amount || 0)
    }
  })

  // Generate Growth Data (Last 5 Weeks)
  const growthData = Array.from({ length: 5 }, (_, i) => {
    const start = new Date()
    start.setDate(start.getDate() - (i + 1) * 7)
    const end = new Date()
    end.setDate(end.getDate() - i * 7)
    
    return {
      name: `Week ${5 - i}`,
      start,
      end,
      users: profiles.filter(p => {
        const d = new Date(p.created_at)
        return d >= start && d < end
      }).length,
      orders: orders.filter(o => {
        const d = new Date(o.created_at)
        return d >= start && d < end
      }).length
    }
  }).reverse()

  // 3. Recent Orders Feed (Manual Join Pattern)
  const recentRawOrders = orders.slice(-5).reverse()
  const recentUserIds = [...new Set(recentRawOrders.map(o => o.user_id || o.customer_id).filter(Boolean))]
  const recentRestaurantIds = [...new Set(recentRawOrders.map(o => o.restaurant_id).filter(Boolean))]

  const [recentProfilesRes, recentRestaurantsRes] = await Promise.all([
    recentUserIds.length > 0 ? supabase.from('profiles').select('id, full_name, email').in('id', recentUserIds) : Promise.resolve({ data: [] }),
    recentRestaurantIds.length > 0 ? supabase.from('restaurants').select('id, name').in('id', recentRestaurantIds) : Promise.resolve({ data: [] })
  ])

  const profilesMap = Object.fromEntries((recentProfilesRes.data || []).map(p => [p.id, p]))
  const restaurantsMap = Object.fromEntries((recentRestaurantsRes.data || []).map(r => [r.id, r]))

  const recentOrdersFeed = recentRawOrders.map(order => ({
    ...order,
    profiles: profilesMap[order.user_id || order.customer_id],
    restaurants: restaurantsMap[order.restaurant_id]
  }))

  // 4. Intelligence Logic
  // Top Performer (Restaurant with most revenue)
  const restaurantRevenue: Record<string, number> = {}
  orders.forEach(o => {
    if (o.restaurant_id) {
      restaurantRevenue[o.restaurant_id] = (restaurantRevenue[o.restaurant_id] || 0) + (o.total_amount || 0)
    }
  })
  const topRestaurantEntries = Object.entries(restaurantRevenue).sort((a, b) => b[1] - a[1])
  const topRestaurantId = topRestaurantEntries[0]?.[0]
  
  // We need the name of the top performer. If it's not in the recent list, we might need a quick fetch
  let topPerformerName = recentRestaurantsRes.data?.find(r => r.id === topRestaurantId)?.name
  if (!topPerformerName && topRestaurantId) {
    const { data: topRes } = await supabase.from('restaurants').select('name').eq('id', topRestaurantId).single()
    topPerformerName = topRes?.name
  }

  const stats = [
    { 
      title: 'Total Revenue', 
      value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
      icon: DollarSign, 
      trend: '+12.5% from last month', 
      variant: 'default' 
    },
    { 
      title: 'Total Users', 
      value: usersCount?.toString() || '0', 
      icon: Users, 
      trend: `+${profiles.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} since last week`, 
      variant: 'secondary' 
    },
    { 
      title: 'Restaurants', 
      value: restaurantsCount?.toString() || '0', 
      icon: Store, 
      trend: `${pendingRestaurantsCount || 0} pending approval`, 
      variant: 'outline' 
    },
    { 
      title: 'Active Orders', 
      value: ordersCount?.toString() || '0', 
      icon: ShoppingBag, 
      trend: `+${orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length} today`, 
      variant: 'default' 
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Control Center</h1>
          <p className="text-muted-foreground text-lg">Real-time platform performance and administrative highlights.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end px-4 border-r">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">System Status</span>
            <span className="text-green-500 font-bold flex items-center gap-1">
              <Activity className="h-3 w-3 animate-pulse" /> Operational
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card p-1 shadow-sm border">
            <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground shadow-sm">Real-time</button>
            <button className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors">Historical</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden group hover:border-primary/50 transition-colors shadow-none border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter">{stat.value}</div>

              <p className="text-xs text-muted-foreground mt-2 flex items-center font-medium">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500 font-bold">{stat.trend.split(' ')[0]}</span>
                <span className="ml-1">{stat.trend.split(' ').slice(1).join(' ')}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-2 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Revenue Projections</CardTitle>
                <CardDescription>Estimated revenue trends based on consolidated platform sales.</CardDescription>
              </div>
              <Badge variant="outline" className="font-bold">Last 6 Months</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <OverviewCharts data={chartData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-2 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Registration Growth</CardTitle>
                <CardDescription>Onboarding velocity for users and store owners.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <GrowthChart data={growthData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Global Transaction Feed</CardTitle>
              <CardDescription>Live monitoring of latest customer purchases.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="font-bold gap-1">
              View All <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrdersFeed?.map((order: any) => (
                <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-black text-primary text-sm shadow-inner">
                    {order.restaurants?.name?.charAt(0) || 'R'}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold leading-none">{order.profiles?.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground font-medium">{order.restaurants?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary tracking-tighter">${order.total_amount?.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{formatTime(order.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-2 shadow-none bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-xl font-black">Admin Intelligence</CardTitle>
            <CardDescription className="text-primary-foreground/70">Actionable insights generated from platform activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Top Performer</p>
              <h4 className="text-lg font-bold mt-1">{topPerformerName || 'Awaiting Data'}</h4>
              <p className="text-sm opacity-80">Leading store by consolidated revenue volume.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Alert</p>
              <h4 className="text-lg font-bold mt-1">Pending Approvals</h4>
              <p className="text-sm opacity-80">{pendingRestaurantsCount || 0} new restaurants are waiting for your verification.</p>
            </div>
            <Button variant="secondary" className="w-full font-bold shadow-lg">Run System Diagnostics</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
