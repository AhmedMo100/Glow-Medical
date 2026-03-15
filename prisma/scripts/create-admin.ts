/**
 * ============================================================
 *  CREATE ADMIN SCRIPT
 *  Run: npx tsx prisma/scripts/create-admin.ts
 * ============================================================
 */

import 'dotenv/config'
import { prisma } from '../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import readline from 'readline'
import { z } from 'zod'
import { Role } from '../../src/generated/prisma'

// -----------------------------
// Validation Schema
// -----------------------------
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterInput = z.infer<typeof registerSchema>

// -----------------------------
// CLI Setup
// -----------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())))

// -----------------------------
// Main Logic
// -----------------------------
async function main() {
  console.log('\n╔══════════════════════════════════════╗')
  console.log('║        Glow Medical — Admin Setup    ║')
  console.log('╚══════════════════════════════════════╝\n')

  const existingAdmin = await prisma.adminUser.findFirst()

  if (existingAdmin) {
    console.error('❌ An admin already exists!')
    console.error(`   Email: ${existingAdmin.email}`)
    process.exit(1)
  }

  console.log('✅ No admin found, create one now.\n')

  const name = await ask('Enter admin name: ')
  const email = await ask('Enter admin email: ')
  const password = await ask('Enter admin password: ')
  const confirmPassword = await ask('Confirm admin password: ')

  const input: RegisterInput = { name, email, password, confirmPassword }
  const parsed = registerSchema.safeParse(input)

  if (!parsed.success) {
    console.error('\n❌ Validation errors:')
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
  }

  const emailExists = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  })

  if (emailExists) {
    console.error('\n❌ Email already registered!')
    process.exit(1)
  }

  console.log('\n⏳ Creating admin...')

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

  const admin = await prisma.adminUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  })

  console.log('\n🎉 Admin created successfully!')
  console.log('─────────────────────────────')
  console.log(`   ID:    ${admin.id}`)
  console.log(`   Name:  ${admin.name}`)
  console.log(`   Email: ${admin.email}`)
  console.log(`   Role:  ${admin.role}`)
  console.log('\n🚀 Login at: /auth/login\n')
}

// -----------------------------
// Execute
// -----------------------------
main()
  .catch((e) => {
    console.error('\n❌ Error creating admin:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    rl.close()
  })