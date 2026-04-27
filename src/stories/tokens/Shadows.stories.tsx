import type { Meta, StoryObj } from '@storybook/react-vite'

function ShadowCard({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ width: 200, height: 100, background: '#FFF', borderRadius: 8, boxShadow: value, border: '1px solid rgba(0,0,0,0.04)' }} />
      <code style={{ fontSize: 12, fontWeight: 600 }}>{name}</code>
      <span style={{ fontSize: 11, color: '#64748B', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}

function ShadowsPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Shadows</h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>Elevation tokens from <code>tokens.css</code></p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 32 }}>
        <ShadowCard name="--shadow-card" value="0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" />
        <ShadowCard name="--shadow-card-hover" value="0 4px 12px rgba(0,0,0,0.06)" />
        <ShadowCard name="--shadow-card-elevated" value="0 4px 14px rgba(0,0,0,0.11)" />
        <ShadowCard name="--shadow-subtle" value="0 2px 8px rgba(0,0,0,0.06)" />
        <ShadowCard name="--shadow-focus" value="0 0 0 3px rgba(0,0,0,0.1)" />
        <ShadowCard name="--shadow-dropdown" value="0 4px 16px rgba(0,0,0,0.10)" />
        <ShadowCard name="--shadow-toolbar" value="0 20px 8px 0 rgba(0,0,0,0.01), 0 6px 7px 0 rgba(0,0,0,0.01)" />
        <ShadowCard name="--shadow-panel" value="0 43px 12px 0 rgba(0,0,0,0.01), 0 20px 8px 0 rgba(0,0,0,0.01), 0 11px 7px 0 rgba(0,0,0,0.02)" />
      </div>
    </div>
  )
}

const meta: Meta = {
  title: 'Tokens/Shadows',
  component: ShadowsPage,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
