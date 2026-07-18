import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { hasResume, siteContent } from "./siteContent";
import { HighlightsSection } from "./components/HighlightsSection";
import { ProfileHeader } from "./components/ProfileHeader";
import { ResumeSection } from "./components/ResumeSection";
import { SummarySection } from "./components/SummarySection";
import "./styles.css";

document.title = siteContent.appName;

function buildGoogleDocTextUrl(docId: string) {
  return `https://docs.google.com/document/d/${docId}/export?format=txt`;
}

async function fetchDocText(docId: string) {
  const response = await fetch(buildGoogleDocTextUrl(docId), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to load Google Doc content (${response.status})`);
  }
  return response.text();
}

function parseSummaryDoc(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const [summary = "", ...metaItems] = lines;
  return {
    summary,
    metaItems,
  };
}

function parseProfileDoc(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const [role = "", ...profileHighlights] = lines;
  return {
    role,
    profileHighlights,
  };
}

function parseHighlights(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function App() {
  const [role, setRole] = useState("");
  const [summary, setSummary] = useState("");
  const [profileHighlights, setProfileHighlights] = useState<string[]>([]);
  const [metaItems, setMetaItems] = useState(
    siteContent.location.length > 0 ? [siteContent.location] : [],
  );
  const [isProfileDocLoading, setIsProfileDocLoading] = useState(
    siteContent.profileDocId.length > 0,
  );
  const [hasProfileDocLoadError, setHasProfileDocLoadError] = useState(false);
  const [isSummaryDocLoading, setIsSummaryDocLoading] = useState(
    siteContent.summaryDocId.length > 0,
  );
  const [hasSummaryDocLoadError, setHasSummaryDocLoadError] = useState(false);
  const [isResumeLoading, setIsResumeLoading] = useState(
    siteContent.resume.embedUrl.length > 0,
  );
  const [highlights, setHighlights] = useState<string[]>([]);
  const [isHighlightsLoading, setIsHighlightsLoading] = useState(
    siteContent.highlightsDocId.length > 0,
  );
  const [hasHighlightsLoadError, setHasHighlightsLoadError] = useState(false);
  const roleLabel = isProfileDocLoading ? "Loading role..." : role;

  useEffect(() => {
    let cancelled = false;

    const loadProfileContent = async () => {
      if (siteContent.profileDocId.length > 0) {
        try {
          const profileText = await fetchDocText(siteContent.profileDocId);
          const parsedProfileDoc = parseProfileDoc(profileText);
          if (!cancelled && parsedProfileDoc.role.length > 0) {
            setRole(parsedProfileDoc.role);
          }
          if (!cancelled) {
            const filteredProfileHighlights =
              parsedProfileDoc.profileHighlights.filter(
                (item) => item.length > 0,
              );
            setProfileHighlights(filteredProfileHighlights);
          }
        } catch {
          if (!cancelled) {
            setHasProfileDocLoadError(true);
          }
        } finally {
          if (!cancelled) {
            setIsProfileDocLoading(false);
          }
        }
      }

      if (siteContent.summaryDocId.length > 0) {
        try {
          const summaryText = await fetchDocText(siteContent.summaryDocId);
          const parsedSummaryDoc = parseSummaryDoc(summaryText);
          if (!cancelled && parsedSummaryDoc.summary.length > 0) {
            setSummary(parsedSummaryDoc.summary);
          }
          if (!cancelled) {
            const docMetaItems = parsedSummaryDoc.metaItems.filter(
              (item) => item.length > 0,
            );
            const nextMetaItems = [
              siteContent.location,
              ...docMetaItems,
            ].filter((item) => item.length > 0);
            setMetaItems(nextMetaItems);
          }
        } catch {
          if (!cancelled) {
            setHasSummaryDocLoadError(true);
          }
        } finally {
          if (!cancelled) {
            setIsSummaryDocLoading(false);
          }
        }
      }

      if (siteContent.highlightsDocId.length > 0) {
        try {
          const highlightsText = await fetchDocText(
            siteContent.highlightsDocId,
          );
          const parsedHighlights = parseHighlights(highlightsText);
          if (!cancelled && parsedHighlights.length > 0) {
            setHighlights(parsedHighlights);
          }
        } catch {
          if (!cancelled) {
            setHasHighlightsLoadError(true);
          }
        } finally {
          if (!cancelled) {
            setIsHighlightsLoading(false);
          }
        }
      }
    };

    void loadProfileContent();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page-shell">
      <ProfileHeader
        isProfileDocLoading={isProfileDocLoading}
        hasProfileDocLoadError={hasProfileDocLoadError}
        profileDocId={siteContent.profileDocId}
        roleLabel={roleLabel}
        profileHighlights={profileHighlights}
      />
      <SummarySection
        isSummaryDocLoading={isSummaryDocLoading}
        hasSummaryDocLoadError={hasSummaryDocLoadError}
        summaryDocId={siteContent.summaryDocId}
        summary={summary}
        metaItems={metaItems}
      />
      <HighlightsSection
        isHighlightsLoading={isHighlightsLoading}
        hasHighlightsLoadError={hasHighlightsLoadError}
        highlightsDocId={siteContent.highlightsDocId}
        highlights={highlights}
      />
      {hasResume ? (
        <ResumeSection
          isResumeLoading={isResumeLoading}
          setIsResumeLoading={setIsResumeLoading}
        />
      ) : null}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
