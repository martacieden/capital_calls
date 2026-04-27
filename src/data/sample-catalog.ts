import type { AnyCatalogItem, BusinessEntity, Relationship, DistributionEvent } from '@/data/types'

/*
 * sample-catalog.ts — Smith Family demo items
 *
 * These are the visual reference cards from the base design (Builder.io export).
 * They use the real CatalogItem shape now: organizationId, categoryKey, createdBy.id.
 * Adapted to work with the new typed data model.
 */

const ORG_ID = 'org-smith'

const CREATED_BY_GRACE = { id: 'smith-p1', name: 'Grace Smith', avatarUrl: undefined as string | undefined }

export const sampleCatalogItems: AnyCatalogItem[] = [
    {
        id: 'smith-p1',
        organizationId: ORG_ID,
        categoryKey: 'person',
        name: 'Grace Smith',
        description: 'Family matriarch and grantor of the Smith Family RLT. Oversees the family real estate and investment portfolio.',
        createdAt: '2020-05-01',
        createdBy: CREATED_BY_GRACE,
    },
    {
        id: 'smith-t1',
        organizationId: ORG_ID,
        categoryKey: 'trust',
        name: 'Smith Family Revocable Living Trust',
        trustType: 'Revocable Living Trust',
        dateEstablished: '2020-05-01',
        state: 'Florida',
        status: 'Active',
        description: 'Main estate planning vehicle. Owns Sapphire Holdings LLC and Atlas Capital Partners. Avoids probate.',
        createdAt: '2020-05-01',
        createdBy: CREATED_BY_GRACE,
    } as import('./types').Trust,
    {
        id: 'smith-a1',
        organizationId: ORG_ID,
        categoryKey: 'property',
        name: 'Greenfield House',
        description: 'Countryside estate for weekends. It features a large garden, cozy living spaces, and is located near the historic town of Willow Creek.',
        imageUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/99afbca8651df57abaf7d230d107fbe09f101384?placeholderIfAbsent=true',
        createdAt: '2025-11-12',
        createdBy: {
            id: 'u-bruce',
            name: 'Bruce Wayne',
            avatarUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/80b8ab003afa08ec663a567bc64dc28f86c74e43?placeholderIfAbsent=true',
        },
    },
    {
        id: 'smith-e1',
        organizationId: ORG_ID,
        categoryKey: 'entity',
        name: 'Sapphire Holdings LLC',
        description: 'Premier property management firm specializing in luxury coastal properties. With a focus on exceptional service and meticulous attention to detail.',
        entityType: 'LLC',
        stateOfFormation: 'Delaware',
        dateFormed: '2018-03-15',
        purpose: 'Property holding and management for Smith family real estate portfolio',
        imageUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/9e080c5fcd17d1323456bce47193f703bd6df104?placeholderIfAbsent=true',
        createdAt: '2024-09-20',
        createdBy: {
            id: 'u-grace',
            name: 'Grace Smith',
        },
    } as BusinessEntity,
    {
        id: 'smith-p2',
        organizationId: ORG_ID,
        categoryKey: 'person',
        name: 'Leo Franci',
        description: 'Real estate agent specializing in luxury coastal properties. With a keen eye for detail and a passion for seaside living.',
        imageUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/3b8b92f9702b98952aa4bcb9ed30df7187447aea?placeholderIfAbsent=true',
        createdAt: '2025-12-01',
        createdBy: {
            id: 'u-anna',
            name: 'Anna Jones',
            avatarUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/a6744efd80274fce1cf943c828b5aa8b281f605b?placeholderIfAbsent=true',
        },
    },
    {
        id: 'smith-a2',
        organizationId: ORG_ID,
        categoryKey: 'maritime',
        name: 'Neptune Voyager',
        description: 'Custom 85-foot motor yacht with twin diesel engines, three staterooms, and a flybridge. Home port: Miami Beach Marina.',
        imageUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/30f991a04ad3730de8394caa952a8b7c67c22f32?placeholderIfAbsent=true',
        createdAt: '2024-01-10',
        createdBy: {
            id: 'u-mike',
            name: 'Mike Davis',
            avatarUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/5142bf2ac8eb704d2846b7d8adf1f1863c35dccd?placeholderIfAbsent=true',
        },
    },
    {
        id: 'smith-e2',
        organizationId: ORG_ID,
        categoryKey: 'organization',
        name: 'Stellaris Enterprises',
        description: 'Innovative tech firm specializing in AI solutions. Committed to pushing the boundaries of technology, we deliver cutting-edge products.',
        imageUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/302e1ea2ba55150b73667a5adc6fd72fb55a2268?placeholderIfAbsent=true',
        createdAt: '2025-10-15',
        createdBy: {
            id: 'u-john',
            name: 'John Doe',
        },
    },
    {
        id: 'smith-a3',
        organizationId: ORG_ID,
        categoryKey: 'property',
        name: 'Urban Farm',
        description: 'Sustainable urban agriculture project on 12 acres. Produces organic vegetables for local restaurants and runs community gardening workshops.',
        imageUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/38d5b55bb05c270294981ef2cd2a3688b006a264?placeholderIfAbsent=true',
        createdAt: '2025-12-03',
        createdBy: {
            id: 'u-mike',
            name: 'Mike Davis',
            avatarUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/5142bf2ac8eb704d2846b7d8adf1f1863c35dccd?placeholderIfAbsent=true',
        },
    },
    {
        id: 'smith-a4',
        organizationId: ORG_ID,
        categoryKey: 'property',
        name: 'Emerald Coast Villa',
        description: 'A stunning beachfront villa with panoramic ocean views, private pool, and direct beach access in the exclusive Emerald Coast area.',
        createdAt: '2025-02-14',
        createdBy: {
            id: 'u-sarah',
            name: 'Sarah Miller',
            avatarUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/80b8ab003afa08ec663a567bc64dc28f86c74e43?placeholderIfAbsent=true',
        },
    },
    {
        id: 'smith-e3',
        organizationId: ORG_ID,
        categoryKey: 'organization',
        name: 'Atlas Capital Partners',
        description: 'Private equity fund managing diversified investments across real estate, technology, and sustainable energy sectors.',
        createdAt: '2024-08-05',
        createdBy: {
            id: 'u-robert',
            name: 'Robert Chen',
        },
    },
    {
        id: 'smith-p3',
        organizationId: ORG_ID,
        categoryKey: 'person',
        name: 'Elena Rossi',
        description: 'International tax attorney with expertise in cross-border estate planning and multi-jurisdictional compliance.',
        createdAt: '2025-03-22',
        createdBy: {
            id: 'u-bruce',
            name: 'Bruce Wayne',
            avatarUrl: 'https://api.builder.io/api/v1/image/assets/37503a904daa42cbad7e059376ec9d5c/80b8ab003afa08ec663a567bc64dc28f86c74e43?placeholderIfAbsent=true',
        },
    },
    // Beneficiary family members
    {
        id: 'smith-p4',
        organizationId: ORG_ID,
        categoryKey: 'person',
        name: 'Nathan Smith',
        description: 'Grace\'s son and primary beneficiary of the Smith Family RLT. Works in sustainable architecture.',
        dob: '1990-04-12',
        age: 36,
        relationship: 'Son',
        roles: ['Income Beneficiary', 'Remainder Beneficiary'],
        createdAt: '2020-05-01',
        createdBy: CREATED_BY_GRACE,
    } as import('./types').Person,
    {
        id: 'smith-p5',
        organizationId: ORG_ID,
        categoryKey: 'person',
        name: 'Olivia Smith',
        description: 'Grace\'s daughter. Beneficiary of the Smith Family RLT with age-based milestone distributions.',
        dob: '1995-09-28',
        age: 30,
        relationship: 'Daughter',
        roles: ['Income Beneficiary', 'Remainder Beneficiary'],
        createdAt: '2020-05-01',
        createdBy: CREATED_BY_GRACE,
    } as import('./types').Person,
    {
        id: 'smith-p6',
        organizationId: ORG_ID,
        categoryKey: 'person',
        name: 'Ethan Smith',
        description: 'Grace\'s grandson through Nathan. Contingent beneficiary of the Smith Family RLT.',
        dob: '2012-07-15',
        age: 13,
        relationship: 'Grandson',
        roles: ['Remainder Beneficiary'],
        createdAt: '2024-01-10',
        createdBy: CREATED_BY_GRACE,
    } as import('./types').Person,
]

