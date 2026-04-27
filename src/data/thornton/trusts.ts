import type { Trust } from '../types'

const ORG = 'org-thornton'
const BY_AI = { id: 'ai-extractor', name: 'Fojo AI', avatarUrl: undefined }

/**
 * Thornton Family — Trusts (8)
 *
 * Removed from original:
 * - Children's subtrusts (t7-t11) — beneficiary allocations, no separate holdings
 * - GRAT 2021 (t14) — terminated, excess passed to Dynasty I
 * - Marital & Bypass trusts (t5, t6) — created at death, not yet active
 */
export const thorntonTrusts: Trust[] = [
    {
        id: 'thn-t1',
        categoryKey: 'trust',
        organizationId: ORG,
        name: 'Thornton Family Revocable Living Trust',
        trustType: 'Revocable Living Trust',
        dateEstablished: '2012-03-15',
        state: 'New York',
        status: 'Active',
        description:
            "Master estate planning vehicle. Avoids probate. At Edward's death, splits into Marital Trust and Bypass Trust. Owns the Family Office and Foundation.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-p1',
    },
    {
        id: 'thn-t2',
        categoryKey: 'trust',
        organizationId: ORG,
        name: 'Thornton Dynasty Trust I',
        trustType: 'Dynasty Trust',
        dateEstablished: '2010-01-15',
        state: 'South Dakota',
        status: 'Active',
        description:
            'Perpetual trust under South Dakota law for descendants of Marriage 1. Holds 60% LP interest in Capital Group. Currently ~$380M in assets.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-p1',
    },
    {
        id: 'thn-t3',
        categoryKey: 'trust',
        organizationId: ORG,
        name: 'Thornton Dynasty Trust II',
        trustType: 'Dynasty Trust',
        dateEstablished: '2018-09-01',
        state: 'South Dakota',
        status: 'Active',
        description:
            'Benefits Natalie, Lucas, Isabella, and charitable causes. Holds 40% LP interest in Capital Group. 15% of income to Foundation annually.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-p1',
    },
    {
        id: 'thn-t4',
        categoryKey: 'trust',
        organizationId: ORG,
        name: 'Thornton Irrevocable Life Insurance Trust',
        trustType: 'Irrevocable Life Insurance Trust',
        dateEstablished: '2015-06-01',
        state: 'New York',
        status: 'Active',
        description:
            'Holds $25M Northwestern Mutual survivorship whole life policy. Excludes proceeds from taxable estate. Richard Caldwell serves as trustee.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-p1',
    },
    {
        id: 'thn-t5',
        categoryKey: 'trust',
        organizationId: ORG,
        name: 'Thornton Marital Trust',
        trustType: 'Marital Trust',
        dateEstablished: undefined,
        state: 'New York',
        status: 'Created at death',
        parentTrustId: 'thn-t1',
        description:
            "Created from the RLT at Edward's death. Provides income for Anastasia's lifetime under HEMS standard. Qualifies for estate tax marital deduction.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t1',
    },
    {
        id: 'thn-t6',
        categoryKey: 'trust',
        organizationId: ORG,
        name: 'Thornton Bypass Trust',
        trustType: 'Bypass Trust',
        dateEstablished: undefined,
        state: 'New York',
        status: 'Created at death',
        parentTrustId: 'thn-t1',
        description:
            "Created from the RLT at Edward's death. Shelters assets up to the estate tax exemption for children of Marriage 1.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-t1',
    },
    {
        id: 'thn-t12',
        categoryKey: 'trust',
        organizationId: ORG,
        name: 'Thornton SLAT I',
        trustType: 'Spousal Lifetime Access Trust',
        dateEstablished: '2016-04-15',
        state: 'South Dakota',
        status: 'Active',
        description:
            "$30M irrevocable trust for Anastasia's benefit. Removes assets from Edward's taxable estate while Anastasia retains access to income and principal.",
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-p1',
    },
    {
        id: 'thn-t13',
        categoryKey: 'trust',
        organizationId: ORG,
        name: 'Thornton Charitable Remainder Trust',
        trustType: 'Charitable Remainder Trust',
        dateEstablished: '2019-08-22',
        state: 'New York',
        status: 'Active',
        description:
            '20-year CRUT at 5% unitrust rate. Edward and Anastasia receive annual income. Remainder passes to the Thornton Foundation.',
        createdAt: '2024-03-01',
        createdBy: BY_AI,
        treeParentId: 'thn-p1',
    },
]
