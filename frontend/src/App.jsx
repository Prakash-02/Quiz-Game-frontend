import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import HostQuizBuilder from './pages/HostQuizBuilder'
import HostLobby from './pages/HostLobby'
import HostGame from './pages/HostGame'
import PlayerJoin from './pages/PlayerJoin'
import PlayerLobby from './pages/PlayerLobby'
import PlayerGame from './pages/PlayerGame'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/host" element={<HostQuizBuilder />} />
        <Route path="/join" element={<PlayerJoin />} />
        <Route path="/room/:code/host-lobby" element={<HostLobby />} />
        <Route path="/room/:code/host-game" element={<HostGame />} />
        <Route path="/room/:code/player-lobby" element={<PlayerLobby />} />
        <Route path="/room/:code/player-game" element={<PlayerGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
