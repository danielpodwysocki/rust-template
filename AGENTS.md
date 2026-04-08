## Copilot instructions

This file contains instructions for how to work in this codebase. Follow these guidelines strictly.


## Project structure - design and layout

The project structure follows Workspace-Oriented Design.
The philosophy is "what deploys together, lives together in a single git repository".

That means you can have multiple services here — for example a batch processing crate and an API crate as separate workspace members.
Attempt to keep the amount of API services minimal. When you add one, update the project-specific structure section below in this file.

For data/business logic separation, we use the service/repository pattern: all business logic lives in services, all data handling in repositories.

The workspace layout looks as follows:

- `Cargo.toml` - workspace manifest listing all member crates
- `crates/` - one directory per deployable or shared crate
  - `crates/shared/` - **mandatory shared library**: repository traits, models, and services reusable across multiple programs
    - `src/lib.rs` - re-exports all public modules
    - `src/services/` - business logic reusable across programs
    - `src/repositories/` - repository traits, models, and implementations
  - `crates/api/` - HTTP API service (depends on `crates/shared`)
    - `src/main.rs` - entry point
    - `src/routes/` - axum router and handler registration
    - `src/config.rs` - configuration loaded from env/flags
    - `src/error.rs` - application-level error type
  - `crates/<cli-name>/` - CLI programs (depend on `crates/shared`)
    - `src/main.rs` - entry point, clap setup
- `tests/` - integration tests (one file per program under test)

**The rule for placement — no exceptions:**
- Services and repositories **always** go in `crates/shared/`, regardless of whether they are currently used by more than one program
- Individual program crates contain **only** transport-layer code: HTTP handlers, axum routers, CLI argument structs, `Config`, `main.rs`, and program-specific error types
- If you are unsure whether something is "transport-layer", ask: does it touch the network, CLI args, or program lifecycle? If no → it belongs in `crates/shared/`

Under `crates/` you can put programs of all kinds: CLI tools, daemons, web services.
For web services, assuming service `hello` as an example, follow this structure:
- `crates/hello/src/main.rs` - entry point, server setup
- `crates/hello/src/routes/` - axum Router construction and handlers
- `crates/hello/src/routes/handlers/` - individual handler functions
- `crates/hello/tests/` - integration tests

Repositories must only ever be imported in services, never directly in handlers.

Each `crates/shared/src/repositories/<RepositoryName>/` follows this structure:
- `mod.rs` - the trait definition that all implementations must satisfy
- `models.rs` - data models returned by the repository
- `mock.rs` - mock implementation with no external connectors (for unit tests)
- `<datasource>.rs` - specific implementations (e.g., `postgres.rs`, `mysql.rs`)


Only add new programs when explicitly requested in the task specification.
When adding a new deployable program (web service, CLI, daemon), you must:
1. Create `crates/<name>/` with `Cargo.toml` (declare `shared = { path = "../shared" }`) and `src/main.rs`
2. Add the crate to the workspace `Cargo.toml` members list
3. Place any new business logic or repository code in `crates/shared/`, not in the new crate
4. For web services: create `images/<name>.containerfile`, update `skaffold.yaml`, create `kube/<name>-deployment.yaml`, update `kube/kustomization.yaml`
5. Update the "Project structure - project specific" section in this file



## Project structure - project specific

This section documents project-specific services, repositories, and their responsibilities.
**IMPORTANT:** Update this section whenever you add a new service or repository.

### Services

#### api (crates/api)
HTTP API service providing REST endpoints. Main entry point for the application.

### Repositories

(No repositories yet — add entries here as repositories are created)

### Shared Crate (crates/shared)

The shared crate is the home for all reusable business logic and data access. Every service and CLI in this repo depends on it.

#### Services

- **GreetingService** (`crates/shared/src/services/greeting.rs`) — returns a greeting via repository injection

#### Repositories

- **GreetingRepository** (`crates/shared/src/repositories/greeting/`) — trait + static implementation returning a hardcoded greeting


## Tools available

The `task` command (a make alternative) is installed and available.
Available task targets defined in `Taskfile.yml`:

