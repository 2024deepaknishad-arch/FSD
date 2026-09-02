export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-8 shadow-2xl">
        <h1 className="text-xl font-bold mb-1">Sign in to your console</h1>
        <p className="text-sm text-dim mb-8">Monitor activity across your organization.</p>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-cyan/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-cyan/50"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan text-bg font-semibold py-2.5 rounded-md hover:bg-cyan/90 transition"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
