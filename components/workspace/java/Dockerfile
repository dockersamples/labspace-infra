FROM labspace-workspace-base

USER root

# Install and setup Java (pulling from the eclipse-temurin image and Dockerfile)
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH=$JAVA_HOME/bin:$PATH
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8'
RUN set -eux; \
    apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        fontconfig \
        ca-certificates p11-kit \
        binutils \
        tzdata \
        locales \
    ; \
    echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen; \
    locale-gen en_US.UTF-8; \
    rm -rf /var/lib/apt/lists/*
COPY --from=eclipse-temurin:21.0.9_10-jdk /opt/java/openjdk /opt/java/openjdk
RUN find "$JAVA_HOME/lib" -name '*.so' -exec dirname '{}' ';' | sort -u > /etc/ld.so.conf.d/docker-openjdk.conf; \
    ldconfig; \
    java -Xshare:dump;

RUN set -eux; \
    echo "Verifying install ..."; \
    fileEncoding="$(echo 'System.out.println(System.getProperty("file.encoding"))' | jshell -s -)"; [ "$fileEncoding" = 'UTF-8' ]; rm -rf ~/.java; \
    echo "javac --version"; javac --version; \
    echo "java --version"; java --version; \
    echo "Complete."

# Setup Maven
ENV MAVEN_HOME=/usr/share/maven
COPY --from=maven:3.9.12-eclipse-temurin-21 ${MAVEN_HOME} ${MAVEN_HOME}
RUN ln -s ${MAVEN_HOME}/bin/mvn /usr/bin/mvn


USER 1000
RUN code-server --install-extension vscjava.vscode-java-pack && \
    rm -rf /home/coder/.local/share/code-server/CachedExtensionVSIXs/.trash/*
