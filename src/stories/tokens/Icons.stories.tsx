import type { Meta, StoryObj } from '@storybook/react-vite'
import * as TablerIcons from '@tabler/icons-react'

const ICON_GROUPS: Record<string, string[]> = {
  Navigation: ['IconSearch', 'IconHome', 'IconSchema', 'IconList', 'IconLayoutGrid', 'IconArrowLeft', 'IconArrowRight', 'IconArrowUpRight', 'IconExternalLink'],
  Chevrons: ['IconChevronDown', 'IconChevronRight', 'IconChevronLeft', 'IconChevronUp'],
  Actions: ['IconPlus', 'IconX', 'IconDots', 'IconPencil', 'IconTrash', 'IconCheck', 'IconCopy', 'IconDownload', 'IconUpload'],
  Entities: ['IconUser', 'IconUsers', 'IconBuildingBank', 'IconBriefcase', 'IconShield', 'IconHome', 'IconCar', 'IconAnchor', 'IconPalette', 'IconTrendingUp'],
  Finance: ['IconCoin', 'IconDiamond', 'IconWallet', 'IconScale', 'IconGavel', 'IconCertificate', 'IconChartDonut', 'IconChartBar'],
  Documents: ['IconFile', 'IconFileText', 'IconFileTypePdf', 'IconFolder', 'IconPaperclip', 'IconCloudUpload', 'IconLink'],
  Communication: ['IconFlag', 'IconBell', 'IconMessageCircle', 'IconSend'],
  Status: ['IconAlertTriangle', 'IconCircleCheck', 'IconLoader2', 'IconCalendarEvent', 'IconClock', 'IconEye'],
}

function IconsPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Icons</h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>Tabler Icons used across the prototype, grouped by function</p>

      {Object.entries(ICON_GROUPS).map(([group, names]) => (
        <div key={group} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60646C', marginBottom: 12, borderBottom: '1px solid #E8E8EC', paddingBottom: 6 }}>{group}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {names.map(name => {
              const Icon = (TablerIcons as Record<string, unknown>)[name] as React.ComponentType<{ size?: number; stroke?: number }> | undefined
              if (!Icon) return null
              return (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 8, border: '1px solid transparent', cursor: 'default' }}>
                  <Icon size={24} stroke={1.5} />
                  <span style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>{name.replace('Icon', '')}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const meta: Meta = {
  title: 'Tokens/Icons',
  component: IconsPage,
  parameters: { layout: 'fullscreen' },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
