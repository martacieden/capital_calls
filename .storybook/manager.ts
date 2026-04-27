import { addons } from 'storybook/manager-api'

addons.setConfig({
  sidebar: {
    order: [
      'Introduction',
      'Tokens',
      'Atoms',
      'Molecules',
      'Organisms',
      'Pages',
      'User Flows',
    ],
  },
})
