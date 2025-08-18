#!/bin/bash

set -e

setup_project_directory() {
  echo "📁 Setting up project directory"

  clear_project_directory
  rm -rf /staging
  mkdir /staging
  cd /staging

  # Setup project directory
  if [ "$DEV_MODE" = "true" ]; then
    echo "📁 Skipping clone because DEV_MODE is activated (project source will be directly mounted)"
    return
  else
    if [ -z "$PROJECT_CLONE_URL" ]; then
      echo "Error: PROJECT_CLONE_URL environment variable is not set."
      exit 1
    fi

    stage_git_repo
  fi

  echo "📁 Copying staged files into /project"

  shopt -s dotglob
  if [ -n "$PROJECT_SUBPATH" ]; then
    if [ ! -d "/staging/$PROJECT_SUBPATH" ]; then
      echo "Error: PROJECT_SUBPATH '$PROJECT_SUBPATH' not found in the source material"
      exit 1
    fi
    cp -r /staging/"$PROJECT_SUBPATH"/* /project
  else
    cp -r /staging/* /project
  fi
  shopt -u dotglob
}

stage_git_repo() {
  git config --global user.email "demo@example.com"
  git config --global user.name "Docker Labspace"
  git config --global --add safe.directory /staging

  echo "🔄 Cloning project repository from $PROJECT_CLONE_URL"

  git clone $PROJECT_CLONE_URL /staging

  if [ -n "$SETUP_SCRIPT" ]; then
    if [ -f "$SETUP_SCRIPT" ]; then
      bash "$SETUP_SCRIPT"
    else
      echo "Warning: SETUP_SCRIPT defined ('$SETUP_SCRIPT'), but not found."
    fi
  fi
}

clear_project_directory() {
  cd /project

  # Remove everything including hidden files (like the .git directory)
  ls -A1 | xargs rm -rf
}

create_keypair() {
  echo "🔑 Generating public/private key pair"
  openssl ecparam -name prime256v1 -genkey -noout -out /etc/support-extension/private-key/cmd-executor.key
  openssl ec -in /etc/support-extension/private-key/cmd-executor.key -pubout -out /etc/support-extension/public-key/cmd-executor.pem
}

setup_directories() {
  echo "📁 Creating necessary directories"
  mkdir -p /etc/support-extension/private-key
  mkdir -p /etc/support-extension/public-key
  mkdir -p /etc/support-extension/socket
}

update_permissions() {
  echo "🔒 Setting file and directory permissions for coder user"
  chown 1000:1000 -R /project
  chown 1000:1000 -R /etc/support-extension/socket
  chown 1000:1000 -R /etc/support-extension/public-key
}

setup_directories
setup_project_directory
create_keypair
update_permissions