group "default" {
  targets = [ 
    "configurator", 
    "support-vscode-extension",
    "interface", 
    "workspace", 
    "host-port-republisher", 
    "labspace-cleaner" 
  ]
}

variable "TAG" {
  type = string
  default = "latest"
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
  tags = [
    "michaelirwin244/labspace-interface:${TAG}",
  ]
}

target "support-vscode-extension" {
  inherits = ["_common"]
  context = "./components/support-vscode-extension"
  tags = [
    "michaelirwin244/labspace-support-vscode-extension:${TAG}",
  ]
}

target "configurator" {
  inherits = ["_common"]
  context = "./components/configurator"
  tags = [
    "michaelirwin244/labspace-configurator:${TAG}",
  ]
}

target "workspace" {
  inherits = ["_common"]
  context = "./components/workspace"
  tags = [
    "michaelirwin244/labspace-workspace:${TAG}",
  ]
  
  contexts = {
    extension = "target:support-vscode-extension"
  }
}

target "host-port-republisher" {
  inherits = ["_common"]
  context = "./components/host-port-republisher"
  tags = [
    "michaelirwin244/labspace-host-port-republisher:${TAG}",
  ]
}

target "labspace-cleaner" {
  inherits = ["_common"]
  context = "./components/workspace-cleaner"
  tags = [
    "michaelirwin244/labspace-cleaner:${TAG}",
  ]
}
