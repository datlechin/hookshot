use std::path::Path;
use std::process::Command;

fn main() {
    // Trigger rebuild if frontend files change
    println!("cargo:rerun-if-changed=frontend/src");
    println!("cargo:rerun-if-changed=frontend/package.json");
    println!("cargo:rerun-if-changed=frontend/vite.config.ts");

    // Check if we're in release mode
    let profile = std::env::var("PROFILE").unwrap_or_default();

    // Only build frontend in release mode or if FORCE_FRONTEND_BUILD is set
    if profile == "release" || std::env::var("FORCE_FRONTEND_BUILD").is_ok() {
        build_frontend();
    } else {
        println!("cargo:warning=Skipping frontend build in dev mode. Set FORCE_FRONTEND_BUILD=1 to force build.");
        ensure_frontend_placeholder();
    }
}

fn ensure_frontend_placeholder() {
    let dist_dir = Path::new("frontend/dist");
    if !dist_dir.exists() {
        println!("cargo:warning=Creating placeholder frontend assets for development...");
        std::fs::create_dir_all(dist_dir).unwrap();
        std::fs::write(
            dist_dir.join("index.html"),
            "<html><body>Placeholder for development</body></html>",
        )
        .unwrap();
    }
}

fn build_frontend() {
    let frontend_dir = Path::new("frontend");

    if !frontend_dir.exists() {
        println!("cargo:warning=Frontend directory not found, skipping build");
        return;
    }

    // Check if dist directory already exists (e.g., from CI pre-build)
    let dist_dir = frontend_dir.join("dist");
    if dist_dir.exists() && dist_dir.join("index.html").exists() {
        println!("cargo:warning=Frontend dist already exists, skipping build");
        return;
    }

    // Skip frontend build if SKIP_FRONTEND_BUILD is set
    if std::env::var("SKIP_FRONTEND_BUILD").is_ok() {
        println!("cargo:warning=SKIP_FRONTEND_BUILD is set, skipping frontend build");
        ensure_frontend_placeholder();
        return;
    }

    println!("cargo:warning=Building frontend...");

    // Determine npm command based on platform
    let npm_cmd = if cfg!(target_os = "windows") {
        "npm.cmd"
    } else {
        "npm"
    };

    // Check if node_modules exists, if not run npm install
    let node_modules = frontend_dir.join("node_modules");
    if !node_modules.exists() {
        println!("cargo:warning=Installing frontend dependencies...");
        let status = Command::new(npm_cmd)
            .args(["install"])
            .current_dir(frontend_dir)
            .status();

        match status {
            Ok(s) if s.success() => println!("cargo:warning=Frontend dependencies installed"),
            Ok(s) => panic!("npm install failed with status: {}", s),
            Err(e) => panic!("Failed to run npm install: {}", e),
        }
    }

    // Run npm run build
    println!("cargo:warning=Running npm build...");
    let status = Command::new(npm_cmd)
        .args(["run", "build"])
        .current_dir(frontend_dir)
        .status();

    match status {
        Ok(s) if s.success() => println!("cargo:warning=Frontend built successfully"),
        Ok(s) => panic!("npm run build failed with status: {}", s),
        Err(e) => panic!("Failed to run npm run build: {}", e),
    }

    // Verify dist directory was created
    if !dist_dir.exists() {
        panic!("Frontend dist directory not found after build");
    }

    println!("cargo:warning=Frontend build complete");
}
