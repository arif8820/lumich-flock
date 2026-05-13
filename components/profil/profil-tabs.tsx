// client: tab state (custom Tabs)
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InfoAkunForm } from './info-akun-form'
import { PasswordForm } from './password-form'

interface Props {
  defaultFullName: string
  defaultPhone: string | null
}

export function ProfilTabs({ defaultFullName, defaultPhone }: Props) {
  return (
    <Tabs defaultValue="info-akun" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="info-akun">Info Akun</TabsTrigger>
        <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
      </TabsList>
      <TabsContent value="info-akun">
        <div className="bg-white rounded-2xl shadow-lf-sm p-6">
          <InfoAkunForm defaultFullName={defaultFullName} defaultPhone={defaultPhone} />
        </div>
      </TabsContent>
      <TabsContent value="keamanan">
        <div className="bg-white rounded-2xl shadow-lf-sm p-6">
          <PasswordForm />
        </div>
      </TabsContent>
    </Tabs>
  )
}
