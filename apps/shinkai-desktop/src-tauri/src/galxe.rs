use blake3::Hasher;
use ed25519_dalek::{Signer, SigningKey, VerifyingKey};

pub fn unsafe_deterministic_signature_keypair(bytes: &[u8]) -> (SigningKey, VerifyingKey) {
    let mut hasher = blake3::Hasher::new();
    hasher.update(bytes);
    let hash = hasher.finalize();

    let secret_key = SigningKey::from_bytes(hash.as_bytes());
    let public_key = VerifyingKey::from(&secret_key);
    (secret_key, public_key)
}

pub fn generate_desktop_installation_proof(
    node_signature: String,
) -> Result<(String, String), String> {
    let secret_desktop_key: &str =
        option_env!("SECRET_DESKTOP_INSTALLATION_PROOF_KEY").unwrap_or("Dc9{3R9JmXe7£w9Fs](7");
    let (secret_key, public_key) =
        unsafe_deterministic_signature_keypair(node_signature.as_bytes());
    // Convert the public key to hex
    let public_key_hex = hex::encode(public_key.to_bytes());

    // Combine the public key hex and the secret desktop key
    let combined = format!("{}{}", public_key_hex, secret_desktop_key);

    // Hash the combined value and take the last 4 characters
    let mut hasher = Hasher::new();
    hasher.update(combined.as_bytes());
    let hash_result = hasher.finalize();
    let hash_str = hex::encode(hash_result.as_bytes());
    let last_8_chars = &hash_str[hash_str.len() - 8..];

    // Concatenate the public key hex with the last 4 characters using :::
    let concatenated = format!("{}:::{}", public_key_hex, last_8_chars);

    // Hash the concatenated string
    let mut hasher = Hasher::new();
    hasher.update(concatenated.as_bytes());
    let final_hash_result = hasher.finalize();
    let final_hash_bytes = final_hash_result.as_bytes();

    // Sign the final hash
    let signature = secret_key.sign(final_hash_bytes);

    // Return the signature as a hexadecimal string and the concatenated string
    Ok((hex::encode(signature.to_bytes()), concatenated))
}

pub fn generate_subscription_proof(
    node_signature: String,
    number_of_subscriptions: u32,
) -> Result<(String, String), String> {
    let secret_desktop_key: &str =
        option_env!("SECRET_DESKTOP_INSTALLATION_PROOF_KEY").unwrap_or("Dc9{3R9JmXe7£w9Fs](7");
    let (secret_key, public_key) =
        unsafe_deterministic_signature_keypair(node_signature.as_bytes());
    // Convert the public key to hex
    let public_key_hex = hex::encode(public_key.to_bytes());

    // Combine the public key hex and the secret desktop key
    let combined = format!("{}{}", public_key_hex, secret_desktop_key);

    // Hash the combined value and take the last 4 characters
    let mut hasher = Hasher::new();
    hasher.update(combined.as_bytes());
    let hash_result = hasher.finalize();
    let hash_str = hex::encode(hash_result.as_bytes());
    let last_8_chars = &hash_str[hash_str.len() - 8..];

    // Concatenate the public key hex with the last 4 characters and number of subscriptions using :::
    let concatenated = format!(
        "{}:::{}:::num_subs_{}",
        public_key_hex, last_8_chars, number_of_subscriptions
    );

    // Hash the concatenated string
    let mut hasher = Hasher::new();
    hasher.update(concatenated.as_bytes());
    let final_hash_result = hasher.finalize();
    let final_hash_bytes = final_hash_result.as_bytes();

    // Sign the final hash
    let signature = secret_key.sign(final_hash_bytes);

    // Return the signature as a hexadecimal string and the concatenated string
    Ok((hex::encode(signature.to_bytes()), concatenated))
}

