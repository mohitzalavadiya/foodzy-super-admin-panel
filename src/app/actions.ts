'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Users Actions
export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: !isBlocked })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/users')
  return { success: true }
}

// Restaurant Actions
export async function updateRestaurantStatus(restaurantId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('restaurants')
    .update({ status })
    .eq('id', restaurantId)

  if (error) throw new Error(error.message)

  revalidatePath('/restaurants')
  return { success: true }
}



// Category Actions

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) throw new Error(error.message)

  revalidatePath('/categories')
  return { success: true }
}
