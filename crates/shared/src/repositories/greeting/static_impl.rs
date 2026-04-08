use super::{Greeting, GreetingError, GreetingRepository};

/// Returns a hardcoded greeting. No external dependencies required.
pub struct StaticGreetingRepository;

impl GreetingRepository for StaticGreetingRepository {
    fn fetch(&self) -> Result<Greeting, GreetingError> {
        Ok(Greeting {
            message: "Hello from Rust!".to_string(),
        })
    }
}
