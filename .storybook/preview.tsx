import type { Preview } from '@storybook/react-vite'
import React from 'react'
import '../src/index.css'
import { FojoProvider } from '../src/lib/providers/FojoProvider'
import { CatalogDataProvider } from '../src/lib/providers/CatalogDataProvider'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    layout: 'padded',
    docs: {
      story: { inline: true },
    },
  },
  decorators: [
    (Story) => {
      // Override reset.css overflow:hidden so Storybook docs can scroll
      document.documentElement.style.overflow = 'auto'
      document.body.style.overflow = 'auto'
      return (
        <FojoProvider>
          <CatalogDataProvider>
            <Story />
          </CatalogDataProvider>
        </FojoProvider>
      )
    },
  ],
}

export default preview
