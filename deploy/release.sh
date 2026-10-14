#!/usr/bin/env bash
# Installed root-owned at /usr/local/bin/kostay-release. Each CI SSH key is
# restricted to this command with a fixed frontend/backend argument.
# stdin: gzip-compressed Docker archive; SSH_ORIGINAL_COMMAND: full commit SHA.
set -Eeuo pipefail
umask 077

component="${1:-}"
revision="${SSH_ORIGINAL_COMMAND:-}"
case "$component" in
  frontend)
    variable=FRONTEND_IMAGE
    repository=mryaryyev/kostay-next
    services=(frontend)
    health_url=https://www.kostay.kr/api/health
    ;;
  backend)
    variable=BACKEND_IMAGE
    repository=mryaryyev/kostay
    services=(backend batch)
    health_url=https://api.kostay.kr/
    ;;
  *) echo 'Unknown deployment component.' >&2; exit 2 ;;
esac
if [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Only a full commit SHA is accepted; interactive SSH is disabled.' >&2
  exit 2
fi

cd /home/ubuntu/kostay
exec 9>.deploy.lock
flock -w 600 9
work_dir=$(mktemp -d /home/ubuntu/kostay/.release.XXXXXX)
trap 'rm -rf -- "$work_dir"' EXIT

# Neither database credentials nor uploads are accepted through this channel.
gzip -dc | sudo -n docker image load
image="kostay-${component}:${revision}"
actual_revision=$(sudo -n docker image inspect "$image" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')
actual_source=$(sudo -n docker image inspect "$image" --format '{{index .Config.Labels "org.opencontainers.image.source"}}')
architecture=$(sudo -n docker image inspect "$image" --format '{{.Os}}/{{.Architecture}}')
if [[ "$actual_revision" != "$revision" || "$actual_source" != "https://github.com/$repository" || "$architecture" != linux/amd64 ]]; then
  echo 'Image revision, repository or architecture did not match.' >&2
  exit 1
fi

cp .env "$work_dir/previous.env"
awk -v key="$variable" -v image="$image" '
  index($0, key "=") == 1 { print key "=" image; found=1; next }
  { print }
  END { if (!found) print key "=" image }
' .env > "$work_dir/next.env"

rollback() {
  trap - ERR INT TERM
  cp "$work_dir/previous.env" .env
  if sudo -n docker compose up -d --no-deps --wait --wait-timeout 180 "${services[@]}"; then
    echo 'Deployment failed; previous image selection restored.' >&2
  else
    echo 'Deployment and rollback failed; manual intervention required.' >&2
  fi
  exit 1
}
trap rollback ERR INT TERM
cp "$work_dir/next.env" .env
sudo -n docker compose config --quiet
sudo -n docker compose up -d --no-deps --wait --wait-timeout 180 "${services[@]}"
curl --fail --silent --show-error --retry 5 --retry-all-errors --retry-delay 3 --max-time 15 "$health_url" > /dev/null
cp "$work_dir/previous.env" .env.previous
printf '%s component=%s commit=%s image=%s\n' "$(date -u +%FT%TZ)" "$component" "$revision" "$image" >> deployments.log
trap - ERR INT TERM
echo "Deployed $component from $repository@$revision"
