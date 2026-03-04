export function SkeletonCard() {
    return (
        <div className="bg-[#0a0a0a] rounded-lg overflow-hidden border border-zinc-900 animate-pulse h-[400px] flex flex-col">
            <div className="w-full h-48 bg-zinc-900" />
            <div className="p-6 flex-grow flex flex-col gap-4">
                <div className="h-6 w-3/4 bg-zinc-800 rounded" />
                <div className="h-4 w-full bg-zinc-800 rounded" />
                <div className="h-4 w-5/6 bg-zinc-800 rounded" />
                <div className="mt-auto flex gap-2">
                    <div className="h-6 w-16 bg-zinc-800 rounded" />
                    <div className="h-6 w-16 bg-zinc-800 rounded" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTimeline() {
    return (
        <div className="relative pl-8 md:pl-0">
            <div className="animate-pulse flex flex-col gap-12">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 relative">
                        <div className="md:w-32 flex-shrink-0">
                            <div className="h-6 w-16 bg-zinc-800 rounded" />
                        </div>
                        <div className="flex-grow bg-[#0a0a0a] p-6 rounded-lg border border-zinc-900">
                            <div className="h-6 w-1/2 bg-zinc-800 rounded mb-4" />
                            <div className="h-4 w-full bg-zinc-800 rounded mb-2" />
                            <div className="h-4 w-5/6 bg-zinc-800 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
