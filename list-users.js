import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function listUsers() {
  const users = await prisma.user.findMany()
  console.log("Existing users:")
  users.forEach(user => {
    console.log(`- ${user.email} (${user.name})`)
  })
}

listUsers()
