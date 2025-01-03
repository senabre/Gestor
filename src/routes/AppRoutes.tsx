import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Auth from '../components/Auth';
import Layout from '../components/Layout';
import Teams from '../components/Teams';
import TeamDetails from '../components/TeamDetails';
import PlayerDetails from '../components/PlayerDetails';
import Invoices from '../components/Invoices';
import Fees from '../components/Fees';
import Staff from '../components/Staff';
import PlayerSalaries from '../components/PlayerSalaries';
import Settings from '../components/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Teams />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:teamId" element={<TeamDetails />} />
          <Route path="players/:playerId" element={<PlayerDetails />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="fees" element={<Fees />} />
          <Route path="staff" element={<Staff />} />
          <Route path="player-salaries" element={<PlayerSalaries />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}