pub fn generate_qa_subscription_proof(
    node_signature: String,
    number_of_subscriptions: u32,
) -> Result<(String, String), String> {
    let secret_desktop_key: &str =
        option_env!("SECRET_DESKTOP_INSTALLATION_PROOF_KEY").unwrap_or("Dc9{3R9JmXe7£w9Fs](7");
    let (secret_key, public_key) =
        unsafe_deterministic_signature_keypair(node_signature.as_bytes());
    // Convert the public key to hex
    let public_key_hex = hex::encode(public_key.to_bytes());

    // Combine the public key hex and the secret desktop key
    let combined = format!("{}{}", public_key_hex, secret_desktop_key);

    // Hash the combined value and take the last 4 characters
    let mut hasher = Hasher::new();
    hasher.update(combined.as_bytes());
    let hash_result = hasher.finalize();
    let hash_str = hex::encode(hash_result.as_bytes());
    let last_8_chars = &hash_str[hash_str.len() - 8..];

    // Concatenate the public key hex with the last 4 characters and number of QA subscriptions using :::
    let concatenated = format!(
        "{}:::{}:::num_qa_subs_{}",
        public_key_hex, last_8_chars, number_of_subscriptions
    );

    // Hash the concatenated string
    let mut hasher = Hasher::new();
    hasher.update(concatenated.as_bytes());
    let final_hash_result = hasher.finalize();
    let final_hash_bytes = final_hash_result.as_bytes();

    // Sign the final hash
    let signature = secret_key.sign(final_hash_bytes);

    // Return the signature as a hexadecimal string and the concatenated string
    Ok((hex::encode(signature.to_bytes()), concatenated))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_desktop_installation_proof() {
        let node_signature = "test_node_signature".to_string();
        let result = generate_desktop_installation_proof(node_signature);
        assert!(result.is_ok());
        let expected_signature = "b883c2011a65754cb8a53aa7880f2cab36d907361903b5a473eb16ed44567f11cd79fb8f521b6838e13e00d93795ef9068d03bdb2612f93a85bf7200a8edd901";
        let expected_concatenated =
            "c069738b90a4a0f136c08097cc9dcd9eeaf6b2a9c491f82b0706c8e3c0820b0f:::365feac9";
        let (signature, concatenated) = result.unwrap();
        assert_eq!(signature, expected_signature);
        assert_eq!(concatenated, expected_concatenated);
    }

    #[test]
    fn test_generate_subscription_proof() {
        let node_signature = "test_node_signature".to_string();
        let number_of_subscriptions = 5;
        let result = generate_subscription_proof(node_signature, number_of_subscriptions);
        assert!(result.is_ok());
        let expected_signature = "03113b1c094f96133a75bacb2e4579aafc26cf46820d3ccffc98b04e9ccc1f92e78351c112df9b8026be0b894b461376c24df3d43c23afe98c80eaddcb671208";
        let expected_concatenated = "c069738b90a4a0f136c08097cc9dcd9eeaf6b2a9c491f82b0706c8e3c0820b0f:::365feac9:::num_subs_5";
        let (signature, concatenated) = result.unwrap();
        assert_eq!(signature, expected_signature);
        assert_eq!(concatenated, expected_concatenated);
    }

    #[test]
    fn test_generate_qa_subscription_proof() {
        let node_signature = "test_node_signature".to_string();
        let number_of_subscriptions = 5;
        let result = generate_qa_subscription_proof(node_signature, number_of_subscriptions);
        assert!(result.is_ok());
        let expected_signature = "8f3e2856bf21c4e78fa62b6b63b08bbb8a6678c017b60ca0f857c70b0ca401717112cb3ae30a1dc34f907f2cf74b9721de4b370917789d8083155c34312dbc0d";
        let expected_concatenated = "c069738b90a4a0f136c08097cc9dcd9eeaf6b2a9c491f82b0706c8e3c0820b0f:::365feac9:::num_qa_subs_5";
        let (signature, concatenated) = result.unwrap();
        assert_eq!(signature, expected_signature);
        assert_eq!(concatenated, expected_concatenated);
    }
}
