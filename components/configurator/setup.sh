#!/bin/bash

set -e

LABSPACE_MODE="standard"
LABSPACE_CONTENT_VERSION=""
HOSTNAME=$(cat /etc/hostname)

setup_project_directory() {
  echo "📁 Setting up project directory"

  clear_project_directory
  clear_staging_directory
  cd /staging

  # Setup project directory
  if [ "$DEV_MODE" = "true" ]; then
    echo "📁 Skipping clone because DEV_MODE is activated (project source will be directly mounted)"
    LABSPACE_MODE="dev"
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
  elif [ -n "$PROJECT_CLONE_URL" ]; then
    stage_git_repo
    run_setup_script
    LABSPACE_CONTENT_VERSION=$(git -C /staging rev-parse --short HEAD || echo "")
  else
    echo "📁 No project source specified."
    exit 1
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
  if [ -f /etc/labspace-support/private-key/labspace.key ] && [ -f /etc/labspace-support/public-key/labspace.pem ]; then
    echo "🔑 Key pair already exists, skipping generation"
    return
  fi

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

populate_docker_desktop_metadata() {
  echo "📋 Retrieving Docker Desktop configuration"

  IMAGE=$(docker inspect $HOSTNAME --format='{{.Config.Image}}' 2>/dev/null || echo "")

  if [ -z "$IMAGE" ]; then
    echo "⚠️ Unable to determine Docker image name for running container"
    return
  fi

  set +e
  DOCKER_CONFIG=$(docker run --rm -v /run/host-services/backend.sock:/backend.sock $IMAGE /usr/local/app/get-details.sh 2>/dev/null)
  EXIT_CODE=$?
  set -e


  if [ $EXIT_CODE -ne 0 ]; then
    echo "⚠️ Unable to retrieve Docker Desktop configuration: $DOCKER_CONFIG"
    echo -n '{"uuids": {"dd": null, "hub": null}, "analytics_enabled": null }' > /etc/labspace-support/metadata/metadata.json
    return
  fi

  echo "✅ Retrieved Docker Desktop configuration"
  echo -n $DOCKER_CONFIG > /etc/labspace-support/metadata/metadata.json
}

create_labspace_metadata() {
  echo "📋 Creating Labspace metadata"

  populate_docker_desktop_metadata

  jq --arg mode "$LABSPACE_MODE" '. + {labspace_mode: $mode}' /etc/labspace-support/metadata/metadata.json > /tmp/config.json.tmp && mv /tmp/config.json.tmp /etc/labspace-support/metadata/metadata.json
  
  IMAGE=$(docker inspect $HOSTNAME --format='{{.Config.Image}}'   2>/dev/null || echo "")
  IMAGE_TAG=$(echo "$IMAGE" | grep -o ':[^:]*$' | sed 's/://' || echo "unknown")
  jq --arg tag "$IMAGE_TAG" '. + {infra_version: $tag}' /etc/labspace-support/metadata/metadata.json > /tmp/config.json.tmp && mv /tmp/config.json.tmp /etc/labspace-support/metadata/metadata.json

  get_and_store_from_labspace_yaml metadata.id labspace_id
  get_and_store_from_labspace_yaml metadata.sourceRepo source_repo

  if [ -n "$LABSPACE_CONTENT_VERSION" ]; then
    jq --arg version "$LABSPACE_CONTENT_VERSION" '. + {contentVersion: $version}' /etc/labspace-support/metadata/metadata.json > /tmp/config.json.tmp && mv /tmp/config.json.tmp /etc/labspace-support/metadata/metadata.json
  else
    get_and_store_from_labspace_yaml metadata.contentVersion contentVersion
  fi
}

get_and_store_from_labspace_yaml() {
  VALUE=$(yq ."$1" /staging/labspace.yaml 2>/dev/null || echo "")
  if [ -z "$VALUE" ] || [ "$VALUE" == "null" ]; then
    VALUE="unknown"
  fi
  jq --arg val "$VALUE" ". + {$2: \$val}" /etc/labspace-support/metadata/metadata.json > /tmp/config.json.tmp && mv /tmp/config.json.tmp /etc/labspace-support/metadata/metadata.json
}

setup_support_directories
setup_project_directory
create_keypair
copy_docker_credentials
update_permissions
create_labspace_metadata