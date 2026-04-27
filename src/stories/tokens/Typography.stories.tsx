import type { Meta, StoryObj } from '@storybook/react-vite'

function TypographyPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Typography</h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>Font families and weight scale from <code>tokens.css</code></p>

      <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60646C', marginBottom: 12, borderBottom: '1px solid #E8E8EC', paddingBottom: 6 }}>Font Families</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        <div>
          <code style={{ fontSize: 12, color: '#64748B' }}>--font-family (Inter)</code>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, margin: '4px 0' }}>The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <code style={{ fontSize: 12, color: '#64748B' }}>--font-display (Space Grotesk)</code>
          <p style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', fontSize: 20, margin: '4px 0' }}>The quick brown fox jumps over the lazy dog</p>
        </div>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60646C', marginBottom: 12, borderBottom: '1px solid #E8E8EC', paddingBottom: 6 }}>Weight Scale</h3>
      <p style={{ fontSize: 13, color: '#C2410C', background: '#FFEDD5', padding: '8px 12px', borderRadius: 6, marginBottom: 16 }}>
        ⚠️ Non-standard scale: regular=500, medium=600, semibold=700, bold=800. Tailwind's <code>font-normal</code> maps to 500 (not 400).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {([
          ['400', 'True 400 (lighter than project "normal")', 400],
          ['--font-weight-regular (500)', 'font-normal in Tailwind', 500],
          ['--font-weight-medium (600)', 'font-medium in Tailwind', 600],
          ['--font-weight-semibold (700)', 'font-semibold in Tailwind', 700],
          ['--font-weight-bold (800)', 'font-bold in Tailwind', 800],
        ] as [string, string, number][]).map(([name, desc, weight]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontWeight: weight, fontSize: 18, minWidth: 200 }}>Aa Bb Cc 123</span>
            <code style={{ fontSize: 12, fontWeight: 600 }}>{name}</code>
            <span style={{ fontSize: 12, color: '#64748B' }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const meta: Meta = {
  title: 'Tokens/Typography',
  component: TypographyPage,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
