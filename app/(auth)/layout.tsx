export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(145deg, #e3f0f9 0%, #fdf6ed 50%, #e4f4f2 100%)' }}
    >
      {children}
    </div>
  )
}
