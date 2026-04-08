pub mod mock;
pub mod models;
pub mod static_impl;

pub use models::Greeting;

#[cfg(test)]
use mockall::automock;
use thiserror::Error;

/// Errors that can occur when fetching a greeting.
#[derive(Debug, Error)]
pub enum GreetingError {
    #[error("failed to fetch greeting: {0}")]
    Fetch(String),
}

/// Repository trait for greeting data access.
#[cfg_attr(test, automock)]
pub trait GreetingRepository: Send + Sync {
    fn fetch(&self) -> Result<Greeting, GreetingError>;
}
