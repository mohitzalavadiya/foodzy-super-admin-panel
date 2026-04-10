'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global settings and administrative preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Main configuration for the restaurant platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="site-name">Platform Name</Label>
              <Input id="site-name" defaultValue="DineDash Super Admin" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Support Email</Label>
              <Input id="contact-email" defaultValue="support@dinedash.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => toast.success("Settings saved")}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure when admins receive email alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Restaurant Registration</Label>
                <p className="text-sm text-muted-foreground italic">Notify when a new restaurant signs up.</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Large Order Alerts</Label>
                <p className="text-sm text-muted-foreground italic">Notify for orders over $500.</p>
              </div>
              <Button variant="outline" size="sm">Disabled</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Actions that cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting the platform data or resetting the database will result in permanent data loss.
            </p>
            <Button variant="destructive">Reset All Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
