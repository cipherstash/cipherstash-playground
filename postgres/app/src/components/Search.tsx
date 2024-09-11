'use client'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { useState } from 'react'

export default function Search({ email }: { email: string }) {
  const [emailInput, setEmailInput] = useState(email)

  return (
    <form
      className="flex items-center space-x-4"
      onSubmit={(e) => {
        e.preventDefault()

        // Navigate to the new URL
        window.location.href = `/?email=${encodeURIComponent(emailInput)}`
      }}
    >
      <Input
        className="w-72"
        placeholder="Search user by email"
        onChange={(e) => setEmailInput(e.target.value)}
        value={emailInput}
      />
      <Button type="submit">Search</Button>
    </form>
  )
}
