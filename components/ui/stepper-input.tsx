// client: interactive stepper with +/- buttons for mobile-friendly number input
'use client'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function StepperInput({ value, onChange, min = 0, max, step = 1, className }: Props) {
  function decrement() {
    const next = Math.max(value - step, min)
    if (next === value) return
    onChange(next)
  }

  function increment() {
    const next = max !== undefined ? Math.min(value + step, max) : value + step
    if (max !== undefined && next === value) return
    onChange(next)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value)
    if (isNaN(parsed)) return
    if (parsed < min) return
    if (max !== undefined && parsed > max) return
    onChange(parsed)
  }

  return (
    <div
      className={`flex items-center border border-[var(--lf-border)] rounded-xl overflow-hidden bg-[var(--lf-input-bg)] ${className ?? ''}`}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-12 h-12 flex items-center justify-center text-xl font-light flex-shrink-0 disabled:opacity-30 transition-opacity"
        style={{ color: 'var(--lf-blue-active)' }}
        aria-label="Kurangi"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        min={min}
        max={max}
        className="flex-1 text-center font-bold bg-transparent border-none outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        style={{ fontSize: '24px', color: 'var(--lf-text-dark)', padding: '8px 0' }}
      />
      <button
        type="button"
        onClick={increment}
        disabled={max !== undefined && value >= max}
        className="w-12 h-12 flex items-center justify-center text-xl font-light flex-shrink-0 disabled:opacity-30 transition-opacity"
        style={{ color: 'var(--lf-blue-active)' }}
        aria-label="Tambah"
      >
        +
      </button>
    </div>
  )
}
