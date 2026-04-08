use std::sync::Arc;

use crate::repositories::greeting::{Greeting, GreetingError, GreetingRepository};

/// Business logic for greeting operations.
pub struct GreetingService {
    repository: Arc<dyn GreetingRepository + Send + Sync>,
}

impl GreetingService {
    /// Creates a new GreetingService backed by the given repository.
    pub fn new(repository: Arc<dyn GreetingRepository + Send + Sync>) -> Self {
        Self { repository }
    }

    /// Returns the current greeting from the repository.
    pub fn get_greeting(&self) -> Result<Greeting, GreetingError> {
        self.repository.fetch()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::greeting::mock::MockGreetingRepository;

    #[test]
    fn get_greeting_returns_repository_result() {
        let mut mock = MockGreetingRepository::new();
        mock.expect_fetch().once().returning(|| {
            Ok(Greeting {
                message: "Hello!".to_string(),
            })
        });

        let service = GreetingService::new(Arc::new(mock));
        let result = service.get_greeting().expect("expected Ok");
        assert_eq!(result.message, "Hello!");
    }

    #[test]
    fn get_greeting_propagates_fetch_error() {
        let mut mock = MockGreetingRepository::new();
        mock.expect_fetch()
            .once()
            .returning(|| Err(GreetingError::Fetch("db down".to_string())));

        let service = GreetingService::new(Arc::new(mock));
        assert!(service.get_greeting().is_err());
    }
}
