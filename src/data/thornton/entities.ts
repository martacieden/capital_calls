import type { BusinessEntity } from '../types'

const ORG = 'org-thornton'
const BY_AI = { id: 'ai-extractor', name: 'Fojo AI', avatarUrl: undefined }

/**
 * Thornton Family — Business Entities (9)
 *
 * Structure:
 *   RLT → Family Office LLC → Capital Group LP → {RE Holdings, Aviation, Maritime, Art Fund, PE Aggregator, Agriculture}
 *   RLT → Foundation
 */
export const thorntonEntities: BusinessEntity[] = [
    {
        id: 'thn-e1',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Family Office LLC',
        entityType: 'LLC',
        stateOfFormation: 'Delaware',
        dateFormed: '2010-01-10',
        purpose: 'Family Office',
        description:
            'Staffed family office managing ~$2B in total assets. 14 full-time professionals covering investment management, tax, legal, and concierge services.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t1',
    },
    {
        id: 'thn-e2',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Capital Group LP',
        entityType: 'LP',
        stateOfFormation: 'Delaware',
        dateFormed: '2008-06-01',
        purpose: 'Holding',
        description:
            'Master limited partnership. GP interest owned by Family Office. LP interests held by Dynasty Trust I (60%) and Dynasty Trust II (40%).',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e1',
    },
    {
        id: 'thn-e3',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Real Estate Holdings LLC',
        entityType: 'LLC',
        stateOfFormation: 'Delaware',
        dateFormed: '2008-09-01',
        purpose: 'Real Estate',
        description:
            'Parent entity for all domestic real estate. Managed by Edward IV as President. Total portfolio value ~$408M.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-e4',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Aviation LLC',
        entityType: 'LLC',
        stateOfFormation: 'Delaware',
        dateFormed: '2022-03-15',
        purpose: 'Aviation',
        description:
            'Holds the family aircraft. Based at Teterboro Airport (TEB). Annual operating cost ~$4.2M.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-e5',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Maritime LLC',
        entityType: 'LLC',
        stateOfFormation: 'Cayman Islands',
        dateFormed: '2020-11-01',
        purpose: 'Maritime',
        description:
            'Holds Motor Yacht Sovereign. Cayman Islands registration. Home port Fort Lauderdale. Managed by Fraser Yachts.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-e6',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Art Fund LLC',
        entityType: 'LLC',
        stateOfFormation: 'New York',
        dateFormed: '2014-05-01',
        purpose: 'Art & Collectibles',
        description:
            'Holds the family art collection. Catherine Thornton-Liu oversees conservation and loan programs. Total insured value ~$70M.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-e7',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton PE Aggregator LLC',
        entityType: 'LLC',
        stateOfFormation: 'Delaware',
        dateFormed: '2016-02-01',
        purpose: 'Private Equity',
        description:
            'Aggregates the family\u2019s PE and venture fund commitments. Currently holds interests in 40+ fund positions.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-e8',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Agriculture LP',
        entityType: 'LP',
        stateOfFormation: 'Iowa',
        dateFormed: '2017-08-01',
        purpose: 'Agriculture',
        description:
            'Holds 12,000 acres of prime Iowa cropland in Story and Boone Counties. Leased to three operating farmers.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-e12',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Foundation',
        entityType: 'Foundation',
        stateOfFormation: 'New York',
        dateFormed: '2005-11-15',
        purpose: 'Philanthropy',
        description:
            'Private 501(c)(3) foundation. $45M endowment, ~$2.5M annual grants in arts, education, and healthcare. Anastasia serves as board president.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t1',
    },
    {
        id: 'thn-e9',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Ventures LLC',
        entityType: 'LLC',
        stateOfFormation: 'Delaware',
        dateFormed: '2019-05-01',
        purpose: 'Venture Capital',
        description:
            'Direct venture investments and fund-of-funds vehicle. 22 active positions across seed-to-Series C. Focus on fintech, climate tech, and healthcare AI.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-e2',
    },
    {
        id: 'thn-e10',
        categoryKey: 'entity',
        organizationId: ORG,
        name: 'Thornton Insurance Holdings LLC',
        entityType: 'LLC',
        stateOfFormation: 'Delaware',
        dateFormed: '2015-09-01',
        purpose: 'Insurance',
        description:
            'Consolidated vehicle for all family insurance policies. Manages premium payments, claims, and coverage reviews across life, property, liability, and specialty lines.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t3',
    },
]
