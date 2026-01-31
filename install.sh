#!/bin/sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO="datlechin/hookshot"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
BINARY_NAME="hookshot"

# Detect OS and architecture
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Linux*)
            case "$ARCH" in
                x86_64) PLATFORM="linux-x86_64" ;;
                aarch64|arm64) PLATFORM="linux-arm64" ;;
                *)
                    echo "${RED}Error: Unsupported architecture: $ARCH${NC}"
                    exit 1
                    ;;
            esac
            ;;
        Darwin*)
            case "$ARCH" in
                x86_64) PLATFORM="macos-x86_64" ;;
                arm64) PLATFORM="macos-arm64" ;;
                *)
                    echo "${RED}Error: Unsupported architecture: $ARCH${NC}"
                    exit 1
                    ;;
            esac
            ;;
        MINGW*|MSYS*|CYGWIN*)
            echo "${RED}Error: Windows is not supported by this installer${NC}"
            echo "Please download the binary manually from:"
            echo "https://github.com/$REPO/releases/latest"
            exit 1
            ;;
        *)
            echo "${RED}Error: Unsupported OS: $OS${NC}"
            exit 1
            ;;
    esac
}

# Get latest version from GitHub API
get_latest_version() {
    echo "${YELLOW}Fetching latest version...${NC}"
    VERSION=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')

    if [ -z "$VERSION" ]; then
        echo "${RED}Error: Could not fetch latest version${NC}"
        exit 1
    fi

    echo "${GREEN}Latest version: $VERSION${NC}"
}

# Download and install binary
install_binary() {
    DOWNLOAD_URL="https://github.com/$REPO/releases/download/$VERSION/hookshot-$VERSION-$PLATFORM.tar.gz"
    CHECKSUM_URL="https://github.com/$REPO/releases/download/$VERSION/hookshot-$VERSION-$PLATFORM.tar.gz.sha256"

    echo "${YELLOW}Downloading from: $DOWNLOAD_URL${NC}"

    # Create temporary directory
    TMP_DIR=$(mktemp -d)
    cd "$TMP_DIR"

    # Download binary and checksum
    if ! curl -fsSL -o hookshot.tar.gz "$DOWNLOAD_URL"; then
        echo "${RED}Error: Failed to download binary${NC}"
        rm -rf "$TMP_DIR"
        exit 1
    fi

    if ! curl -fsSL -o hookshot.tar.gz.sha256 "$CHECKSUM_URL"; then
        echo "${YELLOW}Warning: Could not download checksum file${NC}"
    else
        # Verify checksum
        echo "${YELLOW}Verifying checksum...${NC}"
        if command -v shasum >/dev/null 2>&1; then
            # Extract just the hash from the checksum file (first field)
            EXPECTED_HASH=$(awk '{print $1}' hookshot.tar.gz.sha256)
            ACTUAL_HASH=$(shasum -a 256 hookshot.tar.gz | awk '{print $1}')

            if [ "$EXPECTED_HASH" != "$ACTUAL_HASH" ]; then
                echo "${RED}Error: Checksum verification failed${NC}"
                echo "${RED}Expected: $EXPECTED_HASH${NC}"
                echo "${RED}Got:      $ACTUAL_HASH${NC}"
                rm -rf "$TMP_DIR"
                exit 1
            fi
            echo "${GREEN}Checksum verified${NC}"
        else
            echo "${YELLOW}Warning: shasum not found, skipping checksum verification${NC}"
        fi
    fi

    # Extract binary
    echo "${YELLOW}Extracting binary...${NC}"
    tar -xzf hookshot.tar.gz

    # Find the extracted binary
    EXTRACTED_BINARY=$(find . -name "hookshot-*" -type f ! -name "*.tar.gz*" | head -1)

    if [ -z "$EXTRACTED_BINARY" ]; then
        echo "${RED}Error: Could not find extracted binary${NC}"
        rm -rf "$TMP_DIR"
        exit 1
    fi

    # Create install directory if it doesn't exist
    mkdir -p "$INSTALL_DIR"

    # Install binary
    echo "${YELLOW}Installing to $INSTALL_DIR/$BINARY_NAME${NC}"
    mv "$EXTRACTED_BINARY" "$INSTALL_DIR/$BINARY_NAME"
    chmod +x "$INSTALL_DIR/$BINARY_NAME"

    # Cleanup
    cd - >/dev/null
    rm -rf "$TMP_DIR"

    echo "${GREEN}Installation complete!${NC}"
}

# Check if binary is in PATH
check_path() {
    if ! echo "$PATH" | tr ':' '\n' | grep -q "^$INSTALL_DIR$"; then
        echo ""
        echo "${YELLOW}Note: $INSTALL_DIR is not in your PATH${NC}"
        echo "Add this to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
        echo ""
        echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
        echo ""
        echo "Then reload your shell or run: source ~/.bashrc"
    fi
}

# Print success message
print_success() {
    echo ""
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${GREEN}  Hookshot $VERSION installed successfully!${NC}"
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Quick start:"
    echo "  1. Run: ${GREEN}$BINARY_NAME${NC}"
    echo "  2. Open: ${GREEN}http://localhost:3000${NC}"
    echo ""
    echo "Options:"
    echo "  ${GREEN}$BINARY_NAME --help${NC}      Show available options"
    echo "  ${GREEN}$BINARY_NAME --version${NC}   Show version"
    echo "  ${GREEN}$BINARY_NAME --port 8080${NC} Run on custom port"
    echo ""
    echo "Documentation: https://github.com/$REPO"
    echo ""
}

# Main installation flow
main() {
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${GREEN}  Hookshot Installer${NC}"
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    detect_platform
    echo "${GREEN}Platform detected: $PLATFORM${NC}"
    echo ""

    get_latest_version
    install_binary
    check_path
    print_success
}

main
