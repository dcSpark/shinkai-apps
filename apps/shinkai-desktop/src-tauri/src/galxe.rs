use blake3::Hasher;
use ed25519_dalek::{Signer, SigningKey, VerifyingKey};

pub fn unsafe_deterministic_signature_keypair(n: u32) -> (SigningKey, VerifyingKey) {
  let mut hasher = blake3::Hasher::new();
  hasher.update(&n.to_le_bytes());
  let hash = hasher.finalize();

  let secret_key = SigningKey::from_bytes(hash.as_bytes());
  let public_key = VerifyingKey::from(&secret_key);
  (secret_key, public_key)
}

pub fn generate_desktop_installation_proof() -> Result<(String, String), String> {
    let secret_desktop_key: &str = option_env!("SECRET_DESKTOP_INSTALLATION_PROOF_KEY").unwrap_or("Dc9{3R9JmXe7£w9Fs](7");
    let (secret_key, public_key) = unsafe_deterministic_signature_keypair(42);
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
