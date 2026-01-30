use std::process::Command;
use std::path::Path;

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
    }
}

fn build_frontend() {
    let frontend_dir = Path::new("frontend");

    if !frontend_dir.exists() {
        println!("cargo:warning=Frontend directory not found, skipping build");
        return;
    }

    println!("cargo:warning=Building frontend...");

    // Check if node_modules exists, if not run npm install
    let node_modules = frontend_dir.join("node_modules");
    if !node_modules.exists() {
        println!("cargo:warning=Installing frontend dependencies...");
        let status = Command::new("npm")
            .args(&["install"])
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
    let status = Command::new("npm")
        .args(&["run", "build"])
        .current_dir(frontend_dir)
        .status();

    match status {
        Ok(s) if s.success() => println!("cargo:warning=Frontend built successfully"),
        Ok(s) => panic!("npm run build failed with status: {}", s),
        Err(e) => panic!("Failed to run npm run build: {}", e),
    }

    // Verify dist directory was created
    let dist_dir = frontend_dir.join("dist");
    if !dist_dir.exists() {
        panic!("Frontend dist directory not found after build");
    }

    println!("cargo:warning=Frontend build complete");
}
