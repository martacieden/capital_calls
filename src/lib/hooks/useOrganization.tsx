import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { organizations, defaultOrganizationId } from '@/data/organizations'
import type { Organization } from '@/data/types'

interface OrganizationContextValue {
    currentOrg: Organization
    organizations: Organization[]
    setOrganization: (id: string) => void
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [currentOrgId, setCurrentOrgId] = useState(defaultOrganizationId)
    const currentOrg = organizations.find((o) => o.id === currentOrgId) ?? organizations[0]

    return (
        <OrganizationContext.Provider
            value={{
                currentOrg,
                organizations,
                setOrganization: setCurrentOrgId,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    )
}

export function useOrganization() {
    const ctx = useContext(OrganizationContext)
    if (!ctx) throw new Error('useOrganization must be used inside OrganizationProvider')
    return ctx
}
