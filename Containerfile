FROM scratch as builder
COPY dist/ /extension/dist
COPY package.json /extension/
COPY LICENSE /extension/
COPY icon.png /extension/
COPY README.md /extension/
COPY config.json /extension/

FROM scratch

LABEL org.opencontainers.image.title="PODMAN STATS EXTENSION" \
        org.opencontainers.image.description="Podman Desktop Stats Extension" \
        org.opencontainers.image.vendor="Kyndryl / k_giovanni_scipione" \
        io.podman-desktop.api.version=">= 1.12.0"

COPY --from=builder /extension /extension
