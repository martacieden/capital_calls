/**
 * Frozen screen-space rect for positioning portaled prompts (AI action dropdown).
 */
export type PromptAnchorRect = {
    top: number
    left: number
    width: number
    height: number
}

export function snapshotPromptAnchor(rect: DOMRect): PromptAnchorRect {
    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    }
}
