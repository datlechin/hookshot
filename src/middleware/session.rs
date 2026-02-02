use axum::{
    extract::Request,
    http::{header, HeaderValue, StatusCode},
    middleware::Next,
    response::Response,
};
use uuid::Uuid;

const SESSION_COOKIE_NAME: &str = "hookshot_session";

/// Extract session ID from cookie or generate a new one
pub fn get_or_create_session(headers: &axum::http::HeaderMap) -> String {
    // Try to extract session from cookie
    if let Some(cookie_header) = headers.get(header::COOKIE) {
        if let Ok(cookie_str) = cookie_header.to_str() {
            for cookie in cookie_str.split(';') {
                let cookie = cookie.trim();
                if let Some(value) = cookie.strip_prefix(&format!("{}=", SESSION_COOKIE_NAME)) {
                    // Validate UUID format
                    if Uuid::parse_str(value).is_ok() {
                        return value.to_string();
                    }
                }
            }
        }
    }

    // Generate new session ID
    Uuid::new_v4().to_string()
}

/// Middleware to ensure session cookie is set
pub async fn session_middleware(mut request: Request, next: Next) -> Result<Response, StatusCode> {
    let session_id = get_or_create_session(request.headers());

    // Store session ID in request extensions for handlers to access
    request
        .extensions_mut()
        .insert(SessionId(session_id.clone()));

    let mut response = next.run(request).await;

    // Set session cookie in response (if not already set)
    let cookie_value = format!(
        "{}={}; Path=/; HttpOnly; SameSite=Lax; Max-Age={}",
        SESSION_COOKIE_NAME,
        session_id,
        60 * 60 * 24 * 365 // 1 year
    );

    if let Ok(header_value) = HeaderValue::from_str(&cookie_value) {
        response
            .headers_mut()
            .insert(header::SET_COOKIE, header_value);
    }

    Ok(response)
}

/// Session ID extractor for use in handlers
#[derive(Clone, Debug)]
pub struct SessionId(pub String);
