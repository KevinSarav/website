#!/bin/sh
set -eu

escape_js() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e ':a;N;$!ba;s/\n/\\n/g' -e 's/\r/\\r/g'
}

app_name="${SITE_APP_NAME:-Website}"
my_name="${SITE_MY_NAME:-REPLACE_ME}"
role="${SITE_ROLE:-REPLACE_ME}"
summary="${SITE_SUMMARY:-REPLACE_ME}"
location="${SITE_LOCATION:-REPLACE_ME}"
availability="${SITE_AVAILABILITY:-REPLACE_ME}"
public_url="${SITE_PUBLIC_URL:-}"
gdoc_resume_id="${SITE_GDOC_RESUME_ID:-}"
resume_open_url_override="${SITE_RESUME_OPEN_URL:-}"
resume_embed_url_override="${SITE_RESUME_EMBED_URL:-}"
resume_download_url_override="${SITE_RESUME_DOWNLOAD_URL:-}"
note_1="${SITE_NOTE_1:-REPLACE_ME}"
note_2="${SITE_NOTE_2:-REPLACE_ME}"

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

if [ -z "$gdoc_resume_id" ]; then
  if [ -n "$resume_open_url_override" ]; then
    resume_open_url="$resume_open_url_override"
  fi

  if [ -n "$resume_embed_url_override" ]; then
    resume_embed_url="$resume_embed_url_override"
  fi

  if [ -n "$resume_download_url_override" ]; then
    resume_download_url="$resume_download_url_override"
  fi
fi

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__APP_CONFIG__ = {
  appName: "$(escape_js "$app_name")",
  myName: "$(escape_js "$my_name")",
  role: "$(escape_js "$role")",
  summary: "$(escape_js "$summary")",
  location: "$(escape_js "$location")",
  availability: "$(escape_js "$availability")",
  publicUrl: "$(escape_js "$public_url")",
  gdocResumeId: "$(escape_js "$gdoc_resume_id")",
  resumeOpenUrl: "$(escape_js "$resume_open_url")",
  resumeEmbedUrl: "$(escape_js "$resume_embed_url")",
  resumeDownloadUrl: "$(escape_js "$resume_download_url")",
  note1: "$(escape_js "$note_1")",
  note2: "$(escape_js "$note_2")"
};

if (window.__APP_CONFIG__.appName) {
  document.title = window.__APP_CONFIG__.appName;
}
EOF