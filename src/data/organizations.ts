import type { Organization } from './types'

/*
 * organizations.ts — Multi-org demo data
 *
 * Two example families for demonstrating org switching.
 * Source: feature-context.md (section 11c — Smith Family base design),
 *         docs/plans/2026-03-02-estate-intelligence-prototype.md (Davis Family).
 */

export const organizations: Organization[] = [
    {
        id: 'org-smith',
        name: 'Smith Family',
        initials: 'SF',
        logoUrl: undefined,
    },
    {
        id: 'org-davis',
        name: 'Davis Family',
        initials: 'DF',
        logoUrl: undefined,
    },
    {
        id: 'org-thornton',
        name: 'Thornton Family',
        initials: 'TF',
        logoUrl: undefined,
    },
]

export const defaultOrganizationId = 'org-smith'
