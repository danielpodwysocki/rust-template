use std::sync::Arc;

use axum::{routing::get, Router};
use shared::repositories::greeting::{static_impl::StaticGreetingRepository, GreetingRepository};

pub mod handlers;

/// Constructs the top-level application router with all route handlers wired up.
pub fn router() -> Router {
    let greeting_repo: Arc<dyn GreetingRepository + Send + Sync> =
        Arc::new(StaticGreetingRepository);

    Router::new()
        .route("/api/v1/health", get(handlers::health::health_check))
        .route("/api/v1/greetings", get(handlers::greetings::get_greeting))
        .with_state(greeting_repo)
}
