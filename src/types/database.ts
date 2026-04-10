export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: 'customer' | 'owner' | 'super_admin'
  is_blocked: boolean
  created_at: string
}

export type Restaurant = {
  id: string
  name: string
  address: string | null
  phone: string | null
  status: 'pending' | 'approved' | 'rejected'
  image_url: string | null
  owner_id: string | null
  created_at: string
}

export type Category = {
  id: string
  name: string
  image_url: string | null
  created_at: string
}

export type Order = {
  id: string
  restaurant_id: string | null
  user_id: string | null
  total_amount: number
  status: string
  created_at: string
  restaurants?: {
    name: string
  }
  profiles?: {
    full_name: string | null
    email: string | null
  }
}
