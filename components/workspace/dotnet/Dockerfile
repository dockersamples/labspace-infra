FROM labspace-workspace-base

USER root
# https://learn.microsoft.com/en-us/dotnet/core/install/linux-debian
RUN wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
  && sudo dpkg -i packages-microsoft-prod.deb \
  && rm packages-microsoft-prod.deb

RUN sudo apt-get update \
  && sudo apt-get install -y dotnet-sdk-10.0 \
  && rm -rf /var/lib/apt/lists/*

USER 1000
RUN code-server --install-extension ms-dotnettools.csdevkit \
  && rm -rf /home/coder/.local/share/code-server/CachedExtensionVSIXs/.trash/*
