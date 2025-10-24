variable "IMAGE_TAG" {
  type    = string
  default = "latest"
}

variable "IMAGE_NAMESPACE" {
  type    = string
  default = "dockersamples"
}

function tags {
  params = [namespace, name, tag]
  result = tag == "dev" ? ["${namespace}/${name}:dev"] : ["${namespace}/${name}:latest", "${namespace}/${name}:${tag}"]
}

group "default" {
  targets = [ 
    "configurator", 
    "support-vscode-extension",
    "interface",
    "host-port-republisher",
    "labspace-cleaner",
    "dd-extension",
    "workspace-base",
    "workspace-node", 
    "workspace-java",
    "workspace-python"
  ]
}

target "workspaces" {
  targets = [
    "workspace-base",
    "workspace-node", 
    "workspace-java",
    "workspace-python"
  ]
}

target "_common" {
  dockerfile = "Dockerfile"
  
  platforms = [
    "linux/amd64",
    "linux/arm64",
  ]

  attest = [
    {
      type = "provenance"
      mode = "max"
    },
    {
      type = "sbom"
    }
  ]
}

target "interface" {
  inherits = ["_common"]
  context = "./components/interface"
  tags = tags(IMAGE_NAMESPACE, "labspace-interface", IMAGE_TAG)
}

target "support-vscode-extension" {
  inherits = ["_common"]
  context = "./components/support-vscode-extension"
  tags = tags(IMAGE_NAMESPACE, "labspace-support-vscode-extension", IMAGE_TAG)
}

target "configurator" {
  inherits = ["_common"]
  context = "./components/configurator"
  tags = tags(IMAGE_NAMESPACE, "labspace-configurator", IMAGE_TAG)
}

target "workspace-base" {
  inherits = ["_common"]
  context = "./components/workspace/base"
  tags = tags(IMAGE_NAMESPACE, "labspace-workspace-base", IMAGE_TAG)

  contexts = {
    extension = "target:support-vscode-extension"
  }
}

target "workspace-node" {
  inherits = ["_common"]
  context = "./components/workspace/node"
  tags = tags(IMAGE_NAMESPACE, "labspace-workspace-node", IMAGE_TAG)

  contexts = {
    labspace-workspace-base = "target:workspace-base"
  }
}

target "workspace-java" {
  inherits = ["_common"]
  context = "./components/workspace/java"
  tags = tags(IMAGE_NAMESPACE, "labspace-workspace-java", IMAGE_TAG)

  contexts = {
    labspace-workspace-base = "target:workspace-base"
  }
}

target "workspace-python" {
  inherits = ["_common"]
  context = "./components/workspace/python"
  tags = tags(IMAGE_NAMESPACE, "labspace-workspace-python", IMAGE_TAG)

  contexts = {
    labspace-workspace-base = "target:workspace-base"
  }
}

target "host-port-republisher" {
  inherits = ["_common"]
  context = "./components/host-port-republisher"
  tags = tags(IMAGE_NAMESPACE, "labspace-host-port-republisher", IMAGE_TAG)
}

target "labspace-cleaner" {
  inherits = ["_common"]
  context = "./components/workspace-cleaner"
  tags = tags(IMAGE_NAMESPACE, "labspace-cleaner", IMAGE_TAG)
}

target "dd-extension" {
  inherits = ["_common"]
  context = "./dd-extension"
  tags = tags(IMAGE_NAMESPACE, "labspace-extension", IMAGE_TAG)
}
