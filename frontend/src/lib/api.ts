const getApiBaseUrl = () => {
    let url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").trim();
    // Remove all trailing slashes
    url = url.replace(/\/+$/, "");
    // If empty or root, fallback to localhost for safety
    if (!url || url === "/" || url === ".") {
        return "http://localhost:8000/api";
    }
    // Force append /api if missing from the end
    if (!url.endsWith("/api")) {
        url = `${url}/api`;
    }
    return url;
};

const API_BASE_URL = getApiBaseUrl();
export const API = API_BASE_URL;

// Using no-store to ensure admin changes reflect immediately on the customer portal
export async function fetchProjects() {
    const res = await fetch(`${API_BASE_URL}/projects`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
}

export async function fetchSkills() {
    const res = await fetch(`${API_BASE_URL}/skills`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch skills");
    return res.json();
}

export async function fetchJourney() {
    const res = await fetch(`${API_BASE_URL}/journey`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch journey data");
    return res.json();
}

export async function fetchProfile() {
    const res = await fetch(`${API_BASE_URL}/profile`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
}

export async function fetchHomeContent() {
    const res = await fetch(`${API_BASE_URL}/v1/content/home`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch home content");
    return res.json();
}

export async function fetchHomeStats() {
    const res = await fetch(`${API_BASE_URL}/v1/content/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
}

export async function fetchTechStack() {
    const res = await fetch(`${API_BASE_URL}/v1/content/tech-stack`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch tech stack");
    return res.json();
}

export async function fetchGitHubStats() {
    const res = await fetch(`${API_BASE_URL}/v1/content/github-stats`, { cache: 'no-store' });
    if (!res.ok) return { public_repos: 0, contributions: "0" };
    return res.json();
}

export async function fetchServices() {
    const res = await fetch(`${API_BASE_URL}/services`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch services");
    return res.json();
}
export async function fetchSocials() {
    const res = await fetch(`${API_BASE_URL}/socials`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch socials");
    return res.json();
}

export async function fetchEducation() {
    const res = await fetch(`${API_BASE_URL}/education`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch education");
    return res.json();
}

export async function fetchHobbies() {
    const res = await fetch(`${API_BASE_URL}/hobbies`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch hobbies");
    return res.json();
}

export async function fetchLanguages() {
    const res = await fetch(`${API_BASE_URL}/languages`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch languages");
    return res.json();
}
