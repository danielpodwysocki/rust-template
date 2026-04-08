use std::sync::Arc;

use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use shared::{repositories::greeting::GreetingRepository, services::greeting::GreetingService};

/// GET /api/v1/greetings — returns a JSON greeting from the Rust API.
pub async fn get_greeting(
    State(repo): State<Arc<dyn GreetingRepository + Send + Sync>>,
) -> impl IntoResponse {
    let service = GreetingService::new(repo);
    match service.get_greeting() {
        Ok(greeting) => (StatusCode::OK, Json(greeting)).into_response(),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}
