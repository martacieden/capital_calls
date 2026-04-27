/*
 * mock-pipeline.ts — Scripted AI processing sequences for the Fojo creation flow.
 *
 * Each scenario is a sequence of MIXED message types: Fojo text narration
 * interleaved with tool uses. This simulates a real AI conversation where
 * the assistant explains what it's doing between each step.
 *
 * Ref: FEEDBACK-SUMMARY.md §8 (Visible AI Processing Pipeline)
 */

export interface PipelineEntry {
    type: 'text' | 'tool'
    /** For text: the message. For tool: the tool name/action */
    text: string
    /** For tool: expandable detail shown when user clicks expand */
    detail?: string
    /** Delay before this entry appears (ms) */
    delayMs: number
    /** For tool: if true, pipeline pauses here for Q&A */
    pauseForQA?: boolean
}

export const PIPELINE_SEQUENCES: Record<string, PipelineEntry[]> = {
    'scenario-car': [
        { type: 'text', text: "Let me take a look at what you've shared...", delayMs: 600 },
        { type: 'tool', text: 'Analyzing input', detail: 'Found references to a vehicle in your description.\nKeywords detected: "Tesla", "Model S", "2024", "Plaid"\nThis looks like a high-value personal vehicle — I\'ll categorize it under Vehicles.', delayMs: 2000 },
        { type: 'text', text: "I found a vehicle — a **2024 Tesla Model S Plaid**. Let me look up the latest details.", delayMs: 800 },
        { type: 'tool', text: 'Searching web for vehicle specifications', detail: 'Checked Kelley Blue Book, NHTSA, and Tesla.com:\n\n• MSRP: $89,990 (new)\n• Current market value: $94,200 – $102,800\n• Drivetrain: Tri-Motor AWD, 1,020 hp\n• EPA Range: 348 miles\n• VIN pattern confirmed: 5YJ3E1EC*RF******\n• No open recalls for this model year', delayMs: 3000 },
        { type: 'tool', text: 'Fetching vehicle image', detail: 'Found a matching image from Tesla\'s media library.\nColor confirmed: Ultra Red exterior.\nSaved for use as the catalog card thumbnail.', delayMs: 1500 },
        { type: 'text', text: "I found a KBB market value of **$98,500**, but the purchase price in your document shows **$104,000**.", delayMs: 800, pauseForQA: true },
        { type: 'text', text: "Got it. Creating the record now.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Added to your catalog as a Vehicle with 5 fields:\n\n• VIN: 5YJ3E1EC8RF249817\n• Color: Ultra Red\n• Model Year: 2024\n• Estimated Value: $98,500\n• Registration State: New York\n\nLinked to Thornton Family Trust as the owner.', delayMs: 1200 },
    ],

    'scenario-insurance': [
        { type: 'text', text: "I'll analyze this document for you...", delayMs: 600 },
        { type: 'tool', text: 'Reading document', detail: 'This is a 12-page auto insurance policy from AIG Private Client Group.\n\nKey details extracted:\n• Policy #: AIG-2024-07824691\n• Insured: Thornton Family Trust\n• Coverage: $1M liability + comprehensive & collision\n• Premium: $4,200/year\n• Period: Jun 15, 2024 – Jun 15, 2027\n• Insured vehicle: 2024 Tesla Model S', delayMs: 2500 },
        { type: 'text', text: "This is an **AIG auto insurance policy** covering a 2024 Tesla Model S. Let me cross-reference with your existing assets.", delayMs: 800 },
        { type: 'tool', text: 'Cross-referencing with existing assets', detail: 'I searched your catalog for the insured vehicle:\n\n• "Tesla Model S" — not found\n• "2024 Tesla" — not found\n• VIN lookup — no match\n\nYou have 2 vehicles on file (Gulfstream G700, M/Y Sovereign), but not this Tesla. The policy references a car that isn\'t tracked yet.', delayMs: 2500, pauseForQA: true },
        { type: 'tool', text: 'Creating linked records', detail: 'Created 2 linked records:\n\n1. AIG Auto Insurance Policy (Insurance)\n   Policy Number, Coverage, Premium, Renewal Date\n\n2. 2024 Tesla Model S Plaid (Vehicle)\n   Insured By, Model Year, Estimated Value\n\nBoth records are linked: the policy covers the vehicle.', delayMs: 1500 },
    ],

    'scenario-property': [
        { type: 'text', text: "Let me look into this property for you...", delayMs: 600 },
        { type: 'tool', text: 'Analyzing input', detail: 'Found references to a residential property.\nAddress detected: 742 Evergreen Terrace, Lake Geneva, WI\nType: Single-family residential\nAdditional notes: colonial-style, guest cottage, 2.4 acres', delayMs: 2000 },
        { type: 'text', text: "Found a residential property at **742 Evergreen Terrace, Lake Geneva**. Let me pull public records and recent valuations.", delayMs: 800 },
        { type: 'tool', text: 'Searching public property records', detail: 'Checked Walworth County Assessor records:\n\n• Parcel: WC-2024-00847\n• Owner: Thornton Real Estate Holdings LLC\n• Zoning: R-1 Single Family Residential\n• Assessed value (2025): $3,180,000\n  Land: $1,200,000 · Improvements: $1,980,000\n• Annual property tax: $42,600', delayMs: 3000 },
        { type: 'tool', text: 'Fetching property images and details', detail: 'Pulled data from Zillow, Realtor.com, and satellite imagery:\n\n• Built: 1998\n• Size: 4,200 sqft on 2.4 acres\n• Layout: 5 bedrooms, 4 bathrooms\n• Last sold: $2,850,000 in 2018\n• Estimated current value: $3,200,000\n• Guest cottage confirmed via satellite view\n• 3 exterior photos + 1 aerial view saved', delayMs: 2500 },
        { type: 'text', text: "I notice this property is held by **Thornton Real Estate Holdings LLC**, but I want to confirm a few things.", delayMs: 800 },
        { type: 'tool', text: 'Checking ownership structure', detail: 'Verified against your catalog:\n\n• Thornton Real Estate Holdings LLC — found (entity thn-e3)\n• Ownership chain: Family Trust → Holdings LLC → Property\n• Tax filing status: Current, no liens detected', delayMs: 2000, pauseForQA: true },
        { type: 'text', text: "Everything checks out. Creating the record now.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Added to your catalog as a Property with 7 fields:\n\n• Address: 742 Evergreen Terrace, Lake Geneva, WI 53147\n• Square Footage: 4,200\n• Bedrooms: 5 · Bathrooms: 4\n• Lot Size: 2.4 acres\n• Year Built: 1998\n• Estimated Value: $3,200,000\n\nLinked to Thornton Real Estate Holdings LLC.', delayMs: 1200 },
    ],

    'scenario-boat': [
        { type: 'text', text: "A yacht — let me look into the maritime registries...", delayMs: 600 },
        { type: 'tool', text: 'Analyzing input', detail: 'Found references to a motor yacht.\nVessel name: M/Y Horizon\nBuilder: Azimut · Length: 85ft\nRegistry mentioned: Cayman Islands', delayMs: 1800 },
        { type: 'text', text: "I've identified **M/Y Horizon**, an 85ft Azimut motor yacht. Let me verify the registration and pull vessel data.", delayMs: 800 },
        { type: 'tool', text: 'Searching maritime registries', detail: 'Found in Cayman Islands Shipping Registry:\n\n• Official #: CI-742891\n• IMO: 9876543\n• Gross Tonnage: 198 GT\n• Built: 2022 by Azimut-Benetti, Viareggio, Italy\n• Flag: Cayman Islands (Red Ensign)\n• Owner: Thornton Maritime LLC\n\nAIS tracking (MarineTraffic):\n• Last position: Fort Lauderdale, FL\n• Status: Moored at Port Everglades', delayMs: 3500 },
        { type: 'tool', text: 'Fetching vessel specs and images', detail: 'From Azimut dealer network and YachtWorld:\n\n• Length: 85ft (25.9m) · Beam: 20ft 4in\n• Engines: Twin MTU 2,600 hp total\n• Cruising speed: 24 knots · Range: 380 nm\n• Cabins: 4 staterooms + crew quarters\n• Interior: Custom by Poltrona Frau\n• Market value: $8.2M – $8.8M\n\n4 images saved (2 exterior, 1 flybridge, 1 salon)', delayMs: 2800 },
        { type: 'text', text: "The vessel is registered to **Thornton Maritime LLC**, but I don't see an insurance policy linked to it. Should I flag that?", delayMs: 800 },
        { type: 'tool', text: 'Checking insurance coverage', detail: 'Searched your catalog for marine insurance policies:\n\n• Hull & liability policies: 1 found (Gulfstream G700 — aviation, not marine)\n• Marine-specific coverage: None found\n\nM/Y Horizon appears to be uninsured in your records. This may be a coverage gap.', delayMs: 2000, pauseForQA: true },
        { type: 'text', text: "Vessel verified and all specs confirmed. Creating the record.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Added to your catalog as Maritime with 7 fields:\n\n• Vessel Type: Motor Yacht\n• Length: 85ft / 26m\n• Builder: Azimut\n• Year Built: 2022\n• Registry: Cayman Islands\n• Home Port: Fort Lauderdale, FL\n• Estimated Value: $8,500,000\n\nLinked to Thornton Maritime LLC.', delayMs: 1200 },
    ],

    /* ── Document upload pipelines ─────────────────────────────────── */

    'scenario-doc-trust': [
        { type: 'text', text: "I'll read through this distribution schedule now...", delayMs: 600 },
        { type: 'tool', text: 'Reading document', detail: 'This is a 5-page distribution schedule for Dynasty Trust I.\n\nKey details extracted:\n• Trust: Dynasty Trust I (Irrevocable)\n• Period: Calendar Year 2025\n• Beneficiaries: 4 named (Natalie, Oliver, James IV, Caroline)\n• Total Distributions: $2.4M\n• Frequency: Quarterly (Mar, Jun, Sep, Dec)\n• Discretionary principal: $400K authorized', delayMs: 2500 },
        { type: 'text', text: "Found the **Dynasty Trust I 2025 Distribution Schedule**. Let me cross-reference with your existing timeline events.", delayMs: 800 },
        { type: 'tool', text: 'Matching distribution events to timeline', detail: 'Matched 4 quarterly distributions to existing timeline entries:\n\n• Q1 Mar 2025 — $600K · confirmed\n• Q2 Jun 2025 — $600K · confirmed\n• Q3 Sep 2025 — $600K · confirmed\n• Q4 Dec 2025 — $600K + $400K discretionary\n\nAll events align with the trust\'s governing instrument.', delayMs: 2800 },
        { type: 'text', text: "Everything checks out. Creating the record and opening the timeline.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Added to your catalog as a Trust document with 5 fields:\n\n• Trust: Dynasty Trust I\n• Period: 2025\n• Beneficiaries: 4\n• Total Distributions: $2.4M\n• Frequency: Quarterly\n\nTimeline updated with all 4 distribution events.', delayMs: 1200 },
    ],

    'scenario-doc-inventory': [
        { type: 'text', text: "Let me go through this inventory report...", delayMs: 600 },
        { type: 'tool', text: 'Reading document', detail: 'This is a 47-item asset inventory as of January 2026.\n\nCategories found:\n• Vehicles: 3 items (Tesla Model X, Gulfstream G700, M/Y Sovereign)\n• Real Estate: 4 properties (Hamptons, Manhattan apt, Montana Ranch, Palm Beach)\n• Art & Collectibles: 12 items (Warhol ×5, Basquiat ×3, sculpture ×4)\n• Aviation equipment: 2 items\n• Maritime assets: 1 item\n\nTotal reported value: $94.3M', delayMs: 3000 },
        { type: 'text', text: "Found **47 assets** across 5 categories with a total value of **$94.3M**. I need to know which entity owns this inventory.", delayMs: 800 },
        { type: 'tool', text: 'Cross-referencing with existing catalog', detail: 'Scanned your catalog for matching records:\n\n• 31 of 47 items already tracked\n• 16 items are new or unmatched\n• Potential duplicates flagged: 3\n\nRecommend linking to the primary trust entity before importing new records.', delayMs: 2500, pauseForQA: true },
        { type: 'text', text: "Linked. Creating the inventory record now.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Added inventory record with 4 fields:\n\n• Report Date: Jan 5, 2026\n• Asset Count: 47\n• Total Value: $94.3M\n• Categories: Vehicles, Real Estate, Art, Aviation, Maritime\n\nLinked to the selected entity. Catalog updated.', delayMs: 1200 },
    ],

    'scenario-doc-documents': [
        { type: 'text', text: "I'll scan these donation receipts now...", delayMs: 600 },
        { type: 'tool', text: 'Reading document', detail: 'This is a 9-page compilation of charitable acknowledgment letters.\n\nKey details:\n• Tax year: 2025\n• Recipients: 12 organizations\n• Total documented donations: $1.84M\n• Largest single gift: $500K (Lincoln Center)\n• Includes IRS-compliant acknowledgment language\n• All receipts dated between Jan–Dec 2025', delayMs: 2500 },
        { type: 'text', text: "Found **12 charitable receipts** totaling **$1.84M** for tax year 2025. I'll need to know which collection to file these under.", delayMs: 800 },
        { type: 'tool', text: 'Scanning document hub for existing collections', detail: 'Checked your document hub:\n\n• Trust Documents — 3 docs\n• Insurance Policies — 1 doc\n• Inventory Lists — 1 doc\n• Signatures — 0 docs\n\nNo existing collection for charitable records — you may want to create one or file under an existing collection.', delayMs: 2500, pauseForQA: true },
        { type: 'text', text: "Filed. Creating the document record now.", delayMs: 600 },
        { type: 'tool', text: 'Adding to document hub', detail: 'Document record created:\n\n• Name: Charitable Donation Receipts 2025\n• File: thornton-charitable-donations-2025.pdf\n• Pages: 9 · Size: 3.2 MB\n• Added to selected collection\n• Shared with: Michael Chen (CPA)\n\nReady for 2025 tax filing.', delayMs: 1200 },
    ],

    'scenario-doc-car-insurance': [
        { type: 'text', text: "I'll analyze this insurance policy...", delayMs: 600 },
        { type: 'tool', text: 'Reading document', detail: 'This is an 8-page Chubb Private Auto policy.\n\nKey details extracted:\n• Policy #: CHB-2025-09142024\n• Insured: Thornton Family Trust\n• Vehicle: 2024 Tesla Model X, VIN 5YJXCDE27LF249001\n• Coverage: $2M liability + comprehensive & collision\n• Premium: $6,800/year\n• Period: Sep 14, 2025 – Sep 14, 2026\n• Color: Pearl White Multi-Coat', delayMs: 2500 },
        { type: 'text', text: "This is a **Chubb auto policy** for a **2024 Tesla Model X**. Let me look up the vehicle specs and cross-reference your catalog.", delayMs: 800 },
        { type: 'tool', text: 'Searching vehicle records and public data', detail: 'Checked Kelley Blue Book, NHTSA, and Tesla.com:\n\n• MSRP: $99,990 (new)\n• Current market value: $104,500\n• Drivetrain: Dual Motor AWD, 670 hp\n• EPA Range: 348 miles\n• Seating: 7 passengers\n• VIN confirmed: 5YJXCDE27LF*\n\nNo open recalls for this model year.', delayMs: 3000 },
        { type: 'tool', text: 'Fetching vehicle image', detail: 'Retrieved matching image from Tesla media library.\nColor: Pearl White Multi-Coat exterior.\nSaved as catalog card thumbnail.', delayMs: 1200 },
        { type: 'text', text: "Vehicle confirmed. Creating the asset record now.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Added to your catalog as a Vehicle with 6 fields:\n\n• VIN: 5YJXCDE27LF249001\n• Color: Pearl White\n• Model Year: 2024\n• Estimated Value: $104,500\n• Policy Number: CHB-2025-09142024\n• Coverage: $2M Liability + Comprehensive\n\nLinked to Thornton Family Trust as the owner.', delayMs: 1200 },
    ],

    'scenario-doc-deed': [
        { type: 'text', text: "Let me pull the details from this property deed...", delayMs: 600 },
        { type: 'tool', text: 'Reading document', detail: 'This is a 6-page warranty deed.\n\nKey details extracted:\n• Property: 14 Meadow Lane, Southampton, NY 11968\n• Grantor: Meadow Lane Holdings LLC\n• Grantee: Thornton Real Estate Holdings LLC\n• Consideration: $16,200,000\n• Recorded: Suffolk County Clerk, June 15, 2024\n• Lot: 4.2 · Section: 14 · Block: 27', delayMs: 2500 },
        { type: 'text', text: "Found the deed for **14 Meadow Lane, Southampton**. Let me pull public records and current valuation data.", delayMs: 800 },
        { type: 'tool', text: 'Searching public property records', detail: 'Checked Suffolk County Assessor and Zillow:\n\n• Parcel: SC-2024-00144827\n• Owner: Thornton Real Estate Holdings LLC\n• Zoning: R-40 Residential\n• Assessed value (2025): $17,900,000\n  Land: $9,100,000 · Improvements: $8,800,000\n• Annual property tax: $183,600\n• Size: 8,400 sqft · Lot: 3.2 acres\n• Bedrooms: 7 · Bathrooms: 8', delayMs: 3000 },
        { type: 'tool', text: 'Fetching property images', detail: 'Retrieved 4 exterior photos and 1 aerial view.\nEstimated market value: $18,500,000 (oceanfront premium applied).\nSaved as catalog card thumbnail.', delayMs: 1500 },
        { type: 'text', text: "All data confirmed. Creating the property record now.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Added to your catalog as a Property with 7 fields:\n\n• Address: 14 Meadow Lane, Southampton, NY 11968\n• Square Footage: 8,400\n• Bedrooms: 7 · Bathrooms: 8\n• Lot Size: 3.2 acres\n• Year Built: 2001\n• Estimated Value: $18,500,000\n\nLinked to Thornton Real Estate Holdings LLC.', delayMs: 1200 },
    ],

    'scenario-doc-home-insurance': [
        { type: 'text', text: "I'll extract the coverage details from this policy...", delayMs: 600 },
        { type: 'tool', text: 'Reading document', detail: 'This is a 12-page AIG Private Client Group homeowners policy.\n\nKey details extracted:\n• Policy #: AIG-PCG-2025-014882\n• Insured: Thornton Real Estate Holdings LLC\n• Property: 14 Meadow Lane, Southampton, NY\n• Dwelling coverage: $18.5M\n• Personal property rider: Included (scheduled art & jewelry)\n• Liability: $5M umbrella\n• Annual premium: $89,400\n• Renewal: January 10, 2026', delayMs: 2500 },
        { type: 'text', text: "This is the **AIG homeowners policy for the Hamptons Estate**. Let me cross-reference with your existing records.", delayMs: 800 },
        { type: 'tool', text: 'Linking to property and entity records', detail: 'Found matching records in your catalog:\n\n• Property: 14 Meadow Lane (Hamptons Estate) — found\n• Owner: Thornton Real Estate Holdings LLC — found\n• Existing coverage: none on file for this property\n\nThis policy will be linked to both the property asset and the holding entity.', delayMs: 2800 },
        { type: 'text', text: "Coverage confirmed. Creating the insurance record and updating the relationship map.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Added to your catalog as an Insurance record with 6 fields:\n\n• Policy Number: AIG-PCG-2025-014882\n• Insurer: AIG Private Client Group\n• Dwelling Coverage: $18.5M\n• Personal Property Rider: Included\n• Annual Premium: $89,400\n• Renewal Date: 2026-01-10\n\nLinked to Hamptons Estate and Thornton Real Estate Holdings LLC. Relationship map updated.', delayMs: 1200 },
    ],

    /* ── Task pipelines ─────────────────────────────────────────────── */

    'scenario-task-review': [
        { type: 'text', text: "Let me look into this and set up a task...", delayMs: 600 },
        { type: 'tool', text: 'Analyzing context', detail: 'Reviewing the entity and its linked records:\n\n• Found 3 assets under this trust\n• 2 have active insurance policies\n• 1 has no coverage on file\n\nThis looks like a coverage review is warranted.', delayMs: 2200 },
        { type: 'tool', text: 'Checking related records', detail: 'Cross-referenced with existing tasks:\n\n• No duplicate tasks found\n• Last insurance review: 8 months ago\n• Renewal dates approaching for 2 policies', delayMs: 2000 },
        { type: 'text', text: "I've identified a coverage gap and upcoming renewals. Let me create a task to track this.", delayMs: 800, pauseForQA: true },
        { type: 'text', text: "Creating the task now.", delayMs: 600 },
        { type: 'tool', text: 'Creating task', detail: 'Task created:\n\n• Title: Review insurance coverage\n• Priority: High\n• Assignee: Sandra Thornton\n• Due: April 15, 2026\n• Linked to: Thornton Family Trust\n\n1 coverage gap flagged, 2 renewals tracked.', delayMs: 1500 },
    ],

    'scenario-task-annual': [
        { type: 'text', text: "I'll set up a review task for you...", delayMs: 600 },
        { type: 'tool', text: 'Analyzing trust provisions', detail: 'Reviewing the trust document:\n\n• Type: Revocable Living Trust\n• Last amended: September 2024\n• 4 named beneficiaries\n• 12 distribution events scheduled\n• Next distribution: Q2 2026', delayMs: 2500 },
        { type: 'text', text: "The trust was last amended in September 2024 and has **12 scheduled distributions**. An annual review would cover provisions, beneficiary designations, and distribution schedules.", delayMs: 800, pauseForQA: true },
        { type: 'text', text: "Setting up the review task.", delayMs: 600 },
        { type: 'tool', text: 'Creating task', detail: 'Task created:\n\n• Title: Schedule annual trust review\n• Priority: Normal\n• Assignee: Sandra Thornton\n• Due: May 1, 2026\n• Linked to: Revocable Living Trust\n\nReview checklist: trust provisions, beneficiary designations, distribution schedules, tax implications.', delayMs: 1500 },
    ],

    /* ── Relationship pipelines ─────────────────────────────────────── */

    'scenario-relation-move': [
        { type: 'text', text: "Let me analyze the current relationships...", delayMs: 600 },
        { type: 'tool', text: 'Mapping current connections', detail: 'Current relationship map:\n\n• Parent: Thornton Holdings LP\n• Type: LLC (Limited Liability Company)\n• 3 linked assets\n• 1 insurance policy\n• No circular dependencies detected', delayMs: 2500 },
        { type: 'text', text: "This entity is currently under **Thornton Holdings LP**. You want to move it to **Dynasty Trust I**.", delayMs: 800 },
        { type: 'tool', text: 'Checking for conflicts', detail: 'Verified:\n\n• Dynasty Trust I exists in catalog\n• No circular dependency would be created\n• Tax implications: entity moves from LP to trust jurisdiction\n• All linked assets and policies will follow', delayMs: 2000, pauseForQA: true },
        { type: 'text', text: "Updating the graph now.", delayMs: 600 },
        { type: 'tool', text: 'Updating relationship graph', detail: 'Changes applied:\n\n• Removed: Thornton Holdings LP → entity (Owned by)\n• Added: Dynasty Trust I → entity (Owned by)\n• Effective: April 1, 2026\n\nAll linked assets and policies remain connected.', delayMs: 1500 },
    ],

    'scenario-relation-beneficiary': [
        { type: 'text', text: "Let me check the current beneficiary structure...", delayMs: 600 },
        { type: 'tool', text: 'Analyzing trust beneficiaries', detail: 'Current beneficiaries of Marital Trust:\n\n• Catherine Thornton — Primary (50%)\n• Edward Thornton IV — Contingent\n\nDistribution schedule: Semi-annual\nTrust corpus: $4.2M estimated', delayMs: 2500 },
        { type: 'text', text: "The **Marital Trust** currently has 2 beneficiaries. Adding a new designation will update the distribution structure.", delayMs: 800, pauseForQA: true },
        { type: 'text', text: "Updating the beneficiary records now.", delayMs: 600 },
        { type: 'tool', text: 'Updating beneficiary designation', detail: 'Changes applied:\n\n• Added new beneficiary designation\n• Distribution frequency: Quarterly\n• Effective: April 1, 2026\n• Trust distribution schedule updated\n\nAll existing beneficiary designations remain unchanged.', delayMs: 1800 },
    ],
}

/** Get pipeline sequence for a scenario, with a generic fallback */
export function getPipelineSequence(scenarioId: string): PipelineEntry[] {
    return PIPELINE_SEQUENCES[scenarioId] ?? [
        { type: 'text', text: "Let me analyze this for you...", delayMs: 600 },
        { type: 'tool', text: 'Analyzing input', detail: 'Parsing content and extracting structured data...', delayMs: 2000 },
        { type: 'tool', text: 'Searching for additional details', detail: 'Querying public databases and web sources...', delayMs: 2500 },
        { type: 'text', text: "Found everything I need. Creating the record.", delayMs: 600 },
        { type: 'tool', text: 'Creating catalog record', detail: 'Populating fields and linking relationships...', delayMs: 1200 },
    ]
}
