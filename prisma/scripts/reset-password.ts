/**
 * ============================================================
 *  RESET ADMIN PASSWORD SCRIPT
 *  Run: npx tsx prisma/scripts/reset-password.ts
 * ============================================================
 */

import { PrismaClient } from '../../src/generated/prisma'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

function prompt(q: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(r => rl.question(q, a => { rl.close(); r(a.trim()) }))
}

async function main() {
  console.log('\n╔═══════════════════════════════════════╗')
  console.log('║  Glow Medical — Reset Admin Password  ║')
  console.log('╚═══════════════════════════════════════╝\n')

  const email = await prompt('Admin email: ')
  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } })

  if (!admin) {
    console.error(`\n✗ No admin found with email: ${email}\n`)
    process.exit(1)
  }

  console.log(`\n✓ Found: ${admin.name} (${admin.role})`)

  const newPass = await prompt('New password (min 8 chars): ')
  const confirm = await prompt('Confirm new password:       ')

  if (newPass !== confirm) { console.error('\n✗ Passwords do not match\n');  process.exit(1) }
  if (newPass.length < 8)  { console.error('\n✗ Password too short (min 8)\n'); process.exit(1) }

  const hash = await bcrypt.hash(newPass, 12)
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: hash } })

  console.log('\n✅ Password updated successfully!\n')
  await prisma.$disconnect()
}

main().catch(async err => {
  console.error('\n✗ Error:', err.message)
  await prisma.$disconnect()
  process.exit(1)
})
