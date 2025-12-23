import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
