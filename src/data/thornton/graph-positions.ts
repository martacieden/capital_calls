/**
 * Thornton family — hardcoded layout coordinates
 * and visual hierarchy edges for the family tree graph view.
 */

/** Thornton family — 56 items across 5 rows, 3 trust columns */
export const THORNTON_POSITIONS: Record<string, { x: number; y: number }> = {
    // ── People row (y = 407) — centered over full canvas ──
    'thn-p1':  { x: 6048,  y: 407 },
    'thn-p3':  { x: 6553,  y: 407 },
    'thn-p4':  { x: 7058,  y: 407 },
    'thn-p5':  { x: 7561,  y: 407 },
    'thn-p6':  { x: 8065,  y: 407 },
    'thn-p17': { x: 8570,  y: 407 },

    // ── Trusts row (y = 792) — centered over their entity groups ──
    'thn-t1':  { x: 3172,  y: 792 },   // RLT
    'thn-t2':  { x: 11365, y: 792 },   // Dynasty I
    'thn-t3':  { x: 16398, y: 792 },   // Dynasty II

    // ── Entities row (y = 1137) — centered over their asset groups ──
    // Under RLT (4)
    'thn-e1':  { x: 904,   y: 1137 },  // Family Office
    'thn-e3':  { x: 3171,  y: 1137 },  // RE Holdings
    'thn-e2':  { x: 5638,  y: 1137 },  // Capital Group
    'thn-e12': { x: 7825,  y: 1137 },  // Foundation
    // Under Dynasty I (4)
    'thn-e6':  { x: 9128,  y: 1137 },  // Art Fund
    'thn-e4':  { x: 10491, y: 1137 },  // Aviation
    'thn-e5':  { x: 12178, y: 1137 },  // Maritime
    'thn-e9':  { x: 13601, y: 1137 },  // Ventures
    // Under Dynasty II (3)
    'thn-e7':  { x: 14983, y: 1137 },  // PE Aggregator
    'thn-e8':  { x: 16345, y: 1137 },  // Agriculture
    'thn-e10': { x: 17812, y: 1137 },  // Insurance Holdings

    // ── Assets row (y = 1462) ──
    // gap within type group: 400px (360 card + 40px).
    // gap between type groups under same LLC: ~485px.
    // gap between LLCs: ~582px.

    // Under Family Office (6) — start x=0
    //   Investments (3)
    'thn-a11': { x: 0,     y: 1462 },  // Goldman Sachs
    'thn-a13': { x: 400,   y: 1462 },  // Vanguard Index
    'thn-a33': { x: 800,   y: 1462 },  // Morgan Stanley
    //   Personal property (2)
    'thn-a50': { x: 1285,  y: 1462 },  // Rare Book Library
    'thn-a52': { x: 1685,  y: 1462 },  // Furniture & Antiques
    //   Vehicles (1)
    'thn-a51': { x: 2170,  y: 1462 },  // Personal Vehicle Fleet

    // Under RE Holdings (4)
    'thn-a1':  { x: 2752,  y: 1462 },  // Fifth Ave Penthouse
    'thn-a2':  { x: 3152,  y: 1462 },  // Hamptons Estate
    'thn-a5':  { x: 3552,  y: 1462 },  // London Mayfair
    'thn-a7':  { x: 3952,  y: 1462 },  // Montana Ranch

    // Under Capital Group (6)
    //   Investments (1)
    'thn-a10': { x: 4533,  y: 1462 },  // JPMorgan
    //   Vehicles (1)
    'thn-a29': { x: 5176,  y: 1462 },  // Ferrari Collection
    //   Collectibles (3)
    'thn-a47': { x: 5818,  y: 1462 },  // Jewelry Collection
    'thn-a48': { x: 6218,  y: 1462 },  // Watch Collection
    'thn-a49': { x: 6618,  y: 1462 },  // Wine Cellar
    //   Property (1)
    'thn-a8':  { x: 7103,  y: 1462 },  // Fifth Ave Commercial

    // Under Foundation (2)
    'thn-a34': { x: 7685,  y: 1462 },  // Foundation Endowment
    //   Art (1)
    'thn-a35': { x: 8327,  y: 1462 },  // Foundation Art Collection

    // Under Art Fund (3)
    'thn-a27': { x: 8909,  y: 1462 },  // Warhol Portfolio
    'thn-a28': { x: 9309,  y: 1462 },  // Basquiat Collection
    'thn-a36': { x: 9709,  y: 1462 },  // Kusama Installation

    // Under Aviation (2)
    'thn-a25': { x: 10291, y: 1462 },  // Gulfstream G700
    'thn-a37': { x: 10691, y: 1462 },  // Bell 525 Helicopter

    // Under Maritime (3)
    //   Yachts (2)
    'thn-a26': { x: 11915, y: 1462 },  // Motor Yacht Sovereign
    'thn-a39': { x: 12315, y: 1462 },  // Sailing Yacht Aurora
    //   Tenders (1)
    'thn-a40': { x: 12800, y: 1462 },  // Tender Fleet

    // Under Ventures (3)
    'thn-a12': { x: 13382, y: 1462 },  // BlackRock Fixed Income
    'thn-a30': { x: 13782, y: 1462 },  // Bitcoin & Digital Assets
    'thn-a41': { x: 14182, y: 1462 },  // Sequoia Capital Fund

    // Under PE Aggregator (3)
    'thn-a15': { x: 14764, y: 1462 },  // KKR Fund
    'thn-a31': { x: 15164, y: 1462 },  // SLAT Portfolio
    'thn-a42': { x: 15564, y: 1462 },  // Blackstone RE Fund

    // Under Agriculture (2)
    'thn-a9':  { x: 16145, y: 1462 },  // Iowa Farmland
    'thn-a43': { x: 16545, y: 1462 },  // Oregon Vineyard

    // Under Insurance Holdings (2)
    'thn-a24': { x: 17612, y: 1462 },  // Life Insurance
    'thn-a45': { x: 18012, y: 1462 },  // Umbrella Liability

    // ── Insurance row (y = 1787) — policies below the assets they cover ──
    'thn-a54': { x: 2170,  y: 1787 },  // Personal Auto → below Vehicle Fleet
    'thn-a46': { x: 3352,  y: 1787 },  // P&C Portfolio → below RE Holdings properties
    'thn-a53': { x: 5176,  y: 1787 },  // Collector Vehicle → below Ferrari
    'thn-a38': { x: 10491, y: 1787 },  // Aviation Insurance → below aircraft
    'thn-a55': { x: 12358, y: 1787 },  // Marine Hull & P&I → below yachts
    'thn-a44': { x: 16345, y: 1787 },  // Crop Insurance → below farmland
}

