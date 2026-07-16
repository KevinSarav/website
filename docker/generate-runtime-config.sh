#!/bin/sh
set -eu

escape_js() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e ':a;N;$!ba;s/\n/\\n/g' -e 's/\r/\\r/g'
}

app_name="${SITE_APP_NAME:-Website}"
my_name="${SITE_MY_NAME:-Kevin Saravia}"
role="${SITE_ROLE:-REPLACE_ME}"
profile_city="${PROFILE_CITY:-}"
profile_region="${PROFILE_REGION:-}"
profile_country="${PROFILE_COUNTRY:-}"
availability="${SITE_AVAILABILITY:-REPLACE_ME}"
public_url="${SITE_PUBLIC_URL:-}"
gdoc_resume_id="${SITE_GDOC_RESUME_ID:-}"
gdoc_summary_id="${SITE_GDOC_SUMMARY_ID:-}"
gdoc_highlights_id="${SITE_GDOC_HIGHLIGHTS_ID:-}"
resume_pdf_file_name="${RESUME_PDF_FILE_NAME:-Kevin_Saravia_Resume.pdf}"

location_parts=""
if [ -n "$profile_city" ]; then
  location_parts="$profile_city"
fi
if [ -n "$profile_region" ]; then
  if [ -n "$location_parts" ]; then
    location_parts="$location_parts, $profile_region"
  else
    location_parts="$profile_region"
  fi
fi
if [ -n "$profile_country" ]; then
  if [ -n "$location_parts" ]; then
    location_parts="$location_parts, $profile_country"
  else
    location_parts="$profile_country"
  fi
fi

location="$location_parts"

# Compute resume URLs from Google Docs ID
gdoc_base=""
if [ -n "$gdoc_resume_id" ]; then
  gdoc_base="https://docs.google.com/document/d/$gdoc_resume_id"
fi

resume_embed_url=""
if [ -n "$gdoc_base" ]; then
  resume_embed_url="$gdoc_base/preview"
fi

resume_open_url=""
if [ -n "$gdoc_base" ]; then
  resume_open_url="$gdoc_base"
fi

resume_download_url=""
if [ -n "$gdoc_base" ]; then
  resume_download_url="$gdoc_base/export?format=pdf&download=1"
fi

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__APP_CONFIG__ = {
  appName: "$(escape_js "$app_name")",
  myName: "$(escape_js "$my_name")",
  role: "$(escape_js "$role")",
  location: "$(escape_js "$location")",
  availability: "$(escape_js "$availability")",
  publicUrl: "$(escape_js "$public_url")",
  gdocSummaryId: "$(escape_js "$gdoc_summary_id")",
  gdocHighlightsId: "$(escape_js "$gdoc_highlights_id")",
  gdocResumeId: "$(escape_js "$gdoc_resume_id")",
  resumeOpenUrl: "$(escape_js "$resume_open_url")",
  resumeEmbedUrl: "$(escape_js "$resume_embed_url")",
  resumeDownloadUrl: "$(escape_js "$resume_download_url")",
  resumePdfFileName: "$(escape_js "$resume_pdf_file_name")"
};

if (window.__APP_CONFIG__.appName) {
  document.title = window.__APP_CONFIG__.appName;
}
EOF