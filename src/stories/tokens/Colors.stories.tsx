import type { Meta, StoryObj } from '@storybook/react-vite'

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
      <div style={{ width: 36, height: 36, borderRadius: 6, background: value, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <code style={{ fontSize: 13, fontWeight: 600 }}>{name}</code>
        <span style={{ fontSize: 12, color: '#64748B' }}>{value}</span>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60646C', marginBottom: 8, borderBottom: '1px solid #E8E8EC', paddingBottom: 6 }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0 24px' }}>{children}</div>
    </div>
  )
}

function AllColors() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Color Tokens</h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>All values from <code>src/styles/tokens.css</code></p>

      <Section title="Core Neutrals">
        <Swatch name="--color-white" value="#FFF" />
        <Swatch name="--color-black" value="#1C2024" />
        <Swatch name="--color-gray-2" value="#F9F9FB" />
        <Swatch name="--color-gray-4" value="#E8E8EC" />
        <Swatch name="--color-gray-5" value="#E0E1E6" />
        <Swatch name="--color-gray-11" value="#60646C" />
        <Swatch name="--color-gray-12" value="#1C2024" />
      </Section>

      <Section title="Neutral Scale">
        <Swatch name="--color-neutral-2" value="#F5F5F7" />
        <Swatch name="--color-neutral-3" value="#F0F0F3" />
        <Swatch name="--color-neutral-4" value="#E8E8EC" />
        <Swatch name="--color-neutral-5" value="#E0E1E6" />
        <Swatch name="--color-neutral-7" value="#A9AAB4" />
        <Swatch name="--color-neutral-8" value="#90A0B2" />
        <Swatch name="--color-neutral-9" value="#8B8D98" />
        <Swatch name="--color-neutral-10" value="#80838D" />
        <Swatch name="--color-neutral-11" value="#454950" />
        <Swatch name="--color-neutral-12" value="#1C2024" />
        <Swatch name="--color-neutral-line" value="#D0D2DA" />
        <Swatch name="--color-neutral-muted" value="#9CA3AF" />
        <Swatch name="--color-neutral-placeholder" value="#A1A1AA" />
        <Swatch name="--color-neutral-text" value="#64748B" />
      </Section>

      <Section title="Accent (Blue)">
        <Swatch name="--color-accent-9" value="#005BE2" />
        <Swatch name="--color-accent-10" value="#0047b8" />
        <Swatch name="--color-accent-3" value="#EBF3FF" />
        <Swatch name="--color-accent-contrast" value="#FFF" />
        <Swatch name="--color-blue-1" value="#EBF3FF" />
        <Swatch name="--color-blue-hover" value="#DCEAFF" />
        <Swatch name="--color-blue-9" value="#3B82F6" />
        <Swatch name="--color-blue-dark" value="#1E3A8A" />
      </Section>

      <Section title="Status">
        <Swatch name="--color-green-9" value="#059669" />
        <Swatch name="--color-green-1" value="#e6f6eb" />
        <Swatch name="--color-green-bright" value="#10B981" />
        <Swatch name="--color-green-text" value="#30a46c" />
        <Swatch name="--color-red-9" value="#e5484d" />
        <Swatch name="--color-red-1" value="#fff5f5" />
        <Swatch name="--color-red-dark" value="#b91c1c" />
        <Swatch name="--color-orange-1" value="#FFEDD5" />
        <Swatch name="--color-orange-9" value="#C2410C" />
        <Swatch name="--color-orange-hover" value="#FED7AA" />
      </Section>

      <Section title="Card Accent Palette">
        <Swatch name="--color-card-blue-bg" value="#EFF6FF" />
        <Swatch name="--color-card-blue" value="#3B82F6" />
        <Swatch name="--color-card-green-bg" value="#D1FAE5" />
        <Swatch name="--color-card-green" value="#059669" />
        <Swatch name="--color-card-pink-bg" value="#FCE7F3" />
        <Swatch name="--color-card-pink" value="#EC4899" />
        <Swatch name="--color-card-pink-bold" value="#DB2777" />
        <Swatch name="--color-card-purple-bg" value="#EDE9FE" />
        <Swatch name="--color-card-purple" value="#8B5CF6" />
        <Swatch name="--color-card-red-bg" value="#FEF2F2" />
        <Swatch name="--color-card-red" value="#F87171" />
        <Swatch name="--color-card-orange-bg" value="#FFF7ED" />
        <Swatch name="--color-card-orange" value="#EA580C" />
      </Section>
    </div>
  )
}

const meta: Meta = {
  title: 'Tokens/Colors',
  component: AllColors,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
