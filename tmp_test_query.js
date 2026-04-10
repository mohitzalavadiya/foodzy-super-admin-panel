import { createClient } from './src/utils/supabase/server.js'

async function testFetch() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      restaurants ( name ),
      profiles ( full_name, email )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 9)

  if (error) {
    console.error('SUPABASE ERROR:', error)
  } else {
    console.log('SUCCESS:', data.length, 'orders fetched')
  }
}

testFetch()
