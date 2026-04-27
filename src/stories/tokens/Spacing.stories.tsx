import type { Meta, StoryObj } from '@storybook/react-vite'

function SpacingPage() {
  const spacingScale = [
    ['--spacing-1', '4px'], ['--spacing-2', '8px'], ['--spacing-3', '12px'], ['--spacing-4', '16px'],
    ['--spacing-5', '24px'], ['--spacing-6', '32px'], ['--spacing-7', '40px'], ['--spacing-8', '56px'],
  ]

  const radiusScale = [
    ['--radius-sm', '4px'], ['--radius-md', '4px'], ['--radius-lg', '8px'],
    ['--radius-xl', '8px'], ['--radius-2xl', '12px'], ['--radius-full', '9999px'],
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Spacing & Radius</h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>Layout tokens from <code>tokens.css</code></p>

      <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60646C', marginBottom: 12, borderBottom: '1px solid #E8E8EC', paddingBottom: 6 }}>Spacing Scale</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        {spacingScale.map(([name, value]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <code style={{ fontSize: 13, fontWeight: 600, minWidth: 140 }}>{name}</code>
            <span style={{ fontSize: 12, color: '#64748B', minWidth: 40 }}>{value}</span>
            <div style={{ height: 12, width: parseInt(value), background: '#005BE2', borderRadius: 2 }} />
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60646C', marginBottom: 12, borderBottom: '1px solid #E8E8EC', paddingBottom: 6 }}>Border Radius</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        {radiusScale.map(([name, value]) => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 48, height: 48, background: '#EBF3FF', border: '2px solid #005BE2', borderRadius: value }} />
            <code style={{ fontSize: 11, fontWeight: 600 }}>{name}</code>
            <span style={{ fontSize: 11, color: '#64748B' }}>{value}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60646C', marginBottom: 12, borderBottom: '1px solid #E8E8EC', paddingBottom: 6 }}>Layout Tokens</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['--nav-width', '56px'], ['--fojo-width', '384px'], ['--detail-panel-width', '500px']].map(([name, value]) => (
          <div key={name} style={{ display: 'flex', gap: 16 }}>
            <code style={{ fontSize: 13, fontWeight: 600, minWidth: 200 }}>{name}</code>
            <span style={{ fontSize: 12, color: '#64748B' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const meta: Meta = {
  title: 'Tokens/Spacing',
  component: SpacingPage,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
