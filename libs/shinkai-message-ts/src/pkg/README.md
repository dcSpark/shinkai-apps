## Compile WASM bundle
Run the following command:

`wasm-pack build`

a folder called `pkg` will be generated under the root directory of shinkai-message-wasm. You should copy the entire folder to the required typescript project.

## How To Run The Tests

For Rust tests:

`cargo test -- --test-threads=1`

For WASM tests:

`wasm-pack test --node`