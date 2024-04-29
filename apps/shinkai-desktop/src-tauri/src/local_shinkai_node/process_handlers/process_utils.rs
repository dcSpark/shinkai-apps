use std::collections::HashMap;

/// Converts any object to a HashMap for environment variables.
pub fn options_to_env<T: serde::Serialize>(options: &T) -> HashMap<String, String> {
    let mut env = HashMap::new();
    let options_reflection = serde_json::to_value(options).unwrap();
    for (key, value) in options_reflection.as_object().unwrap() {
        let env_key = key.to_uppercase();
        let env_value = value.as_str().unwrap_or_default().to_string();
        env.insert(env_key, env_value);
    }
    env
}
