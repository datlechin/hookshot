mod db;
mod handlers;
mod models;
mod services;
mod static_files;
mod websocket;

use axum::{
    routing::{any, delete, get, post, put},
    Router,
};
use clap::Parser;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::{
    compression::CompressionLayer,
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use websocket::WebSocketManager;

/// Hookshot - Self-hosted webhook testing tool
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// Host address to bind to
    #[arg(short = 'H', long, default_value = "127.0.0.1")]
    host: String,

    /// Port to listen on
    #[arg(short, long, default_value_t = 3000)]
    port: u16,

    /// Database URL (SQLite)
    #[arg(short, long, default_value = "sqlite:./hookshot.db")]
    database_url: String,
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
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
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| cli.database_url.clone());
    let pool = db::init_pool(&database_url)
        .await
        .expect("Failed to initialize database pool");

    tracing::info!("Database initialized successfully");

    // Initialize WebSocket manager
    let ws_manager = Arc::new(WebSocketManager::new());

    // Start heartbeat task for WebSocket connections
    let ws_manager_heartbeat = ws_manager.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
        loop {
            interval.tick().await;
            ws_manager_heartbeat.send_heartbeat().await;
        }
    });

    // Configure CORS to allow all origins
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Check if static files are embedded
    if static_files::is_embedded() {
        tracing::info!("Static files embedded successfully");
    } else {
        tracing::warn!("Static files not embedded - frontend may not be available");
    }

    // Build application routes
    let api_routes = Router::new()
        // Health check endpoint
        .route("/health", get(handlers::health_check))
        // API routes for endpoint management
        .route("/api/endpoints", post(handlers::endpoint::create_endpoint))
        .route("/api/endpoints", get(handlers::endpoint::list_endpoints))
        .route("/api/endpoints/{id}", get(handlers::endpoint::get_endpoint))
        .route(
            "/api/endpoints/{id}",
            delete(handlers::api::delete_endpoint),
        )
        .route(
            "/api/endpoints/{id}/response",
            put(handlers::api::update_endpoint_response),
        )
        // API routes for request retrieval
        .route(
            "/api/endpoints/{id}/requests",
            get(handlers::api::get_endpoint_requests),
        )
        .route("/api/requests/{id}", get(handlers::api::get_request_by_id))
        // WebSocket endpoint for real-time updates
        .route(
            "/ws/endpoints/{id}",
            get(handlers::websocket::websocket_handler),
        )
        // Webhook capture route - accepts all HTTP methods
        .route("/webhook/{id}", any(handlers::webhook::webhook_handler));

    // Combine API routes with static file serving
    let app = api_routes
        // Fallback to static file serving for all other routes (SPA support)
        .fallback(static_files::serve_static_file)
        .layer(CompressionLayer::new())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state((pool, ws_manager));

    // Start server
    let addr: SocketAddr = format!("{}:{}", cli.host, cli.port)
        .parse()
        .expect("Invalid host or port");
    tracing::info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .expect("Server failed");
}
