import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-semibold">Akses Ditolak</h1>
      <p className="text-muted-foreground">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Link
        href="/dashboard"
        className="text-primary underline underline-offset-4"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  )
}
