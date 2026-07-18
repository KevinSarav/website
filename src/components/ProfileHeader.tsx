import { siteContent } from "../siteContent";

type ProfileHeaderProps = {
  roleLabel: string;
};

export function ProfileHeader({ roleLabel }: ProfileHeaderProps) {
  return (
    <section className="profile-panel" aria-label="Profile">
      <div className="profile-copy">
        <h1 className="profile-name">{siteContent.name}</h1>
        {roleLabel.length > 0 ? (
          <p className="profile-role-label">{roleLabel}</p>
        ) : null}
      </div>
    </section>
  );
}
