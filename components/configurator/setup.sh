#!/bin/bash

set -e

setup_project_directory() {
  echo "📁 Setting up project directory"

  clear_project_directory
  clear_staging_directory
  cd /staging

  # Setup project directory
  if [ "$DEV_MODE" = "true" ]; then
    echo "📁 Skipping clone because DEV_MODE is activated (project source will be directly mounted)"
    run_setup_script
    return
  elif [ "$LOCAL_MODE" = "true" ]; then
    echo "📁 Local mode enabled."
    if [ -z "$LOCAL_CONTENT_PATH" ]; then
      echo "Error: LOCAL_CONTENT_PATH environment variable is not set."
      exit 1
    fi

    echo "📁 Using content in ${LOCAL_CONTENT_PATH} as source material"
    shopt -s dotglob
    cp -r "${LOCAL_CONTENT_PATH}/"* /staging
    shopt -u dotglob

    run_setup_script
  else
    if [ -z "$PROJECT_CLONE_URL" ]; then
      echo "Error: PROJECT_CLONE_URL environment variable is not set."
      exit 1
    fi

    stage_git_repo
    run_setup_script
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
}

run_setup_script() {
  if [ -n "$SETUP_SCRIPT" ]; then
    if [ -f "$SETUP_SCRIPT" ]; then
      bash "$SETUP_SCRIPT"
    else
      echo "Warning: SETUP_SCRIPT defined ('$SETUP_SCRIPT'), but not found."
    fi
  fi
}

clear_staging_directory() {
  if [ "$DEV_MODE" != "true" ]; then
    rm -rf /staging
    mkdir /staging
  fi
  if [ ! -d /staging ]; then
    mkdir /staging
  fi
}

clear_project_directory() {
  cd /project

  # Remove everything including hidden files (like the .git directory)
  ls -A1 | xargs rm -rf
}

create_keypair() {
  echo "🔑 Generating public/private key pair"
  openssl ecparam -name prime256v1 -genkey -noout -out /etc/labspace-support/private-key/labspace.key
  openssl ec -in /etc/labspace-support/private-key/labspace.key -pubout -out /etc/labspace-support/public-key/labspace.pem
}

copy_docker_credentials() {
  echo "📋 Copying Docker credentials"

  if [ -f /run/secrets/docker/config.json ]; then
    cp /run/secrets/docker/config.json /docker-creds/config.json
    echo "✅ Docker credentials copied successfully"
  else
    echo "⚠️ No Docker credentials found to copy"
  fi
}

setup_support_directories() {
  echo "📁 Creating necessary directories"
  mkdir -p /etc/labspace-support/private-key
  mkdir -p /etc/labspace-support/public-key
  mkdir -p /etc/labspace-support/socket
  mkdir -p /etc/labspace-support/metadata
}

update_permissions() {
  echo "🔒 Setting file and directory permissions for coder user"
  chown 1000:1000 -R /project
  chown 1000:1000 -R /etc/labspace-support
  chown 1000:1000 -R /docker-creds
}

setup_support_directories
setup_project_directory
create_keypair
copy_docker_credentials
update_permissions