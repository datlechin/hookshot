use axum::{
    body::Body,
    http::{header, StatusCode, Uri},
    response::{IntoResponse, Response},
};
use include_dir::{include_dir, Dir};

// Embed the frontend dist directory at compile time
// Note: build.rs ensures this directory exists even during tests
static STATIC_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/frontend/dist");

/// Serve static files from embedded directory
pub async fn serve_static_file(uri: Uri) -> Response {
    let path = uri.path().trim_start_matches('/');

    // Try to get the requested file
    if let Some(file) = STATIC_DIR.get_file(path) {
        return serve_file(path, file.contents());
    }

    // For SPA routing: if file not found and not an API/webhook/ws route,
    // serve index.html to let the frontend router handle it
    if !path.starts_with("api/") && !path.starts_with("webhook/") && !path.starts_with("ws/") {
        if let Some(index) = STATIC_DIR.get_file("index.html") {
            return serve_file("index.html", index.contents());
        }
    }

    // 404 if nothing matches
    (StatusCode::NOT_FOUND, "404 Not Found").into_response()
}

fn serve_file(path: &str, contents: &[u8]) -> Response {
    let mime_type = mime_guess::from_path(path).first_or_octet_stream();

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, mime_type.as_ref())
        .header(header::CACHE_CONTROL, "public, max-age=31536000")
        .body(Body::from(contents.to_vec()))
        .unwrap()
}

/// Check if static files are embedded (for runtime verification)
pub fn is_embedded() -> bool {
    STATIC_DIR.get_file("index.html").is_some()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_static_dir_compiles() {
        // In test mode, STATIC_DIR is set to src/ directory
        // This test just verifies that the module compiles without panic
        // The actual static file serving is tested in integration tests
        assert!(!is_embedded()); // index.html won't exist in src/
    }

    #[tokio::test]
    async fn test_serve_static_returns_404_in_tests() {
        // In test mode, serving files returns 404 since we don't have the frontend built
        let uri = "/".parse::<Uri>().unwrap();
        let response = serve_static_file(uri).await;
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
}
