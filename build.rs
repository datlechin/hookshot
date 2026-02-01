use std::fs;
use std::path::Path;

fn main() {
    // Ensure frontend/dist directory exists (even if empty)
    // This prevents include_dir! macro from panicking during tests
    let dist_path = Path::new("frontend/dist");

    if !dist_path.exists() {
        println!("cargo:warning=frontend/dist not found, creating empty directory for build");
        fs::create_dir_all(dist_path).expect("Failed to create frontend/dist directory");

        // Create a minimal index.html so the directory isn't completely empty
        let index_html = dist_path.join("index.html");
        fs::write(
            index_html,
            "<!DOCTYPE html><html><body>Build placeholder</body></html>",
        )
        .expect("Failed to create placeholder index.html");
    }

    // Tell Cargo to rerun this build script if frontend/dist changes
    println!("cargo:rerun-if-changed=frontend/dist");
}
