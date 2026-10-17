import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Return Home
      </Link>
    </div>
  )
}
