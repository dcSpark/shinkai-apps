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

pub fn generate_proof(
  node_signature: String,
  payload: String,
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

  // Concatenate the public key hex with the last 4 characters and JSON string using :::
  let concatenated = format!(
      "{}:::{}:::{}",
      public_key_hex, last_8_chars, base64::encode(payload.as_bytes())
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
    fn test_generate_proof() {
        let node_signature = "test_node_signature".to_string();
        let json_string = r#"{"number_of_qa_subscriptions":3, "number_of_subscriptions":5}"#.to_string();
        let result = generate_proof(node_signature, json_string);
        assert!(result.is_ok());
        let expected_signature = "5d59de6abc995c26e95cd88cb78983200e7ef0984761eeae2fad311e500adfcdf95c15b11e55b673052269a3b46e075a760a8a952521dd36057574f55f7e8d0f";
        let expected_concatenated = r#"c069738b90a4a0f136c08097cc9dcd9eeaf6b2a9c491f82b0706c8e3c0820b0f:::365feac9:::{"number_of_qa_subscriptions":3, "number_of_subscriptions":5}"#;
        let (signature, concatenated) = result.unwrap();
        assert_eq!(signature, expected_signature);
        assert_eq!(concatenated, expected_concatenated);
    }
}
