import Search from '@/components/Search'
import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { db } from '@/lib/db.mjs'
import { users } from '@/lib/schema'
import { asc, eq, like } from 'drizzle-orm'

// This is a demo page so we want to force dynamic rendering
export const dynamic = 'force-dynamic'

function Stat({ title, value, change }: { title: string; value: string; change?: string }) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      {change && (
        <div className="mt-3 text-sm/6 sm:text-xs/6">
          <Badge color="lime">{change}</Badge>
        </div>
      )}
    </div>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: {
    email: string
  }
}) {
  const userData = await db.select().from(users).orderBy(asc(users.email))
  const adminData = await db.select().from(users).where(like(users.email, '%datahopper.io'))
  const foundUser = await db.select().from(users).where(eq(users.email, searchParams.email))

  return (
    <>
      <Heading>Good afternoon</Heading>
      <div className="mt-8 flex items-end justify-between">
        <Subheading>Overview</Subheading>
        <Search email={searchParams.email} />
      </div>
      <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total users" value={String(userData.length)} />
        <Stat title="Admin users" value={String(adminData.length)} change="WHERE email LIKE '%datahopper.io'" />
        <Stat
          title="User found"
          value={foundUser.length ? 'Yes' : 'No'}
          change={`WHERE email = '${searchParams.email}'`}
        />
      </div>
      <Subheading className="mt-14">Users ordered by email</Subheading>
      <Badge className="mt-4 text-sm/6" color="lime">
        SELECT id, name, email FROM users ORDER BY email ASC;
      </Badge>
      <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
        <TableHead>
          <TableRow>
            <TableHeader>ID</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>
              Email <span className="text-slate-400">(protected)</span>
            </TableHeader>
            <TableHeader>Admin</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {userData.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.email?.endsWith('datahopper.io') ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
