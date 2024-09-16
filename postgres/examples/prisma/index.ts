import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Uncomment the following line to create a new user
// await prisma.user.create({
//     data: {
//         firstName: 'Alice',
//         email: 'alice@prisma.io',
//         password: 'alice',
//     },
// })

const allUsers = await prisma.user.findMany()
console.dir(allUsers, { depth: null })
