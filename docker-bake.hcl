group "default" {
  targets = [ "interface", "configurator", "ide", "host-port-republisher", "labspace-cleaner" ]
}

target "_common" {
  dockerfile = "Dockerfile"
  
  platforms = [
    "linux/amd64",
    "linux/arm64",
  ]
}

target "interface" {
  inherits = ["_common"]
  context = "./lab-interface"
  tags = [
    "michaelirwin244/labspace-interface",
  ]
}

target "configurator" {
  inherits = ["_common"]
  context = "./support/setup"
  tags = [
    "michaelirwin244/labspace-configurator",
  ]
}

target "ide" {
  inherits = ["_common"]
  context = "./support/workspace"
  tags = [
    "michaelirwin244/labspace-ide",
  ]
}

target "host-port-republisher" {
  inherits = ["_common"]
  context = "./support/host-port-republisher"
  tags = [
    "michaelirwin244/labspace-host-port-republisher",
  ]
}

target "labspace-cleaner" {
  inherits = ["_common"]
  context = "./support/workspace-cleaner"
  tags = [
    "michaelirwin244/labspace-cleaner",
  ]
}
