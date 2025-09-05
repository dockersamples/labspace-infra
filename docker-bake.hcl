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
    "workspace", 
    "labspace-cleaner",
    "launcher",
    "dd-extension",
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

target "workspace" {
  inherits = ["_common"]
  context = "./components/workspace"
  tags = tags(IMAGE_NAMESPACE, "labspace-workspace", IMAGE_TAG)

  contexts = {
    extension = "target:support-vscode-extension"
  }
}

target "labspace-cleaner" {
  inherits = ["_common"]
  context = "./components/workspace-cleaner"
  tags = tags(IMAGE_NAMESPACE, "labspace-cleaner", IMAGE_TAG)
}

target "launcher" {
  inherits = ["_common"]
  context = "./components/launcher"
  tags = tags(IMAGE_NAMESPACE, "labspace-launcher", IMAGE_TAG)
}

target "dd-extension" {
  inherits = ["_common"]
  context = "./dd-extension"
  tags = tags(IMAGE_NAMESPACE, "labspace-extension", IMAGE_TAG)
}
