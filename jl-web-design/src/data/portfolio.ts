export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href?: string;
  image?: string;
  comingSoon?: boolean;
};

/**
 * Add real projects here when they're ready.
 * Set comingSoon to false and fill in href/image once live.
 */
export const portfolioProjects: PortfolioProject[] = [
  {
    id: "project-1",
    title: "Project One",
    description: "Your first client website will live here.",
    tags: ["Web Design", "Development"],
    comingSoon: true,
  },
  {
    id: "project-2",
    title: "Project Two",
    description: "Showcase a brand refresh or landing page build.",
    tags: ["Branding", "UI/UX"],
    comingSoon: true,
  },
  {
    id: "project-3",
    title: "Project Three",
    description: "Highlight e-commerce, portfolio, or business sites.",
    tags: ["Responsive", "Modern"],
    comingSoon: true,
  },
];
