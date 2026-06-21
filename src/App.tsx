type Project = {
  name: string;
  summary: string;
  impact: string;
  tech: string[];
};

const projects: Project[] = [
  {
    name: 'Secure Home Services Platform',
    summary: 'Unified self-hosted services with resilient networking and monitored recovery paths.',
    impact: 'Reduced service recovery time from manual interventions to automated self-heal loops.',
    tech: ['Docker', 'WireGuard', 'Linux', 'Shell']
  },
  {
    name: 'Media Infrastructure Automation',
    summary: 'Designed maintainable workflows for photo and media services with backup-conscious operations.',
    impact: 'Improved reliability and repeatability for updates and incident response.',
    tech: ['Compose', 'Networking', 'Automation', 'Observability']
  },
  {
    name: 'Operational Tooling Suite',
    summary: 'Built practical command-line utilities to simplify diagnostics, onboarding, and routine maintenance.',
    impact: 'Cut repetitive admin time and standardized critical operational tasks.',
    tech: ['Bash', 'Launchd', 'Systemd', 'CI/CD']
  }
];

const owner = import.meta.env.VITE_SITE_OWNER || 'Your Name';
const email = import.meta.env.VITE_CONTACT_EMAIL || 'contact_placeholder';
const location = import.meta.env.VITE_LOCATION || 'Your Location';

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Infrastructure + Product Engineering</p>
        <h1>{owner}</h1>
        <p className="lede">
          I build reliable, user-facing systems that combine clean software delivery with practical operations.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href={`mailto:${email}`}>Contact Me</a>
          <a className="btn btn-secondary" href="#projects">View Projects</a>
        </div>
      </header>

      <main>
        <section className="panel" id="about">
          <h2>About</h2>
          <p>
            I focus on production-ready systems that stay stable under real-world conditions. My work blends
            frontend delivery, backend integration, networking fundamentals, and operational resilience.
          </p>
          <p className="muted">Based in {location}</p>
        </section>

        <section className="panel" id="projects">
          <h2>Selected Work</h2>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.name}>
                <h3>{project.name}</h3>
                <p>{project.summary}</p>
                <p className="impact">{project.impact}</p>
                <ul className="tech-list" aria-label={`${project.name} technologies`}>
                  {project.tech.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="contact">
          <h2>Contact</h2>
          <p>
            Open to consulting, full-time roles, and infrastructure-heavy product work.
          </p>
          <a className="contact-link" href={`mailto:${email}`}>{email}</a>
        </section>
      </main>
    </div>
  );
}
