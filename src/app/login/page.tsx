import { GradientMesh } from "@/components/ui/gradient-mesh"
import { login, signup } from "./actions"
import Link from "next/link"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParamsValue = await searchParams
    const error = searchParamsValue.error as string | undefined
    const message = searchParamsValue.message as string | undefined

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden font-sans text-white">
            <GradientMesh />

            <div className="z-10 w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">PetWalk Authentication</h1>
                    <p className="mt-2 text-sm text-gray-400">Welcome back to the premium pet experience.</p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-400 border border-green-500/20">
                        {message}
                    </div>
                )}

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 shadow-sm focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            formAction={login}
                            className="flex w-full justify-center rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                        >
                            Sign in
                        </button>
                        <Link
                            href="/register"
                            className="flex w-full items-center justify-center rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Sign up
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    By signing in, you agree to our Terms and Privacy Policy.
                </div>
            </div>
        </div>
    )
}