- `task dev` - Start development environment with Skaffold
- `task build` - Build all binaries in release mode
- `task run` - Run the API locally
- `task test` - Run all tests (Rust + frontend unit tests)
- `task coverage` - Measure service coverage; fails if < 100% line coverage on crates/shared/src/services
- `task lint` - Run clippy, check formatting, and typecheck frontend
- `task fmt` - Auto-format all code
- `task cluster` - Create Kind cluster
- `task cleanup` - Delete Kind cluster
- `task docker-build` - Build container image locally
- `task project-init` - Initialize project by replacing rust-template with current directory name
- `task install-frontend` - Install frontend npm dependencies
- `task test-frontend` - Run frontend unit tests (vitest)
- `task coverage-frontend` - Measure frontend coverage; fails if below 100%
- `task test-e2e-frontend` - Run frontend e2e tests (Playwright)


The environment is managed by Nix flakes (defined in `flake.nix` at repo root).
To enter the development environment: `nix develop` or use direnv with `.envrc`

Available CLI tools in the Nix environment:
- rustup (manages Rust toolchain — run `rustup toolchain install stable` on first use)
- rust-analyzer (Rust language server)
- cargo-nextest (faster test runner)
- cargo-watch (file watcher for auto-rebuild)
- go-task (task runner, a make alternative)
- skaffold (Kubernetes deployment tool)
- kubectl (Kubernetes CLI)
- kind (local Kubernetes clusters)
- docker (container runtime)
- git
- k9s (Kubernetes TUI)

You also have access to standard shell utilities.


## How to validate changes

After writing a function that exposes behavior in a service:
1. Run `task lint` and fix issues until it passes
2. Write unit tests for the function
3. Run `task test` and fix until tests pass

When making changes to services:
1. Use `task run` to test locally
2. Use `task dev` to test in Kubernetes with hot reload
3. Verify the service responds correctly


## How to write code

### Code review markers
- Mark uncertain code with `// CIFail: Human Review Required` followed by details about security implications, code style, performance concerns, or data expectations

### Rust style and structure
- Use standard Rust naming conventions: `snake_case` for functions, variables, modules, and fields; `PascalCase` for types, structs, enums, and traits; `SCREAMING_SNAKE_CASE` for constants
- Write single-responsibility functions that accomplish one meaningful task — avoid both micro-functions and bloated ones
- Abstract only when it improves clarity
- Data models describe a single concept
- Abstract late rather than early — only when the abstraction is complete, predictable, and leaks no implementation details
- Prefer newtypes over raw primitives for domain concepts (e.g., `struct UserId(i64)` over bare `i64`)

### Comments
- Comment public items for rustdoc generation (succinct style using `///`)
- Only write non-rustdoc comments when describing obscure upstream behavior or non-obvious invariants

### Architecture patterns
- All data access must go through the repository pattern — no direct data operations outside repositories
- Define each repository as a trait; pass implementations via dependency injection (function parameters or struct fields)
- This ensures pure business logic in the service layer
- Mock all repositories in unit tests by passing mock implementations (use `mockall` crate)
- Core code MUST NEVER contain test-specific functionality or conditionals — only mock repositories should be test-aware

### Testing

**Coverage requirements:**
- `crates/shared/src/services/` — **100% line coverage enforced**. `task coverage` fails the build if any service line is uncovered. There are no exceptions; write the test before closing the task.
- `crates/shared/src/repositories/` — no coverage requirement. Repository implementations are integration-tested against a real data source, not unit-tested.
- Individual program crates — no coverage requirement. Handlers and CLI glue are validated via e2e tests.

**Rules:**
- Write unit tests as you develop; run `task test` continuously
- Place unit tests in the same file as the code under test, inside a `#[cfg(test)]` module
- Place integration tests in `tests/` at the crate root
- Cover unexpected usage and bad data in service tests
- Mock all repositories in service unit tests via trait injection (`mockall`)

### Data models
- Reuse data models from stable upstream APIs only when they correctly represent the data being handled
- Derive `serde::Serialize` / `serde::Deserialize` on models that cross serialization boundaries

### Focus and context
- Work on one crate/module at a time
- Avoid reading files outside the current focus unless necessary

