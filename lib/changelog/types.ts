export type ChangeType = 'feature' | 'fix' | 'improvement' | 'breaking'

export type ChangeEntry = {
  type: ChangeType
  text: string
}

export type VersionEntry = {
  version: string
  date: string        // ISO "YYYY-MM-DD"
  title: string
  highlights: string[]
  changes: ChangeEntry[]
}
