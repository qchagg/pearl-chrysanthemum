import { useRunStore } from './store/runStore'
import { MainMenu } from './components/MainMenu'
import { Armory } from './components/Armory'
import { WorldMap } from './components/WorldMap'
import { BattleScreen } from './components/BattleScreen'
import { RecruitNode } from './components/RecruitNode'
import { ShopNode } from './components/ShopNode'
import { RestNode } from './components/RestNode'
import { EventNode } from './components/EventNode'
import { RunSummary } from './components/RunSummary'

function App() {
  const screen = useRunStore((s) => s.screen)

  return (
    <div className="app-shell">
      {screen === 'menu' && <MainMenu />}
      {screen === 'armory' && <Armory />}
      {screen === 'map' && <WorldMap />}
      {screen === 'battle' && <BattleScreen />}
      {screen === 'recruit' && <RecruitNode />}
      {screen === 'shop' && <ShopNode />}
      {screen === 'rest' && <RestNode />}
      {screen === 'event' && <EventNode />}
      {screen === 'runSummary' && <RunSummary />}
    </div>
  )
}

export default App
