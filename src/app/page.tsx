import { createClient } from "@/utils/supabase/server"
import { GradientMesh } from "@/components/ui/gradient-mesh"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden font-sans text-white">
      <GradientMesh />

      <div className="z-10 flex h-screen w-full flex-col items-center justify-center space-y-8 p-8">
        <div className="relative rounded-3xl border border-white/10 bg-black/40 p-12 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-600/20 text-4xl shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)]">
            🐾
          </div>
          <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            Welcome to PetWalk
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            The premium operating system for your pets.
          </p>
          <div className="mt-8">
            <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300">
              Logged in as: {user.email}
            </span>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <button className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/10">
              <div className="mb-2 text-2xl">🐕</div>
              <h3 className="font-semibold text-white">My Pets</h3>
              <p className="text-sm text-gray-400">Manage your furry friends</p>
            </button>
            <button className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/10">
              <div className="mb-2 text-2xl">📅</div>
              <h3 className="font-semibold text-white">Schedule Walk</h3>
              <p className="text-sm text-gray-400">Book a professional walker</p>
            </button>
          </div>
        </div>

        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-500 hover:text-white transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