### Error handling
- Use `thiserror` to define typed error enums in library/service code
- Use `anyhow` for application-level error propagation in binaries
- Use `?` for propagation; avoid `.unwrap()` except in tests
- Use `panic!` only for truly impossible program states (invariant violations)
- Be explicit — avoid silent fallback logic when not warranted
- Mark code with retry logic with `// CIFail: Human Review Required`


## Rust-specific details

### Logging
- Use `tracing` with `tracing-subscriber` for structured logging
- Instrument async functions with `#[tracing::instrument]`

### Configuration
- Use `clap` with the `derive` feature for CLI arguments
- Use `clap`'s `env` attribute to fall back to environment variables with corresponding names
- Example: `#[arg(long, env = "API_PORT", default_value = "3000")]`

### Dependencies
- Prefer the standard library where convenient
- Use `sqlx` for raw SQL queries — the repository layer is your ORM
- Avoid ORMs that obscure the SQL being executed

### HTTP framework
- Use `axum` as the HTTP framework
- Structure routers using `axum::Router::new()` and nest sub-routers per service
- Return `impl IntoResponse` from handlers; use typed extractors (`Json<T>`, `Path<T>`, etc.)

### Performance awareness
- Mark performance-sensitive code with `// CIWarning: Perf Review Recommended`
- Apply this to:
  - Allocations in hot paths
  - Large serialization operations
  - Data-intensive queries handling large datasets


## Frontend conventions (frontends/web/)

The Nuxt 3 frontend mirrors the Rust backend's service/repository pattern.

### Layer responsibilities
- **`api/`** — repository layer: Zod schemas + `ofetch` wrappers only. No state, no Vue reactivity.
- **`composables/`** — service layer: all business logic, independently testable. Call `api/` functions here.
- **`components/`** — thin UI shells: props-driven, no direct API calls, no composable calls inside child components. Composables are called in pages/parent components; state is passed down as props.
- **`stores/`** — Pinia stores for global state only; composables for page/component-scoped logic.
- **`pages/`** — use composables, pass state to components as props.

### TypeScript
- Strict mode and `noUncheckedIndexedAccess` are enforced.
- Parse-don't-validate: always `Schema.parse(raw)`, never `raw as SomeType`.

### HTTP proxy
- Frontend never talks directly to the Rust API; all traffic goes through the Nuxt server proxy (`/backend/**`).
- The proxy target is `API_BASE_URL` (env var, defaulting to `http://localhost:3000`).

### Testing
- **100% unit coverage** enforced on `api/`, `composables/`, `components/`, `stores/`. `task coverage-frontend` fails if below threshold.
- Unit tests live in `tests/unit/`, organised by layer.
- Components receive all state via props — mount-and-assert tests need no composable mocking.
- E2e (Playwright): one test per page minimum, covers happy path; no line coverage requirement.
- Run `task test-frontend` for unit tests, `task test-e2e-frontend` for Playwright.

### Package manager
- Use `npm` with `npm ci` for reproducible installs.


## How to design APIs

When creating web endpoints:

### Endpoint structure
- Always version endpoints: `/<program name>/v1/<service name>`
  - `<service name>` corresponds to services in `src/services/`
  - `<program name>` is the crate name in `crates/`

### Updates
- Use field masks (partial update structs) when performing updates on data


## Writing tests as you develop

A test container with mounted test files is available in the local development cluster.

Start it with: `task cluster-up`

This builds and brings up:
- The main service container and all e2e test dependencies
- The test container for running tests

You can exec into the dev/test container via: `kubectl exec -n default -it deployments/dev-tooling -- <command>`


## Validating your changes

Here is how you validate your changes:
- once the change is ready, ensure `task lint` passes
- then, ensure your code passes `task test`
- then, ensure service coverage is 100%: `task coverage` (fails if any service line is uncovered)
- then, ensure your code passes the e2e suite: `task verify-all`


## How to navigate this codebase

### Dependencies
- Check `Cargo.toml` for direct dependencies; `Cargo.lock` for pinned transitive versions
- Only look up crate source when investigating unclear upstream behavior or searching for reusable types
- Exclude `target/` from all searches


## Dependency management

- Always commit `Cargo.lock` for binaries — it is the reproducible build record
- Use workspace-level `[dependencies]` in the root `Cargo.toml` to share dependency versions across crates
- Pin versions explicitly for security-sensitive dependencies
