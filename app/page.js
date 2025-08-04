// app/page.js
'use client'  // Add this line at the top

import { supabase } from '../lib/supabase'

export default function Home() {
  const testConnection = async () => {
    const { data, error } = await supabase.from('profiles').select('*')
    console.log('Supabase test:', { data, error })
  }

  return (
    <div>
      <h1>East End Racquet Club</h1>
      <button onClick={testConnection}>Test Supabase</button>
    </div>
  )
}