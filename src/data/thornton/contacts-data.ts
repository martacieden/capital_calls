export interface Contact {
    id: string
    name: string
    role: string
    firm: string
    email: string
    phone: string
    specialization: string
}

export interface ContactGroup {
    lawyers: Contact[]
    accountants: Contact[]
}

export const mockContacts: ContactGroup = {
    lawyers: [
        {
            id: 'lawyer-001',
            name: 'Richard Calloway',
            role: 'Estate & Trust Attorney',
            firm: 'Sullivan & Cromwell LLP',
            email: 'r.calloway@sullcrom.com',
            phone: '+1 (212) 558-4000',
            specialization: 'Trust & Estate Planning',
        },
        {
            id: 'lawyer-002',
            name: 'Isabelle Fontaine',
            role: 'Tax & Structuring Attorney',
            firm: 'Lenz & Staehelin',
            email: 'i.fontaine@lenzstaehelin.com',
            phone: '+41 58 450 80 00',
            specialization: 'International Tax Structuring',
        },
        {
            id: 'lawyer-003',
            name: 'James Whitfield',
            role: 'Family Law Attorney',
            firm: 'Cravath, Swaine & Moore LLP',
            email: 'j.whitfield@cravath.com',
            phone: '+1 (212) 474-1000',
            specialization: 'Family Law & Prenuptial Agreements',
        },
        {
            id: 'lawyer-004',
            name: 'Sophie Marchetti',
            role: 'Real Estate Attorney',
            firm: 'Clifford Chance LLP',
            email: 's.marchetti@cliffordchance.com',
            phone: '+44 20 7006 1000',
            specialization: 'Real Estate & Property Law',
        },
        {
            id: 'lawyer-005',
            name: 'David Chen',
            role: 'Corporate Attorney',
            firm: 'Skadden, Arps, Slate',
            email: 'd.chen@skadden.com',
            phone: '+1 (212) 735-3000',
            specialization: 'Corporate Structuring & M&A',
        },
    ],

    accountants: [
        {
            id: 'cpa-001',
            name: 'Michael Torres',
            role: 'Senior Tax Partner',
            firm: 'Deloitte Private',
            email: 'm.torres@deloitte.com',
            phone: '+1 (212) 436-2000',
            specialization: 'High Net Worth Tax Planning',
        },
        {
            id: 'cpa-002',
            name: 'Karen Yamamoto',
            role: 'Family Office CPA',
            firm: 'KPMG Family Office Services',
            email: 'k.yamamoto@kpmg.com',
            phone: '+1 (212) 758-9700',
            specialization: 'Family Office Accounting & Reporting',
        },
        {
            id: 'cpa-003',
            name: 'Pierre Dubois',
            role: 'International Tax Advisor',
            firm: 'PwC Geneva',
            email: 'p.dubois@pwc.com',
            phone: '+41 58 792 91 00',
            specialization: 'International Tax & Compliance',
        },
        {
            id: 'cpa-004',
            name: 'Laura Benson',
            role: 'Estate Tax Specialist',
            firm: 'Ernst & Young LLP',
            email: 'l.benson@ey.com',
            phone: '+1 (212) 773-3000',
            specialization: 'Estate & Gift Tax',
        },
    ],
}

export const timelineEventScenarios = [
    {
        id: 'event-001',
        type: 'New Dependent',
        title: 'New Dependent Added',
        person: 'Edward Thornton IV',
        description: 'New child adopted — trust restructuring required. Current distribution splits need revision across all beneficiaries.',
        date: '2024-11-15',
        suggestedActions: ['contact-lawyer', 'contact-cpa'],
        suggestedTaskTitle: 'Revise Trust Distribution — New Dependent',
        suggestedLawyerSpecialization: 'Trust & Estate Planning',
    },
    {
        id: 'event-002',
        type: 'Death',
        title: 'Beneficiary Deceased',
        person: 'Margaret Thornton',
        description: 'Beneficiary passed away — trust terms require immediate legal review and tax filing within 9 months.',
        date: '2024-09-03',
        suggestedActions: ['contact-lawyer', 'contact-cpa'],
        suggestedTaskTitle: 'Trust Amendment — Beneficiary Deceased',
        suggestedLawyerSpecialization: 'Trust & Estate Planning',
    },
    {
        id: 'event-003',
        type: 'Marriage',
        title: 'Beneficiary Marriage',
        person: 'Catherine Thornton-Liu',
        description: 'Beneficiary married — prenuptial agreement review and trust amendment may be required.',
        date: '2023-06-18',
        suggestedActions: ['contact-lawyer'],
        suggestedTaskTitle: 'Trust Review — Marriage Event',
        suggestedLawyerSpecialization: 'Family Law & Prenuptial Agreements',
    },
    {
        id: 'event-004',
        type: 'Tax Event',
        title: 'Annual Tax Review',
        person: 'Edward Thornton III',
        description: 'Year-end tax review required. Real estate portfolio generated significant capital gains this fiscal year.',
        date: '2024-12-31',
        suggestedActions: ['contact-cpa'],
        suggestedTaskTitle: 'Year-End Tax Planning Review',
        suggestedLawyerSpecialization: null,
    },
]
