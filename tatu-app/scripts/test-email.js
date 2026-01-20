const fs = require('fs')
const path = require('path')
const { Resend } = require('resend')

// Read .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      env[key] = value
    }
  })
  
  return env
}

async function testEmail() {
  const env = loadEnv()
  const apiKey = env.RESEND_API_KEY
  const fromEmail = env.EMAIL_FROM || 'TATU <noreply@tatufortattoos.com>'
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in .env.local')
    process.exit(1)
  }

  console.log('Testing Resend email configuration...')
  console.log('API Key:', apiKey.substring(0, 10) + '...')
  console.log('From:', fromEmail)
  console.log('')

  const resend = new Resend(apiKey)

  try {
    // Test sending to your own email
    const testEmail = 'pedronauta@gmail.com'
    console.log(`Sending test email to: ${testEmail}`)
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: 'Test Email from TATU',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    })

    if (result.error) {
      console.error('❌ Error sending email:')
      console.error(JSON.stringify(result.error, null, 2))
      process.exit(1)
    }

    console.log('✅ Email sent successfully!')
    console.log('Email ID:', result.data?.id)
    console.log('')
    console.log('Check your inbox at:', testEmail)
  } catch (error) {
    console.error('❌ Error:')
    console.error(error.message)
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2))
    }
    process.exit(1)
  }
}

testEmail()

