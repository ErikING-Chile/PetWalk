import { createClient } from "@/utils/supabase/server"
import { Play, CheckCircle, Award } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TrainingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch courses with enrollment status
    const { data: courses } = await supabase
        .from('walker_courses')
        .select(`
            *,
            enrollment:walker_enrollments(
                status,
                completed_at
            )
        `)
        .order('created_at', { ascending: true })

    // Calculate progress
    const totalCourses = courses?.length || 0
    const completedCourses = courses?.filter((c: any) => c.enrollment?.[0]?.status === 'completed').length || 0
    const progressPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                    Capacitación Walker
                </h1>
                {completedCourses === totalCourses && totalCourses > 0 && (
                    <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                        <Award size={14} /> CERTIFICADO
                    </div>
                )}
            </div>

            {/* Progress Card */}
            <div className="bg-gray-900 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl -mr-10 -mt-10" />

                <h2 className="text-lg font-bold text-white mb-2">Tu Progreso</h2>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-1000"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <p className="text-sm text-gray-400">
                    {completedCourses} de {totalCourses} cursos completados
                </p>
            </div>

            {/* Course List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Cursos Disponibles</h3>
                <div className="grid gap-4">
                    {courses?.map((course: any) => {
                        const isCompleted = course.enrollment?.[0]?.status === 'completed'
                        const isEnrolled = course.enrollment?.[0]?.status === 'enrolled'

                        return (
                            <div key={course.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 hover:bg-white/10 transition-colors group">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {isCompleted ? <CheckCircle size={24} /> : <Play size={24} className="ml-1" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors">{course.title}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${course.level === 'beginner' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                course.level === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {course.level === 'beginner' ? 'Básico' :
                                                course.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span>⏱ {course.duration_minutes} min</span>
                                        {isCompleted && <span className="text-green-400">Completado</span>}
                                        {!isCompleted && <span className="text-purple-400">Comenzar lección →</span>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
