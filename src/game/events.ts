export interface EventChoice {
  label: string
  resolve: () => { text: string; goldDelta?: number; hpDeltaPct?: number; item?: boolean }
}

export interface EventDef {
  id: string
  title: string
  body: string
  choices: EventChoice[]
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const EVENTS: EventDef[] = [
  {
    id: 'abandoned-cart',
    title: 'Abandoned Cart',
    body: 'A merchant\'s cart lies overturned on the road, wheels still spinning. No one is in sight.',
    choices: [
      {
        label: 'Search it',
        resolve: () => {
          const gold = rand(15, 40)
          return { text: `You find ${gold} gold hidden under a tarp.`, goldDelta: gold }
        },
      },
      {
        label: 'Leave it — could be a trap',
        resolve: () => ({ text: 'You move on, wary. Nothing happens.' }),
      },
    ],
  },
  {
    id: 'old-shrine',
    title: 'Weathered Shrine',
    body: 'A crumbling roadside shrine hums faintly. Offerings might be rewarded — or resented.',
    choices: [
      {
        label: 'Leave an offering (10 gold)',
        resolve: () => ({
          text: 'Warmth spreads through your party. Everyone feels steadier.',
          goldDelta: -10,
          hpDeltaPct: 0.15,
        }),
      },
      {
        label: 'Walk past',
        resolve: () => ({ text: 'The shrine falls silent behind you.' }),
      },
    ],
  },
  {
    id: 'wounded-scout',
    title: 'Wounded Scout',
    body: 'A scout from another company lies injured against a tree, watching your approach warily.',
    choices: [
      {
        label: 'Tend their wounds',
        resolve: () => ({
          text: 'They share intel on the road ahead before moving on. Your party rests easier.',
          hpDeltaPct: 0.2,
        }),
      },
      {
        label: 'Take their supplies',
        resolve: () => {
          const gold = rand(20, 35)
          return { text: `You take ${gold} gold from their pack. They curse you and flee.`, goldDelta: gold, hpDeltaPct: -0.05 }
        },
      },
    ],
  },
  {
    id: 'strange-market',
    title: 'Strange Market',
    body: 'A lone peddler has set up shop between two boulders, selling wares of uncertain origin.',
    choices: [
      {
        label: 'Buy a mystery tonic (20 gold)',
        resolve: () => ({ text: 'The tonic fizzes strangely. It goes in your pack.', goldDelta: -20, item: true }),
      },
      {
        label: 'Decline',
        resolve: () => ({ text: 'The peddler shrugs and packs up as you leave.' }),
      },
    ],
  },
]

export function randomEvent(): EventDef {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)]
}
