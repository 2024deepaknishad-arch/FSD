import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';

export function Reports() {
  return (
    <Layout title="Reports">
      <p className="text-dim text-sm">Reports</p>
      <h2 className="text-2xl font-bold mt-1 mb-6">Security report — 01 Aug to 19 Aug.</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Activities" value="12,842" />
        <StatCard label="Failed Logins" value="43" valueClass="text-red" />
        <StatCard label="Suspicious Activities" value="12" valueClass="text-amber" />
        <StatCard label="High Risk Events" value="3" valueClass="text-red" />
        <StatCard label="Backups Completed" value="18" valueClass="text-green" />
        <StatCard label="Recovery Tests" value="2" valueClass="text-cyan" />
      </div>
    </Layout>
  );
}

export function Settings() {
  return (
    <Layout title="Settings">
      <p className="text-dim text-sm">Settings</p>
      <h2 className="text-2xl font-bold mt-1 mb-6">Configure detection thresholds.</h2>
      <div className="bg-surface border border-border rounded-lg p-6 grid sm:grid-cols-2 gap-5 max-w-2xl">
        {[
          ['Failed login threshold', '5'],
          ['Suspicious deletion threshold', '20'],
          ['Unusual access start', '01:00'],
          ['Unusual access end', '05:00'],
        ].map(([label, value]) => (
          <div key={label}>
            <label className="block text-xs font-medium text-dim mb-1.5">{label}</label>
            <input defaultValue={value} className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan/50" />
          </div>
        ))}
      </div>
    </Layout>
  );
}

export function DatabaseActivity() {
  return (
    <Layout title="Database Activity">
      <p className="text-dim text-sm">Database Activity</p>
      <h2 className="text-2xl font-bold mt-1 mb-6">Demonstration business dataset.</h2>
      <p className="text-sm text-dim max-w-2xl">
        Customers and Transactions data lives behind the same audit pipeline as everything else:
        action → audit log → security check → alert if suspicious.
      </p>
    </Layout>
  );
}

export function Landing() {
  return (
    <div className="font-sans text-text antialiased">
      {/* NAVBAR */}
      <header className="border-b border-border sticky top-0 z-30 bg-bg/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan pulse-dot" />
            <span className="font-mono font-semibold tracking-tight text-[15px]">
              CYBERAUDIT<span className="text-cyan">360</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-dim">
            <a href="#why" className="hover:text-text transition">Platform</a>
            <a href="#modules" className="hover:text-text transition">Modules</a>
            <a href="#recovery" className="hover:text-text transition">Recovery</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-dim hover:text-text transition">Log in</Link>
            <Link to="/login" className="text-sm font-medium bg-cyan text-bg px-4 py-2 rounded-md hover:bg-cyan/90 transition">Get started</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-cyan border border-cyan/30 bg-cyan/5 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
            LIVE MONITORING ACTIVE
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-3xl">
            Protect. Monitor. <span className="text-cyan">Recover.</span>
          </h1>
          <p className="mt-6 text-lg text-dim max-w-xl leading-relaxed">
            Centralized database activity monitoring and security auditing built for growing businesses.
            Know exactly who touched what, when — and roll it back if it goes wrong.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link to="/login" className="bg-cyan text-bg font-semibold px-6 py-3 rounded-md hover:bg-cyan/90 transition">Get Started</Link>
            <Link to="/login" className="border border-border text-text font-medium px-6 py-3 rounded-md hover:border-cyan/50 transition">Login</Link>
          </div>

          <div className="mt-16 max-w-lg bg-surface border border-border rounded-lg overflow-hidden shadow-2xl">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-surface2">
              <span className="w-2.5 h-2.5 rounded-full bg-red/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green/70" />
              <span className="ml-2 font-mono text-xs text-dim">live-activity.log</span>
            </div>
            <div className="p-4 font-mono text-xs space-y-2">
              <p><span className="text-dim">10:44:12</span> <span className="text-green">✓</span> Rahul <span className="text-dim">updated</span> Customer#4471</p>
              <p><span className="text-dim">10:46:03</span> <span className="text-amber">△</span> Rahul <span className="text-dim">deleted</span> Invoice#8825</p>
              <p><span className="text-dim">10:51:19</span> <span className="text-red">✕</span> unknown <span className="text-dim">login failed</span> (5th attempt)</p>
              <p className="text-dim">10:51:19 <span className="text-red">● brute-force pattern detected</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="max-w-7xl mx-auto px-6 py-20">
        <p className="font-mono text-xs text-cyan mb-2">WHY CYBERAUDIT 360</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-12 max-w-xl">Four systems, one console.</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            ['01', 'cyan', 'Real-Time Monitoring', 'Every read, write, and delete against your database is captured the moment it happens.'],
            ['02', 'amber', 'Threat Detection', 'Rule-based engine flags brute-force logins, mass deletions, and off-hours access automatically.'],
            ['03', 'green', 'Complete Audit Trail', 'Every important action is attributed to a user, a role, and a timestamp — searchable in seconds.'],
            ['04', 'red', 'Backup & Recovery', 'Scheduled snapshots let you restore business data after accidental loss or an attack.'],
          ].map(([num, color, title, desc]) => (
            <div key={num} className="border border-border bg-surface rounded-lg p-6 hover:border-cyan/40 transition">
              <div className={`w-9 h-9 rounded-md bg-${color}/10 text-${color} flex items-center justify-center font-mono text-sm mb-4`}>{num}</div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-dim leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <p className="font-mono text-xs text-cyan mb-2">MODULES</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-12 max-w-xl">Everything in one console.</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="border border-border bg-surface rounded-lg p-6"><h3 className="font-semibold mb-2">Audit Logs</h3><p className="text-sm text-dim">Search and filter every recorded action.</p></div>
          <div className="border border-border bg-surface rounded-lg p-6"><h3 className="font-semibold mb-2">Security Alerts</h3><p className="text-sm text-dim">Real-time flags for risky behavior.</p></div>
          <div className="border border-border bg-surface rounded-lg p-6"><h3 className="font-semibold mb-2">Users &amp; Roles</h3><p className="text-sm text-dim">Admin, Analyst, and Employee access levels.</p></div>
        </div>
      </section>

      {/* RECOVERY */}
      <section id="recovery" className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <p className="font-mono text-xs text-cyan mb-2">RECOVERY</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 max-w-xl">Back up. Restore. Verify.</h2>
        <p className="text-dim max-w-xl mb-8">Scheduled snapshots let you recover business data after accidental loss or an attack, with a full restore-and-verify flow.</p>
        <Link to="/login" className="inline-block bg-cyan text-bg font-semibold px-6 py-3 rounded-md hover:bg-cyan/90 transition">Try it</Link>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-dim">
          <span className="font-mono">CYBERAUDIT360</span>
          <span>Security auditing &amp; monitoring platform</span>
        </div>
      </footer>
    </div>
  );
}
