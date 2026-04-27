import type { Relationship } from '../types'

/**
 * Thornton Family — Relationships (~55)
 *
 * Direction: from → to
 * Edges flow top-to-bottom on the map (person→trust, trust→entity, entity→asset).
 */
export const thorntonRelationships: Relationship[] = [
    // ═══════════════════════════════════════════
    // EDWARD III → TRUSTS (grantor / trustee)
    // ═══════════════════════════════════════════
    { from: 'thn-p1', to: 'thn-t1',  type: 'grantor_of', label: 'Grantor' },
    { from: 'thn-p1', to: 'thn-t1',  type: 'trustee_of', label: 'Trustee' },
    { from: 'thn-p1', to: 'thn-t2',  type: 'grantor_of', label: 'Grantor' },
    { from: 'thn-p1', to: 'thn-t3',  type: 'grantor_of', label: 'Grantor' },
    { from: 'thn-p1', to: 'thn-t4',  type: 'grantor_of', label: 'Grantor' },
    { from: 'thn-p1', to: 'thn-t12', type: 'grantor_of', label: 'Grantor' },
    { from: 'thn-p1', to: 'thn-t13', type: 'grantor_of', label: 'Grantor' },

    // ═══════════════════════════════════════════
    // ANASTASIA → TRUSTS
    // ═══════════════════════════════════════════
    { from: 'thn-p3', to: 'thn-t1',  type: 'co_trustee_of',  label: 'Co-Trustee' },
    { from: 'thn-p3', to: 'thn-t12', type: 'beneficiary_of', label: 'Income Beneficiary', beneficiaryType: 'income' },
    { from: 'thn-p3', to: 'thn-t13', type: 'beneficiary_of', label: 'Income Beneficiary', beneficiaryType: 'income' },

    // ═══════════════════════════════════════════
    // CHILDREN → DYNASTY TRUSTS (beneficiaries)
    // ═══════════════════════════════════════════
    // Edward IV
    { from: 'thn-p4', to: 'thn-t1', type: 'successor_trustee_of', label: '1st Successor Trustee', ordinal: 1 },
    { from: 'thn-p4', to: 'thn-t2', type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },

    // Catherine
    { from: 'thn-p5', to: 'thn-t2', type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },

    // Benjamin
    { from: 'thn-p6', to: 'thn-t2', type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },

    // Natalie
    { from: 'thn-p7', to: 'thn-t3', type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },

    // Lucas
    { from: 'thn-p8', to: 'thn-t3', type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },

    // ═══════════════════════════════════════════
    // GRANDCHILDREN → DYNASTY TRUSTS
    // ═══════════════════════════════════════════
    { from: 'thn-p9',  to: 'thn-t2', type: 'beneficiary_of', label: 'Beneficiary', beneficiaryType: 'remainder' },
    { from: 'thn-p10', to: 'thn-t2', type: 'beneficiary_of', label: 'Beneficiary', beneficiaryType: 'remainder' },
    { from: 'thn-p11', to: 'thn-t2', type: 'beneficiary_of', label: 'Beneficiary', beneficiaryType: 'remainder' },

    // Isabella → Dynasty II
    { from: 'thn-p16', to: 'thn-t3', type: 'beneficiary_of', label: 'Beneficiary', beneficiaryType: 'remainder' },

    // ═══════════════════════════════════════════
    // ADVISORS → TRUSTS / ENTITIES
    // ═══════════════════════════════════════════
    // Richard Caldwell
    { from: 'thn-p17', to: 'thn-t4', type: 'trustee_of',        label: 'Trustee' },
    { from: 'thn-p17', to: 'thn-t1', type: 'successor_trustee_of', label: '2nd Successor Trustee', ordinal: 2 },
    { from: 'thn-p17', to: 'thn-t2', type: 'trust_protector_of', label: 'Trust Protector' },
    { from: 'thn-p17', to: 'thn-t3', type: 'trust_protector_of', label: 'Trust Protector' },

    // Martha Okafor
    { from: 'thn-p18', to: 'thn-e1', type: 'managed_by', label: 'Chief Financial Advisor' },

    // Daniel Schwartz
    { from: 'thn-p19', to: 'thn-e2', type: 'managed_by', label: 'Investment Director' },

    // ═══════════════════════════════════════════
    // TRUST → TRUST (at-death creation)
    // ═══════════════════════════════════════════
    { from: 'thn-t1', to: 'thn-t5', type: 'creates', label: 'Creates at death' },
    { from: 'thn-t1', to: 'thn-t6', type: 'creates', label: 'Creates at death' },

    // ═══════════════════════════════════════════
    // TRUST / ENTITY OWNERSHIP CHAIN
    // ═══════════════════════════════════════════
    // RLT → Family Office (100%)
    { from: 'thn-t1', to: 'thn-e1',  type: 'owns', label: 'Owns 100%', percentage: 100 },

    // Family Office → Capital Group (GP interest)
    { from: 'thn-e1', to: 'thn-e2',  type: 'owns', label: 'GP Interest' },

    // Dynasty I → Capital Group (60% LP)
    { from: 'thn-t2', to: 'thn-e2',  type: 'member_of', label: 'LP Interest (60%)', percentage: 60 },

    // Dynasty II → Capital Group (40% LP)
    { from: 'thn-t3', to: 'thn-e2',  type: 'member_of', label: 'LP Interest (40%)', percentage: 40 },

    // Capital Group → Sub-entities
    { from: 'thn-e2', to: 'thn-e3',  type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'thn-e2', to: 'thn-e4',  type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'thn-e2', to: 'thn-e5',  type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'thn-e2', to: 'thn-e6',  type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'thn-e2', to: 'thn-e7',  type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'thn-e2', to: 'thn-e8',  type: 'owns', label: 'Owns 100%', percentage: 100 },

    // RLT → Foundation (100%)
    { from: 'thn-t1', to: 'thn-e12', type: 'owns', label: 'Owns 100%', percentage: 100 },

    // ═══════════════════════════════════════════
    // ENTITY / TRUST → ASSET HOLDINGS
    // ═══════════════════════════════════════════
    // RE Holdings → Properties
    { from: 'thn-e3', to: 'thn-a1',  type: 'holds', label: 'Holds' },
    { from: 'thn-e3', to: 'thn-a2',  type: 'holds', label: 'Holds' },
    { from: 'thn-e3', to: 'thn-a5',  type: 'holds', label: 'Holds' },
    { from: 'thn-e3', to: 'thn-a7',  type: 'holds', label: 'Holds' },
    { from: 'thn-e3', to: 'thn-a8',  type: 'holds', label: 'Holds' },

    // Aviation → Aircraft
    { from: 'thn-e4', to: 'thn-a25', type: 'holds', label: 'Holds' },

    // Maritime → Yacht
    { from: 'thn-e5', to: 'thn-a26', type: 'holds', label: 'Holds' },

    // Art Fund → Art
    { from: 'thn-e6', to: 'thn-a27', type: 'holds', label: 'Holds' },
    { from: 'thn-e6', to: 'thn-a28', type: 'holds', label: 'Holds' },

    // PE Aggregator → KKR Fund
    { from: 'thn-e7', to: 'thn-a15', type: 'holds', label: 'Holds' },

    // Agriculture → Farmland
    { from: 'thn-e8', to: 'thn-a9',  type: 'holds', label: 'Holds' },

    // Capital Group → Direct investments + Ferrari
    { from: 'thn-e2', to: 'thn-a10', type: 'holds', label: 'Holds' },
    { from: 'thn-e2', to: 'thn-a29', type: 'holds', label: 'Holds' },

    // Family Office → Goldman Sachs
    { from: 'thn-e1', to: 'thn-a11', type: 'holds', label: 'Holds' },

    // RLT → Vanguard
    { from: 'thn-t1', to: 'thn-a13', type: 'holds', label: 'Holds' },

    // Dynasty I → BlackRock
    { from: 'thn-t2', to: 'thn-a12', type: 'holds', label: 'Holds' },

    // Dynasty II → Bitcoin
    { from: 'thn-t3', to: 'thn-a30', type: 'holds', label: 'Holds' },

    // ILIT → Insurance
    { from: 'thn-t4', to: 'thn-a24', type: 'holds', label: 'Holds' },

    // SLAT → Portfolio
    { from: 'thn-t12', to: 'thn-a31', type: 'holds', label: 'Holds' },

    // CRT → Fund
    { from: 'thn-t13', to: 'thn-a32', type: 'holds', label: 'Holds' },

    // ═══════════════════════════════════════════
    // NEW: Ventures LLC (subsidiary of Capital Group)
    // ═══════════════════════════════════════════
    { from: 'thn-e2', to: 'thn-e9',  type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'thn-e9', to: 'thn-a41', type: 'holds', label: 'Holds' },

    // NEW: Insurance Holdings (under Dynasty II)
    { from: 'thn-t3', to: 'thn-e10', type: 'owns', label: 'Owns 100%', percentage: 100 },
    { from: 'thn-e10', to: 'thn-a24', type: 'holds', label: 'Holds' },
    { from: 'thn-e10', to: 'thn-a45', type: 'holds', label: 'Holds' },
    { from: 'thn-e10', to: 'thn-a46', type: 'holds', label: 'Holds' },

    // NEW: Additional asset holdings
    { from: 'thn-e1', to: 'thn-a33', type: 'holds', label: 'Holds' },
    { from: 'thn-e12', to: 'thn-a34', type: 'holds', label: 'Holds' },
    { from: 'thn-e12', to: 'thn-a35', type: 'holds', label: 'Holds' },
    { from: 'thn-e6', to: 'thn-a36', type: 'holds', label: 'Holds' },
    { from: 'thn-e4', to: 'thn-a37', type: 'holds', label: 'Holds' },
    { from: 'thn-e4', to: 'thn-a38', type: 'holds', label: 'Holds' },
    { from: 'thn-e5', to: 'thn-a39', type: 'holds', label: 'Holds' },
    { from: 'thn-e5', to: 'thn-a40', type: 'holds', label: 'Holds' },
    { from: 'thn-e7', to: 'thn-a42', type: 'holds', label: 'Holds' },
    { from: 'thn-e8', to: 'thn-a43', type: 'holds', label: 'Holds' },
    { from: 'thn-e8', to: 'thn-a44', type: 'holds', label: 'Holds' },

    // Edward → Dynasty II
    { from: 'thn-p1', to: 'thn-t3', type: 'grantor_of', label: 'Grantor' },

    // Inventory list assets
    { from: 'thn-e2', to: 'thn-a47', type: 'holds', label: 'Holds' },
    { from: 'thn-e2', to: 'thn-a48', type: 'holds', label: 'Holds' },
    { from: 'thn-e2', to: 'thn-a49', type: 'holds', label: 'Holds' },
    { from: 'thn-e1', to: 'thn-a50', type: 'holds', label: 'Holds' },
    { from: 'thn-e1', to: 'thn-a51', type: 'holds', label: 'Holds' },
    { from: 'thn-e1', to: 'thn-a52', type: 'holds', label: 'Holds' },

    // Insurance Holdings → new insurance policies
    { from: 'thn-e10', to: 'thn-a53', type: 'holds', label: 'Holds' },
    { from: 'thn-e10', to: 'thn-a54', type: 'holds', label: 'Holds' },
    { from: 'thn-e10', to: 'thn-a55', type: 'holds', label: 'Holds' },

    // ═══════════════════════════════════════════
    // ADDITIONAL NON-HIERARCHY CONNECTIONS
    // ═══════════════════════════════════════════

    // Property management — people managing specific assets
    { from: 'thn-p18', to: 'thn-a1',  type: 'managed_by', label: 'Property Manager' },
    { from: 'thn-p18', to: 'thn-a2',  type: 'managed_by', label: 'Property Manager' },
    { from: 'thn-p18', to: 'thn-a5',  type: 'managed_by', label: 'Property Manager' },
    { from: 'thn-p19', to: 'thn-a10', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a11', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a12', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a13', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a15', type: 'managed_by', label: 'Portfolio Manager' },

    // More beneficiary connections to trusts
    { from: 'thn-p4', to: 'thn-t3',  type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },
    { from: 'thn-p5', to: 'thn-t3',  type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },
    { from: 'thn-p7', to: 'thn-t5',  type: 'beneficiary_of', label: 'Primary Beneficiary', beneficiaryType: 'income' },
    { from: 'thn-p8', to: 'thn-t6',  type: 'beneficiary_of', label: 'Primary Beneficiary', beneficiaryType: 'income' },

    // Additional trustee/advisor roles
    { from: 'thn-p17', to: 'thn-e1',  type: 'managed_by', label: 'Legal Counsel' },
    { from: 'thn-p17', to: 'thn-e2',  type: 'managed_by', label: 'Legal Counsel' },
    { from: 'thn-p18', to: 'thn-e2',  type: 'managed_by', label: 'Financial Advisor' },
    { from: 'thn-p18', to: 'thn-e3',  type: 'managed_by', label: 'Property Director' },

    // Catherine as trustee
    { from: 'thn-p5',  to: 'thn-t5',  type: 'trustee_of', label: 'Trustee' },

    // Cross-insurance coverage for more assets
    { from: 'thn-a45', to: 'thn-a27', type: 'insures', label: 'Covers' },
    { from: 'thn-a45', to: 'thn-a28', type: 'insures', label: 'Covers' },
    { from: 'thn-a45', to: 'thn-a36', type: 'insures', label: 'Covers' },
    { from: 'thn-a46', to: 'thn-a9',  type: 'insures', label: 'Covers' },

    // Entity subsidiary relationships
    { from: 'thn-e3', to: 'thn-e1',  type: 'member_of', label: 'Subsidiary' },
    { from: 'thn-e4', to: 'thn-e1',  type: 'member_of', label: 'Subsidiary' },
    { from: 'thn-e5', to: 'thn-e1',  type: 'member_of', label: 'Subsidiary' },
    { from: 'thn-e6', to: 'thn-e1',  type: 'member_of', label: 'Subsidiary' },
    { from: 'thn-e7', to: 'thn-e1',  type: 'member_of', label: 'Subsidiary' },
    { from: 'thn-e8', to: 'thn-e1',  type: 'member_of', label: 'Subsidiary' },
    { from: 'thn-e9', to: 'thn-e2',  type: 'member_of', label: 'Subsidiary' },

    // More property management for remaining properties
    { from: 'thn-p18', to: 'thn-a7',  type: 'managed_by', label: 'Property Manager' },
    { from: 'thn-p18', to: 'thn-a8',  type: 'managed_by', label: 'Property Manager' },
    { from: 'thn-p18', to: 'thn-a43', type: 'managed_by', label: 'Property Manager' },

    // Daniel Schwartz manages more investment accounts
    { from: 'thn-p19', to: 'thn-a30', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a33', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a42', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a41', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a31', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a32', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p19', to: 'thn-a34', type: 'managed_by', label: 'Endowment Manager' },

    // Richard Caldwell as advisor for more entities
    { from: 'thn-p17', to: 'thn-e3',  type: 'managed_by', label: 'Legal Counsel' },
    { from: 'thn-p17', to: 'thn-e12', type: 'managed_by', label: 'Legal Counsel' },
    { from: 'thn-p17', to: 'thn-e10', type: 'managed_by', label: 'Legal Counsel' },
    { from: 'thn-p17', to: 'thn-t4',  type: 'managed_by', label: 'Legal Counsel' },

    // Martha Okafor as advisor for more holdings
    { from: 'thn-p18', to: 'thn-e4',  type: 'managed_by', label: 'Financial Advisor' },
    { from: 'thn-p18', to: 'thn-e5',  type: 'managed_by', label: 'Financial Advisor' },
    { from: 'thn-p18', to: 'thn-e6',  type: 'managed_by', label: 'Financial Advisor' },
    { from: 'thn-p18', to: 'thn-e10', type: 'managed_by', label: 'Financial Advisor' },
    { from: 'thn-p18', to: 'thn-e12', type: 'managed_by', label: 'Financial Advisor' },

    // Additional beneficiary connections — grandchildren to subtrusts
    { from: 'thn-p9',  to: 'thn-t5', type: 'beneficiary_of', label: 'Contingent Beneficiary', beneficiaryType: 'remainder' },
    { from: 'thn-p10', to: 'thn-t5', type: 'beneficiary_of', label: 'Contingent Beneficiary', beneficiaryType: 'remainder' },
    { from: 'thn-p11', to: 'thn-t5', type: 'beneficiary_of', label: 'Contingent Beneficiary', beneficiaryType: 'remainder' },
    { from: 'thn-p16', to: 'thn-t6', type: 'beneficiary_of', label: 'Contingent Beneficiary', beneficiaryType: 'remainder' },

    // People → insurance connections (named insured)
    { from: 'thn-p1',  to: 'thn-a24', type: 'beneficiary_of', label: 'Insured', beneficiaryType: 'income' },
    { from: 'thn-p3',  to: 'thn-a24', type: 'beneficiary_of', label: 'Co-Insured', beneficiaryType: 'income' },
    { from: 'thn-p1',  to: 'thn-a45', type: 'beneficiary_of', label: 'Named Insured', beneficiaryType: 'income' },

    // More trust connections for RLT (thn-t1)
    { from: 'thn-p6',  to: 'thn-t1', type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },

    // Insurance coverage for more items
    { from: 'thn-a45', to: 'thn-a47', type: 'insures', label: 'Covers' },
    { from: 'thn-a45', to: 'thn-a48', type: 'insures', label: 'Covers' },
    { from: 'thn-a45', to: 'thn-a49', type: 'insures', label: 'Covers' },
    { from: 'thn-a45', to: 'thn-a52', type: 'insures', label: 'Covers' },
    { from: 'thn-a46', to: 'thn-a43', type: 'insures', label: 'Covers' },
    { from: 'thn-a53', to: 'thn-a51', type: 'insures', label: 'Covers' },

    // Art management
    { from: 'thn-p19', to: 'thn-a27', type: 'managed_by', label: 'Collection Advisor' },
    { from: 'thn-p19', to: 'thn-a28', type: 'managed_by', label: 'Collection Advisor' },
    { from: 'thn-p19', to: 'thn-a35', type: 'managed_by', label: 'Collection Advisor' },
    { from: 'thn-p19', to: 'thn-a36', type: 'managed_by', label: 'Collection Advisor' },
    { from: 'thn-p19', to: 'thn-a47', type: 'managed_by', label: 'Appraiser' },
    { from: 'thn-p19', to: 'thn-a48', type: 'managed_by', label: 'Appraiser' },
    { from: 'thn-p19', to: 'thn-a49', type: 'managed_by', label: 'Sommelier' },
    { from: 'thn-p19', to: 'thn-a50', type: 'managed_by', label: 'Librarian' },
    { from: 'thn-p19', to: 'thn-a52', type: 'managed_by', label: 'Appraiser' },

    // Vehicle/maritime/aviation management
    { from: 'thn-p18', to: 'thn-a25', type: 'managed_by', label: 'Fleet Manager' },
    { from: 'thn-p18', to: 'thn-a26', type: 'managed_by', label: 'Fleet Manager' },
    { from: 'thn-p18', to: 'thn-a29', type: 'managed_by', label: 'Fleet Manager' },
    { from: 'thn-p18', to: 'thn-a37', type: 'managed_by', label: 'Fleet Manager' },
    { from: 'thn-p18', to: 'thn-a39', type: 'managed_by', label: 'Fleet Manager' },
    { from: 'thn-p18', to: 'thn-a40', type: 'managed_by', label: 'Fleet Manager' },
    { from: 'thn-p18', to: 'thn-a51', type: 'managed_by', label: 'Fleet Manager' },

    // Edward IV as beneficiary/trustee of more trusts
    { from: 'thn-p4', to: 'thn-t12', type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },
    { from: 'thn-p4', to: 'thn-t13', type: 'beneficiary_of', label: 'Remainder Beneficiary', beneficiaryType: 'remainder' },

    // ═══════════════════════════════════════════
    // DENSE CONNECTIONS — ensure 4-8 per asset
    // ═══════════════════════════════════════════

    // Fifth Avenue Penthouse (thn-a1) — was only 2, needs more
    { from: 'thn-p17', to: 'thn-a1',  type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p1',  to: 'thn-a1',  type: 'beneficiary_of', label: 'Primary Resident', beneficiaryType: 'income' },
    { from: 'thn-p3',  to: 'thn-a1',  type: 'beneficiary_of', label: 'Primary Resident', beneficiaryType: 'income' },
    { from: 'thn-a1',  to: 'thn-a8',  type: 'member_of', label: 'Same Portfolio' },

    // Hamptons Estate (thn-a2)
    { from: 'thn-p17', to: 'thn-a2',  type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p1',  to: 'thn-a2',  type: 'beneficiary_of', label: 'Primary Resident', beneficiaryType: 'income' },

    // London Mayfair Flat (thn-a5) — was 2
    { from: 'thn-p17', to: 'thn-a5',  type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p4',  to: 'thn-a5',  type: 'beneficiary_of', label: 'Primary Resident', beneficiaryType: 'income' },
    { from: 'thn-a46', to: 'thn-a5',  type: 'insures', label: 'Covers' },

    // Montana Ranch (thn-a7) — was 1
    { from: 'thn-p17', to: 'thn-a7',  type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p6',  to: 'thn-a7',  type: 'beneficiary_of', label: 'Primary Resident', beneficiaryType: 'income' },
    { from: 'thn-a46', to: 'thn-a7',  type: 'insures', label: 'Covers' },

    // Commercial Building (thn-a8) — was 1
    { from: 'thn-p17', to: 'thn-a8',  type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-a46', to: 'thn-a8',  type: 'insures', label: 'Covers' },

    // Goldman Sachs (thn-a11) — was 2
    { from: 'thn-p17', to: 'thn-a11', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p1',  to: 'thn-a11', type: 'beneficiary_of', label: 'Account Holder', beneficiaryType: 'income' },

    // BlackRock (thn-a12) — was 1
    { from: 'thn-p17', to: 'thn-a12', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p4',  to: 'thn-a12', type: 'beneficiary_of', label: 'Account Holder', beneficiaryType: 'income' },

    // Vanguard (thn-a13) — was 0
    { from: 'thn-p19', to: 'thn-a13', type: 'managed_by', label: 'Portfolio Manager' },
    { from: 'thn-p17', to: 'thn-a13', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p1',  to: 'thn-a13', type: 'beneficiary_of', label: 'Account Holder', beneficiaryType: 'income' },

    // KKR Fund (thn-a15) — was 1
    { from: 'thn-p17', to: 'thn-a15', type: 'managed_by', label: 'Legal Advisor' },

    // G700 Jet (thn-a25) — was 1
    { from: 'thn-p1',  to: 'thn-a25', type: 'beneficiary_of', label: 'Primary User', beneficiaryType: 'income' },
    { from: 'thn-p17', to: 'thn-a25', type: 'managed_by', label: 'Legal Advisor' },

    // Yacht (thn-a26) — was 1
    { from: 'thn-p1',  to: 'thn-a26', type: 'beneficiary_of', label: 'Primary User', beneficiaryType: 'income' },
    { from: 'thn-p17', to: 'thn-a26', type: 'managed_by', label: 'Legal Advisor' },

    // Basquiat (thn-a28) — was 1
    { from: 'thn-p17', to: 'thn-a28', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-a45', to: 'thn-a28', type: 'insures', label: 'Covers' },

    // Ferrari (thn-a29) — was 2
    { from: 'thn-p1',  to: 'thn-a29', type: 'beneficiary_of', label: 'Primary User', beneficiaryType: 'income' },
    { from: 'thn-p17', to: 'thn-a29', type: 'managed_by', label: 'Legal Advisor' },

    // Bitcoin (thn-a30) — was 0
    { from: 'thn-p17', to: 'thn-a30', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p5',  to: 'thn-a30', type: 'beneficiary_of', label: 'Beneficiary', beneficiaryType: 'income' },

    // SLAT Portfolio (thn-a31) — was 0
    { from: 'thn-p17', to: 'thn-a31', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p3',  to: 'thn-a31', type: 'beneficiary_of', label: 'Income Beneficiary', beneficiaryType: 'income' },

    // CRT Fund (thn-a32) — was 0
    { from: 'thn-p17', to: 'thn-a32', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p3',  to: 'thn-a32', type: 'beneficiary_of', label: 'Income Beneficiary', beneficiaryType: 'income' },

    // Morgan Stanley (thn-a33) — was 0
    { from: 'thn-p17', to: 'thn-a33', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p1',  to: 'thn-a33', type: 'beneficiary_of', label: 'Account Holder', beneficiaryType: 'income' },

    // Foundation Endowment (thn-a34) — was 0
    { from: 'thn-p17', to: 'thn-a34', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-p1',  to: 'thn-a34', type: 'beneficiary_of', label: 'Board Chair', beneficiaryType: 'income' },

    // Foundation Art (thn-a35) — was 0
    { from: 'thn-p17', to: 'thn-a35', type: 'managed_by', label: 'Legal Advisor' },
    { from: 'thn-a45', to: 'thn-a35', type: 'insures', label: 'Covers' },

    // Helicopter (thn-a37) — was 1
    { from: 'thn-p1',  to: 'thn-a37', type: 'beneficiary_of', label: 'Primary User', beneficiaryType: 'income' },
    { from: 'thn-p17', to: 'thn-a37', type: 'managed_by', label: 'Legal Advisor' },

    // Sailing Yacht (thn-a39) — was 1
    { from: 'thn-p1',  to: 'thn-a39', type: 'beneficiary_of', label: 'Primary User', beneficiaryType: 'income' },

    // Tender Fleet (thn-a40) — was 1
    { from: 'thn-p1',  to: 'thn-a40', type: 'beneficiary_of', label: 'Primary User', beneficiaryType: 'income' },

    // Sequoia Fund (thn-a41) — was 0
    { from: 'thn-p17', to: 'thn-a41', type: 'managed_by', label: 'Legal Advisor' },

    // Blackstone RE (thn-a42) — was 0
    { from: 'thn-p17', to: 'thn-a42', type: 'managed_by', label: 'Legal Advisor' },

    // Vineyard (thn-a43) — was 1
    { from: 'thn-p6',  to: 'thn-a43', type: 'beneficiary_of', label: 'Primary Resident', beneficiaryType: 'income' },

    // ═══════════════════════════════════════════
    // COVERAGE — insurance policy → covered asset
    // ═══════════════════════════════════════════

    // Collector Vehicle Policy → Ferrari Collection
    { from: 'thn-a53', to: 'thn-a29', type: 'insures', label: 'Covers' },
    // Personal Auto Policy → Personal Vehicle Fleet
    { from: 'thn-a54', to: 'thn-a51', type: 'insures', label: 'Covers' },
    // Marine Hull & P&I → Yachts + Tenders
    { from: 'thn-a55', to: 'thn-a26', type: 'insures', label: 'Covers' },
    { from: 'thn-a55', to: 'thn-a39', type: 'insures', label: 'Covers' },
    { from: 'thn-a55', to: 'thn-a40', type: 'insures', label: 'Covers' },
    // Aviation Hull & Liability → Aircraft
    { from: 'thn-a38', to: 'thn-a25', type: 'insures', label: 'Covers' },
    { from: 'thn-a38', to: 'thn-a37', type: 'insures', label: 'Covers' },
    // Property & Casualty Portfolio → Properties
    { from: 'thn-a46', to: 'thn-a1',  type: 'insures', label: 'Covers' },
    { from: 'thn-a46', to: 'thn-a2',  type: 'insures', label: 'Covers' },
    { from: 'thn-a46', to: 'thn-a5',  type: 'insures', label: 'Covers' },
    { from: 'thn-a46', to: 'thn-a7',  type: 'insures', label: 'Covers' },
    { from: 'thn-a46', to: 'thn-a8',  type: 'insures', label: 'Covers' },
    // Crop & Agricultural Insurance → Agricultural properties
    { from: 'thn-a44', to: 'thn-a9',  type: 'insures', label: 'Covers' },
    { from: 'thn-a44', to: 'thn-a43', type: 'insures', label: 'Covers' },
]
