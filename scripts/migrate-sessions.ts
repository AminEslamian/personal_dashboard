import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => new Promise((resolve) => rl.question(query, resolve))

async function migrate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables. Make sure to run with --env-file=.env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('\n🚀 --- Personal Dashboard Data Migration --- 🚀\n')
  const email = await question('Enter your Supabase login email: ')
  const password = await question('Enter your Supabase password: ')

  console.log('\nAuthenticating...')
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    console.error('❌ Authentication failed:', authError.message)
    process.exit(1)
  }

  console.log('✅ Successfully logged in!\n')

  const dbPathStr = await question('Enter the absolute path to your old db.json file: ')
  const dbPath = path.resolve(dbPathStr.trim().replace(/^"|"$/g, '')) // remove quotes if user drags and drops file

  if (!fs.existsSync(dbPath)) {
    console.error(`❌ File not found at: ${dbPath}`)
    process.exit(1)
  }

  console.log(`\nReading data from ${dbPath}...`)
  const fileContent = fs.readFileSync(dbPath, 'utf-8')
  let sessions = []
  try {
    const data = JSON.parse(fileContent)
    // Handle both { sessions: [...] } format and direct array [...] format just in case
    sessions = Array.isArray(data) ? data : (data.sessions || [])
  } catch (err) {
    console.error('❌ Failed to parse JSON:', err)
    process.exit(1)
  }

  if (sessions.length === 0) {
    console.log('No sessions found to migrate.')
    process.exit(0)
  }

  console.log(`Found ${sessions.length} sessions. Preparing to upload to Supabase...`)

  // Prepare records for insert (stripping old local IDs so Supabase generates fresh ones)
  const records = sessions.map((s: any) => ({
    macro: s.macro,
    subject: s.subject,
    hours: s.hours,
    type: s.type,
    date: s.date
  }))

  const { error: insertError } = await supabase
    .from('sessions')
    .insert(records)

  if (insertError) {
    console.error('\n❌ Failed to migrate data:', insertError.message)
  } else {
    console.log(`\n✅ Migration completed successfully! ${sessions.length} records securely uploaded to your account.`)
  }

  rl.close()
}

migrate()
