import { siteContent } from "../siteContent";

type ProfileHeaderProps = {
  isProfileDocLoading: boolean;
  hasProfileDocLoadError: boolean;
  profileDocId: string;
  roleLabel: string;
  profileHighlights: string[];
};

function getDisplayText(item: string): string {
  // Remove protocol (http://, https://)
  let text = item.replace(/^https?:\/\//, "");
  // Remove www. prefix if present
  text = text.replace(/^www\./, "");
  // Remove any path (everything after first /)
  text = text.split("/")[0];
  // Extract just the domain name (part before the first dot)
  text = text.split(".")[0];
  return text;
}

function getGitHubBadgeUrl(githubLink: string): string {
  // Create a simple GitHub badge with just the label
  // Shields.io static badge format: /badge/<LABEL>-<MESSAGE>-<COLOR>
  // Using underscores to avoid dash parsing issues
  return `https://img.shields.io/badge/GitHub-Open_Repo-181717?logo=github&logoColor=white&style=flat`;
}

function renderProfileHighlight(item: string) {
  // Phone number pattern - flexible to match various formats like 832-220-8363, (832) 220-8363, +1 832 220 8363, etc.
  const phoneRegex = /^[\d\s\-()+.]{7,}$|^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/;
  // Email pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // URL pattern - matches http(s), www., or domain-like patterns
  const urlRegex =
    /^https?:\/\/|^www\.|^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/;

  // Check email first (since @ is distinctive)
  if (emailRegex.test(item)) {
    return (
      <a key={`${item}`} href={`mailto:${item}`} className="meta-link">
        {item}
      </a>
    );
  }

  // Check phone number
  if (phoneRegex.test(item)) {
    const phoneDigits = item.replace(/\D/g, "");
    return (
      <a key={`${item}`} href={`tel:+${phoneDigits}`} className="meta-link">
        {item}
      </a>
    );
  }

  // Check for website
  if (urlRegex.test(item)) {
    const url = item.startsWith("http") ? item : `https://${item}`;
    const displayText = getDisplayText(item);
    return (
      <a
        key={`${item}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="meta-link"
      >
        {displayText}
      </a>
    );
  }

  // Fallback for non-matching patterns
  return <span key={`${item}`}>{item}</span>;
}

export function ProfileHeader({
  isProfileDocLoading,
  hasProfileDocLoadError,
  profileDocId,
  roleLabel,
  profileHighlights,
}: ProfileHeaderProps) {
  const githubBadgeUrl = getGitHubBadgeUrl(siteContent.githubLink);

  return (
    <section className="profile-panel" aria-label="Profile">
      <div className="profile-copy">
        <div className="profile-header-container">
          <h1 className="profile-name">{siteContent.name}</h1>
          {githubBadgeUrl && siteContent.githubLink ? (
            <a
              href={siteContent.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="github-badge"
              aria-label="View on GitHub"
            >
              <img src={githubBadgeUrl} alt="GitHub badge" height="28" />
            </a>
          ) : null}
        </div>
        {isProfileDocLoading ? (
          <p className="profile-role-label profile-role-label-loading">
            Loading role...
          </p>
        ) : null}
        {!isProfileDocLoading && hasProfileDocLoadError ? (
          <p className="profile-role-label">
            Failed to load from Google Doc ID {profileDocId}.
          </p>
        ) : null}
        {!isProfileDocLoading && roleLabel.length > 0 ? (
          <p className="profile-role-label">{roleLabel}</p>
        ) : null}
        {profileHighlights.length > 0 ? (
          <div className="meta-row">
            {profileHighlights.map((item) => renderProfileHighlight(item))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