/**
 * Visual hierarchy edges — clean top-to-bottom tree, no crossing.
 */
export const THORNTON_VISUAL_EDGES: Array<{ from: string; to: string; label: string }> = [
    // People → Trusts
    { from: 'thn-p1', to: 'thn-t1', label: 'Grantor' },
    { from: 'thn-p1', to: 'thn-t2', label: 'Grantor' },
    { from: 'thn-p1', to: 'thn-t3', label: 'Grantor' },
    { from: 'thn-p3', to: 'thn-t1', label: 'Co-Trustee' },
    { from: 'thn-p4', to: 'thn-t1', label: 'Successor Trustee' },
    { from: 'thn-p5', to: 'thn-t2', label: 'Beneficiary' },
    { from: 'thn-p6', to: 'thn-t2', label: 'Beneficiary' },
    { from: 'thn-p17', to: 'thn-t2', label: 'Trust Protector' },
    { from: 'thn-p17', to: 'thn-t3', label: 'Trust Protector' },

    // RLT → entities
    { from: 'thn-t1', to: 'thn-e1',  label: 'Owns 100%' },
    { from: 'thn-t1', to: 'thn-e3',  label: 'Owns' },
    { from: 'thn-t1', to: 'thn-e2',  label: 'Owns' },
    { from: 'thn-t1', to: 'thn-e12', label: 'Owns 100%' },

    // Dynasty I → entities
    { from: 'thn-t2', to: 'thn-e6', label: 'Owns' },
    { from: 'thn-t2', to: 'thn-e4', label: 'Owns 100%' },
    { from: 'thn-t2', to: 'thn-e5', label: 'Owns 100%' },
    { from: 'thn-t2', to: 'thn-e9', label: 'Owns 100%' },

    // Dynasty II → entities
    { from: 'thn-t3', to: 'thn-e7',  label: 'Owns 100%' },
    { from: 'thn-t3', to: 'thn-e8',  label: 'Owns 100%' },
    { from: 'thn-t3', to: 'thn-e10', label: 'Owns 100%' },

    // Family Office → assets
    { from: 'thn-e1', to: 'thn-a11', label: 'Holds' },
    { from: 'thn-e1', to: 'thn-a13', label: 'Holds' },
    { from: 'thn-e1', to: 'thn-a33', label: 'Holds' },
    { from: 'thn-e1', to: 'thn-a50', label: 'Holds' },
    { from: 'thn-e1', to: 'thn-a51', label: 'Holds' },
    { from: 'thn-e1', to: 'thn-a52', label: 'Holds' },
    // RE Holdings → assets
    { from: 'thn-e3', to: 'thn-a1',  label: 'Holds' },
    { from: 'thn-e3', to: 'thn-a2',  label: 'Holds' },
    { from: 'thn-e3', to: 'thn-a5',  label: 'Holds' },
    { from: 'thn-e3', to: 'thn-a7',  label: 'Holds' },
    // Capital Group → assets
    { from: 'thn-e2', to: 'thn-a10', label: 'Holds' },
    { from: 'thn-e2', to: 'thn-a29', label: 'Holds' },
    { from: 'thn-e2', to: 'thn-a8',  label: 'Holds' },
    { from: 'thn-e2', to: 'thn-a47', label: 'Holds' },
    { from: 'thn-e2', to: 'thn-a48', label: 'Holds' },
    { from: 'thn-e2', to: 'thn-a49', label: 'Holds' },
    // Foundation → assets
    { from: 'thn-e12', to: 'thn-a34', label: 'Holds' },
    { from: 'thn-e12', to: 'thn-a35', label: 'Holds' },
    // Art Fund → assets
    { from: 'thn-e6', to: 'thn-a27', label: 'Holds' },
    { from: 'thn-e6', to: 'thn-a28', label: 'Holds' },
    { from: 'thn-e6', to: 'thn-a36', label: 'Holds' },
    // Aviation → assets
    { from: 'thn-e4', to: 'thn-a25', label: 'Holds' },
    { from: 'thn-e4', to: 'thn-a37', label: 'Holds' },
    // Maritime → assets
    { from: 'thn-e5', to: 'thn-a26', label: 'Holds' },
    { from: 'thn-e5', to: 'thn-a39', label: 'Holds' },
    { from: 'thn-e5', to: 'thn-a40', label: 'Holds' },
    // Ventures → assets
    { from: 'thn-e9', to: 'thn-a12', label: 'Holds' },
    { from: 'thn-e9', to: 'thn-a30', label: 'Holds' },
    { from: 'thn-e9', to: 'thn-a41', label: 'Holds' },
    // PE Aggregator → assets
    { from: 'thn-e7', to: 'thn-a15', label: 'Holds' },
    { from: 'thn-e7', to: 'thn-a31', label: 'Holds' },
    { from: 'thn-e7', to: 'thn-a42', label: 'Holds' },
    // Agriculture → assets
    { from: 'thn-e8', to: 'thn-a9',  label: 'Holds' },
    { from: 'thn-e8', to: 'thn-a43', label: 'Holds' },
    // Insurance Holdings → assets
    { from: 'thn-e10', to: 'thn-a24', label: 'Holds' },
    { from: 'thn-e10', to: 'thn-a45', label: 'Holds' },

    // Assets → Insurance (coverage hierarchy)
    { from: 'thn-a51', to: 'thn-a54', label: 'Covered by' },  // Vehicle Fleet → Personal Auto
    { from: 'thn-a1',  to: 'thn-a46', label: 'Covered by' },  // Penthouse → P&C
    { from: 'thn-a2',  to: 'thn-a46', label: 'Covered by' },  // Hamptons → P&C
    { from: 'thn-a5',  to: 'thn-a46', label: 'Covered by' },  // London → P&C
    { from: 'thn-a7',  to: 'thn-a46', label: 'Covered by' },  // Montana → P&C
    { from: 'thn-a29', to: 'thn-a53', label: 'Covered by' },  // Ferrari → Collector Vehicle
    { from: 'thn-a25', to: 'thn-a38', label: 'Covered by' },  // Gulfstream → Aviation Ins
    { from: 'thn-a37', to: 'thn-a38', label: 'Covered by' },  // Bell 525 → Aviation Ins
    { from: 'thn-a26', to: 'thn-a55', label: 'Covered by' },  // M/Y Sovereign → Marine Hull
    { from: 'thn-a39', to: 'thn-a55', label: 'Covered by' },  // S/Y Aurora → Marine Hull
    { from: 'thn-a40', to: 'thn-a55', label: 'Covered by' },  // Tenders → Marine Hull
    { from: 'thn-a9',  to: 'thn-a44', label: 'Covered by' },  // Iowa Farmland → Crop Ins
    { from: 'thn-a43', to: 'thn-a44', label: 'Covered by' },  // Oregon Vineyard → Crop Ins
]
