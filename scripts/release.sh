#!/usr/bin/env zsh
set -euo pipefail

# 简易发布脚本：自动执行 git add/commit/push、npm publish、打 tag 并推送到多个远程
# 用法示例：
#   ./scripts/release.sh -m "release v1.2.3" -t "v1.2.3" --dry-run

BRANCH="main"
REMOTES=("github" "origin")
COMMIT_MSG=""
TAG=""
DRY_RUN=0
NPM_ARGS=""

usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  -m, --message    Commit message (can be empty)
  -t, --tag        Tag name to create and push (optional)
  -b, --branch     Branch to push (default: main)
  --npm-args       Extra args passed to npm publish (quoted)
  --dry-run        Print commands instead of running them
  -h, --help       Show this help

Examples:
  $0 -m "chore: release" -t "v1.0.0"
  $0 --dry-run -m "test"
EOF
}

# 参数解析（简单的手工解析，兼容 zsh）
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message)
      COMMIT_MSG="$2"; shift 2;;
    -t|--tag)
      TAG="$2"; shift 2;;
    -b|--branch)
      BRANCH="$2"; shift 2;;
    --npm-args)
      NPM_ARGS="$2"; shift 2;;
    --dry-run)
      DRY_RUN=1; shift;;
    -h|--help)
      usage; exit 0;;
    *)
      echo "Unknown argument: $1"; usage; exit 1;;
  esac
done

# 确认在 git 仓库中
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not a git repository" >&2
  exit 1
fi

# 执行命令的辅助函数
run_cmd() {
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "DRY RUN: $*"
  else
    echo "+ $*"
    eval "$@"
  fi
}

echo "Branch: $BRANCH"
if [[ $DRY_RUN -eq 1 ]]; then echo "-- dry run mode --"; fi

# add
run_cmd "git add ."

# commit（只有当有暂存内容时才 commit）
if git diff --cached --quiet; then
  echo "No staged changes to commit. Skipping commit."
else
  if [[ -z "$COMMIT_MSG" ]]; then
    echo "Commit message is empty. Proceeding with empty message. (You can pass -m \"msg\")"
  fi
  run_cmd "git commit -m \"$COMMIT_MSG\""
fi

# push branch to remotes
for r in "${REMOTES[@]}"; do
  if git remote | grep -q "^$r$"; then
    run_cmd "git push $r $BRANCH"
  else
    echo "Remote '$r' not found. Skipping push to $r."
  fi
done

# npm publish
if [[ $DRY_RUN -eq 1 ]]; then
  echo "DRY RUN: npm publish $NPM_ARGS"
else
  echo "Running: npm publish $NPM_ARGS"
  # 让 npm 报错直接退出脚本（set -e 已启用）
  npm publish $NPM_ARGS
fi

# 创建并推送 tag（如果提供）
if [[ -n "$TAG" ]]; then
  run_cmd "git tag -a $TAG -m \"$TAG\""
  for r in "${REMOTES[@]}"; do
    if git remote | grep -q "^$r$"; then
      run_cmd "git push $r $TAG"
    else
      echo "Remote '$r' not found. Skipping push tag to $r."
    fi
  done
fi

echo "Release script finished."
