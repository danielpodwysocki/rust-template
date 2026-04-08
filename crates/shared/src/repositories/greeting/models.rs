use serde::{Deserialize, Serialize};

/// A greeting message returned by the greeting endpoint.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Greeting {
    pub message: String,
}
