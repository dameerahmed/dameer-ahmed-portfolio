import { fetchProjects } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";

export const metadata = {
    title: "Projects | Dameer Ahmed",
    description: "Explore Dameer Ahmed's AI, Data Science, and Full-Stack Engineering projects.",
};

export default async function ProjectsPage() {
    let projects = [];
    try {
        projects = await fetchProjects();
    } catch (err) {
        console.error("Error fetching projects:", err);
    }

    return (
        <main className="min-h-screen section-padding bg-[#050505] relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="fixed top-1/4 -right-20 w-[600px] h-[600px] bg-cyan-900/5 blur-[150px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 -left-20 w-[500px] h-[500px] bg-cyan-900/5 blur-[120px] pointer-events-none -z-10" />

            <div className="container-custom">
                {/* Header */}
                <div className="mb-12 md:mb-20">
                    <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                        <span className="w-12 h-0.5 bg-cyan-500 rounded-full" /> Project Archive
                    </p>
                    <h1 className="text-4xl md:text-6xl text-white">
                        Selected <span className="text-cyan-500">Works</span>
                    </h1>
                </div>

                {/* Floating Glass Card Wrapper */}
                <div className="bg-black/20 backdrop-blur-xl rounded-[30px] md:rounded-[40px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 md:p-12 mb-12 md:mb-24">
                    {projects.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Repository currently empty.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project: any) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
