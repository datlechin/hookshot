mod db;
mod handlers;
mod models;
mod services;

use axum::{
    routing::{any, delete, get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "hookshot=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting Hookshot server...");

    // Initialize database
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:./hookshot.db".to_string());
    let pool = db::init_pool(&database_url)
        .await
        .expect("Failed to initialize database pool");

    tracing::info!("Database initialized successfully");

    // Configure CORS to allow all origins
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build application routes
    let app = Router::new()
        // API routes for endpoint management
        .route("/api/endpoints", post(handlers::endpoint::create_endpoint))
        .route("/api/endpoints", get(handlers::endpoint::list_endpoints))
        // API routes for request retrieval
        .route("/api/endpoints/:id/requests", get(handlers::api::get_endpoint_requests))
        .route("/api/requests/:id", get(handlers::api::get_request_by_id))
        .route("/api/endpoints/:id", delete(handlers::api::delete_endpoint))
        // Webhook capture route - accepts all HTTP methods
        .route("/webhook/:id", any(handlers::webhook::webhook_handler))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(pool)
        .into_make_service_with_connect_info::<SocketAddr>();

    // Start server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}

