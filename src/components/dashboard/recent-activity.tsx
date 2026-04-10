import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity() {
  // Mock data for now
  const activities = [
    {
      user: "Olivia Martin",
      email: "olivia.martin@email.com",
      action: "New restaurant registered",
      time: "Just now",
      amount: "+$1,999.00",
      initials: "OM"
    },
    {
      user: "Jackson Lee",
      email: "jackson.lee@email.com",
      action: "Order #4521 completed",
      time: "2 minutes ago",
      amount: "+$39.00",
      initials: "JL"
    },
    {
      user: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
      action: "New user signed up",
      time: "5 minutes ago",
      amount: "+$299.00",
      initials: "IN"
    },
    {
      user: "William Kim",
      email: "will@email.com",
      action: "Restaurant 'Spice Hut' approved",
      time: "10 minutes ago",
      amount: "+$99.00",
      initials: "WK"
    },
    {
      user: "Sofia Davis",
      email: "sofia.davis@email.com",
      action: "New review posted",
      time: "30 minutes ago",
      amount: "+$39.00",
      initials: "SD"
    },
  ]

  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div className="flex items-center" key={index}>
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {activity.initials}
          </div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.user}</p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">{activity.time}</div>
        </div>
      ))}
    </div>
  )
}
