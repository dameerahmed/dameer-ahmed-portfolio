import { fetchHomeBootstrap } from "@/lib/api";
import HomeHero from "@/components/HomeHero";

export const metadata = {
  title: "Dameer Ahmed | AI Agent Developer & Data Scientist",
  description: "Portfolio of Dameer Ahmed, specialized in AI agents, machine learning, and scalable software solutions.",
};

export default async function Home() {
  // Fallbacks for extreme robustness
  let content = {
    hero_title: "Dameer Ahmed Malik",
    typing_tags: ["AI Agent Developer", "Data Scientist", "ML Engineer"],
    hero_description: "Building intelligent systems and autonomous AI agents that transform data into decisions. Specializing in scalable ML pipelines and next-gen AI solutions."
  };

  let techStack = [
    { name: "Python", years_of_experience: 3 },
    { name: "FastAPI", years_of_experience: 2 },
    { name: "Next.js", years_of_experience: 2 }
  ];

  let portraitUrl = "";
  let socialLinks: any = {};

  try {
    const data = await fetchHomeBootstrap();

    if (data.content) content = data.content;
    if (data.tech_stack && data.tech_stack.length > 0) techStack = data.tech_stack;
    if (data.profile) portraitUrl = data.profile.profile_pic;

    if (data.socials) {
      data.socials.forEach((s: any) => {
        socialLinks[s.platform.toLowerCase()] = s.url;
      });
    }

    return (
      <HomeHero
        initialContent={content}
        techStack={techStack}
        portraitUrl={portraitUrl}
        socialLinks={socialLinks}
      />
    );
  } catch (err) {
    console.error("Home page fetch failure:", err);
    return (
      <HomeHero
        initialContent={content}
        techStack={techStack}
        portraitUrl={portraitUrl}
        socialLinks={socialLinks}
      />
    );
  }
}
