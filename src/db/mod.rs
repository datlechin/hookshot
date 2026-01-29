use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use sqlx::ConnectOptions;
use std::str::FromStr;
use tracing::log::LevelFilter;

/// Initialize SQLite connection pool with WAL mode and migrations
pub async fn init_pool(database_url: &str) -> Result<SqlitePool, sqlx::Error> {
    // Configure connection options with WAL mode
    let options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .log_statements(LevelFilter::Debug);

    // Create connection pool with max 5 connections
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    // Run migrations
    run_migrations(&pool).await?;

    Ok(pool)
}

/// Run database migrations
async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    // Read migration file
    let migration_sql = include_str!("../../migrations/20240129_initial_schema.sql");
    
    // Parse and execute SQL statements
    let mut current_statement = String::new();
    
    for line in migration_sql.lines() {
        let trimmed = line.trim();
        
        // Skip empty lines and standalone comments
        if trimmed.is_empty() || (trimmed.starts_with("--") && current_statement.is_empty()) {
            continue;
        }
        
        // Append line to current statement
        if !trimmed.starts_with("--") {
            current_statement.push_str(line);
            current_statement.push('\n');
        }
        
        // If line ends with semicolon, execute the statement
        if trimmed.ends_with(';') {
            let stmt = current_statement.trim().trim_end_matches(';').trim();
            if !stmt.is_empty() {
                sqlx::query(stmt).execute(pool).await?;
            }
            current_statement.clear();
        }
    }
    
    // Execute any remaining statement
    if !current_statement.trim().is_empty() {
        let stmt = current_statement.trim().trim_end_matches(';').trim();
        sqlx::query(stmt).execute(pool).await?;
    }

    tracing::info!("Database migrations completed successfully");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_pool_initialization() {
        let pool = init_pool("sqlite::memory:").await;
        assert!(pool.is_ok(), "Pool initialization should succeed");
    }

    #[tokio::test]
    async fn test_migrations() {
        let pool = init_pool("sqlite::memory:").await.unwrap();
        
        // Verify tables exist
        let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='table' AND name='endpoints'")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "Endpoints table should exist");

        let result = sqlx::query("SELECT name FROM sqlite_master WHERE type='table' AND name='requests'")
            .fetch_one(&pool)
            .await;
        assert!(result.is_ok(), "Requests table should exist");
    }

    #[tokio::test]
    async fn test_wal_mode() {
        // Use a temporary file database for this test since :memory: doesn't support WAL
        let temp_file = format!("sqlite:/tmp/test_wal_{}.db", std::process::id());
        let pool = init_pool(&temp_file).await.unwrap();
        
        // Verify WAL mode is enabled
        let row: (String,) = sqlx::query_as("PRAGMA journal_mode")
            .fetch_one(&pool)
            .await
            .unwrap();
        
        assert_eq!(row.0.to_lowercase(), "wal", "WAL mode should be enabled");
        
        // Clean up
        drop(pool);
        let _ = std::fs::remove_file(temp_file.replace("sqlite:", ""));
    }
}