/*
 * Smith Family relationships — connects items for the estate map.
 *
 * Structure (Thornton-style hierarchy):
 *   Grace Smith (person) → grantor_of/trustee_of → Smith Family RLT (trust)
 *   Trust → owns → Sapphire Holdings, Atlas Capital
 *   Sapphire Holdings → holds → properties + yacht
 *   Atlas Capital → owns → Stellaris (portfolio investment)
 *   Leo, Elena → member_of → Sapphire (people at top, linked to entities)
 */
export const smithRelationships: Relationship[] = [
    // Grace Smith → Trust (People at top, like Thornton)
    { from: 'smith-p1', to: 'smith-t1', type: 'grantor_of', label: 'Grantor of' },
    { from: 'smith-p1', to: 'smith-t1', type: 'trustee_of', label: 'Trustee of' },

    // Trust → owns entities
    { from: 'smith-t1', to: 'smith-e1', type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'smith-t1', to: 'smith-e3', type: 'owns', label: 'Owns', percentage: 100 },

    // Atlas Capital → portfolio investment in Stellaris
    { from: 'smith-e3', to: 'smith-e2', type: 'owns', label: 'Portfolio Investment', percentage: 35 },

    // Sapphire Holdings LLC → holds real estate & yacht
    { from: 'smith-e1', to: 'smith-a1', type: 'holds', label: 'Holds' },
    { from: 'smith-e1', to: 'smith-a3', type: 'holds', label: 'Holds' },
    { from: 'smith-e1', to: 'smith-a4', type: 'holds', label: 'Holds' },
    { from: 'smith-e1', to: 'smith-a2', type: 'holds', label: 'Holds' },

    // People → Entity (member_of, like Thornton)
    { from: 'smith-p2', to: 'smith-e1', type: 'member_of', label: 'Property Manager' },
    { from: 'smith-p3', to: 'smith-e1', type: 'member_of', label: 'Legal Counsel' },

    // Beneficiaries
    { from: 'smith-t1', to: 'smith-p4', type: 'beneficiary_of', label: 'Primary Beneficiary' },
    { from: 'smith-t1', to: 'smith-p5', type: 'beneficiary_of', label: 'Beneficiary' },
    { from: 'smith-t1', to: 'smith-p6', type: 'beneficiary_of', label: 'Contingent Beneficiary' },
    { from: 'smith-t1', to: 'smith-p4', type: 'distributes_to', label: 'Distributes to' },
    { from: 'smith-t1', to: 'smith-p5', type: 'distributes_to', label: 'Distributes to' },
    { from: 'smith-t1', to: 'smith-p6', type: 'distributes_to', label: 'Distributes to' },
]

