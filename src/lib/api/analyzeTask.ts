// Set VITE_ANTHROPIC_API_KEY in .env.local to enable AI-powered task analysis.
// Without it the function falls back to local keyword detection.

const SYSTEM_PROMPT = `You are a task creation assistant for a family office platform.
Based on the user's input, determine:
1. Task type: "Insurance", "Maintenance", or "Legal"
2. Task title (short, clear)
3. Related asset type if mentioned
4. Suggested assignee role
5. Whether it should be recurring (true/false)
6. If recurring, suggest interval (e.g. "Every 12 months", "Every 6 months")

Return JSON only. No explanation.

Example output:
{
  "type": "Insurance",
  "title": "Renew Hull & Machinery Insurance – Azimut 72",
  "relatedAssetType": "Maritime",
  "assigneeRole": "Insurance Advisor",
  "recurring": true,
  "recurrenceInterval": "Every 12 months",
  "priority": "High"
}`

export interface AnalyzedTask {
    type: 'Insurance' | 'Maintenance' | 'Legal'
    title: string
    relatedAssetType?: string
    assigneeRole: string
    recurring: boolean
    recurrenceInterval?: string
    priority: 'High' | 'Medium' | 'Low'
}

export async function analyzeTaskInput(userText: string): Promise<AnalyzedTask> {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) return localAnalyze(userText)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-client-side-api-key-access': 'true',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userText }],
        }),
    })

    if (!response.ok) {
        const err = await response.text().catch(() => '')
        throw new Error(`Anthropic API ${response.status}: ${err}`)
    }

    const data = await response.json()
    const text: string = data.content?.[0]?.text ?? ''

    // Strip any markdown code fences the model may have added
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in API response')

    return JSON.parse(match[0]) as AnalyzedTask
}

// Keyword-based fallback — no API key required
function localAnalyze(text: string): AnalyzedTask {
    const lower = text.toLowerCase()

    let type: AnalyzedTask['type'] = 'Legal'
    let assigneeRole = 'Estate Attorney'

    if (/insurance|renew|policy|coverage|premium|broker|expir/.test(lower)) {
        type = 'Insurance'
        assigneeRole = 'Insurance Advisor'
    } else if (/service|maintenance|repair|inspection|engine|haul.?out|annual check/.test(lower)) {
        type = 'Maintenance'
        if (/yacht|boat|vessel|maritime/.test(lower)) assigneeRole = 'Marine Technician'
        else if (/aircraft|jet|aviation|helicopter/.test(lower)) assigneeRole = 'Aviation Manager'
        else assigneeRole = 'Maintenance Technician'
    }

    let priority: AnalyzedTask['priority'] = 'Medium'
    if (/urgent|critical|high priority|asap|immediately/.test(lower)) priority = 'High'
    else if (/low|minor|whenever|not urgent/.test(lower)) priority = 'Low'

    const recurring = /annual|yearly|monthly|recurring|every \d/.test(lower)
    let recurrenceInterval: string | undefined
    if (recurring) {
        if (/6.month|bi.annual|twice a year/.test(lower)) recurrenceInterval = 'Every 6 months'
        else if (/quarter/.test(lower)) recurrenceInterval = 'Every 3 months'
        else recurrenceInterval = 'Every 12 months'
    }

    let relatedAssetType: string | undefined
    if (/yacht|boat|vessel|maritime/.test(lower)) relatedAssetType = 'Maritime'
    else if (/jet|aircraft|aviation|helicopter/.test(lower)) relatedAssetType = 'Aviation'
    else if (/\bcar\b|vehicle|rolls.?royce/.test(lower)) relatedAssetType = 'Vehicles'
    else if (/villa|house|property|apartment|estate|real estate/.test(lower)) relatedAssetType = 'Real Estate'
    else if (/art|painting|collection|watch|wine/.test(lower)) relatedAssetType = 'Art & Collectibles'

    // Capitalise and trim the raw input as a draft title
    const trimmed = text.trim()
    const title = trimmed.charAt(0).toUpperCase() + trimmed.slice(1, 72) + (trimmed.length > 72 ? '…' : '')

    return { type, title, relatedAssetType, assigneeRole, recurring, recurrenceInterval, priority }
}
