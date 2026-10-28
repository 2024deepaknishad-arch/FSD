import Sidebar from './Sidebar';
import { Navbar } from './Navbar';

export default function Layout({ title, statusText, statusColor, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar title={title} statusText={statusText} statusColor={statusColor} />
        <main className="p-4 md:p-8 space-y-8">{children}</main>
      </div>
    </div>
  );
}