// ─────────────────────────────────────────────
// SMITH FAMILY DISTRIBUTIONS
// ─────────────────────────────────────────────

export const smithDistributions: DistributionEvent[] = [
    // Nathan – age-based
    {
        id: 'smith-d1',
        beneficiaryId: 'smith-p4',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 35,
        triggerYear: 2025,
        amount: 2_500_000,
        description: 'First principal distribution – career and family establishment',
        status: 'Completed',
    },
    {
        id: 'smith-d2',
        beneficiaryId: 'smith-p4',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 40,
        triggerYear: 2030,
        amount: 5_000_000,
        description: 'Second principal distribution – wealth building phase',
        status: 'Pending',
    },
    {
        id: 'smith-d3',
        beneficiaryId: 'smith-p4',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 45,
        triggerYear: 2035,
        amount: 'Remainder',
        description: 'Final distribution of Nathan\'s trust share',
        status: 'Pending',
    },
    // Olivia – age-based
    {
        id: 'smith-d4',
        beneficiaryId: 'smith-p5',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 30,
        triggerYear: 2025,
        amount: 2_000_000,
        description: 'First principal distribution – professional advancement',
        status: 'Completed',
    },
    {
        id: 'smith-d5',
        beneficiaryId: 'smith-p5',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 35,
        triggerYear: 2030,
        amount: 3_500_000,
        description: 'Second principal distribution',
        status: 'Pending',
    },
    {
        id: 'smith-d6',
        beneficiaryId: 'smith-p5',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 40,
        triggerYear: 2035,
        amount: 'Remainder',
        description: 'Final distribution of Olivia\'s trust share',
        status: 'Pending',
    },
    // Ethan (grandson) – age-based
    {
        id: 'smith-d7',
        beneficiaryId: 'smith-p6',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 18,
        triggerYear: 2030,
        amount: 500_000,
        description: 'Education funding – college and gap year',
        status: 'Pending',
    },
    {
        id: 'smith-d8',
        beneficiaryId: 'smith-p6',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 25,
        triggerYear: 2037,
        amount: 1_500_000,
        description: 'Career establishment distribution',
        status: 'Pending',
    },
    {
        id: 'smith-d9',
        beneficiaryId: 'smith-p6',
        trustId: 'smith-t1',
        triggerType: 'Age',
        triggerAge: 30,
        triggerYear: 2042,
        amount: 'Remainder',
        description: 'Final distribution of Ethan\'s contingent share',
        status: 'Pending',
    },
    // Event-based
    {
        id: 'smith-d10',
        beneficiaryId: 'smith-p4',
        trustId: 'smith-t1',
        triggerType: 'Event',
        triggerEvent: 'Upon Grace\'s incapacity or death',
        amount: 'Income for life',
        description: 'Nathan receives trust income under HEMS standard as successor primary beneficiary.',
        status: 'Pending',
    },
    {
        id: 'smith-d11',
        beneficiaryId: 'smith-p5',
        trustId: 'smith-t1',
        triggerType: 'Event',
        triggerEvent: 'Upon Grace\'s incapacity or death',
        amount: 'Income for life',
        description: 'Olivia receives equal share of trust income under HEMS standard.',
        status: 'Pending',
    },
    {
        id: 'smith-d12',
        beneficiaryId: 'smith-p4',
        trustId: 'smith-t1',
        triggerType: 'Condition',
        triggerEvent: 'Hardship provision – medical emergency',
        amount: 'Up to $500K',
        description: 'Emergency distribution for qualifying medical expenses exceeding insurance coverage.',
        status: 'Pending',
    },
    {
        id: 'smith-d13',
        beneficiaryId: 'smith-p6',
        trustId: 'smith-t1',
        triggerType: 'Condition',
        triggerEvent: 'Upon completion of graduate degree',
        amount: 250_000,
        description: 'Education incentive bonus distributed upon verified completion of a graduate program.',
        status: 'Pending',
    },
]
