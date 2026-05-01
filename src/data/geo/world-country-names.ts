/**
 * Portfolio `Asset.country` / labels → TopoJSON Ne 50m `properties.name`.
 * Extend when ROW exposure includes more jurisdictions.
 */
const DATA_LABEL_TO_TOPO_NAME: Record<string, string> = {
    'United States': 'United States of America',
    'Russia': 'Russian Federation',
    'South Korea': 'South Korea',
    'North Korea': 'North Korea',
    Czechia: 'Czech Republic',
    'Ivory Coast': "Côte d'Ivoire",
}

/** Resolve a portfolio country label to Natural Earth admin name (for id lookup). */
export function topoAdminName(portfolioCountry: string): string {
    return DATA_LABEL_TO_TOPO_NAME[portfolioCountry] ?? portfolioCountry
}
