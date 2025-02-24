// This is a placeholder GGUF model for testing purposes
// In a real application, this should be replaced with a proper GGUF model file
// Here goes the arctic model

const PLACEHOLDER_GGUF: &[u8] = &[
    0x47, 0x47, 0x55, 0x46, // GGUF magic
    0x00, 0x00, 0x00, 0x01, // Version 1
    0x00, 0x00, 0x00, 0x00, // No metadata
    0x00, 0x00, 0x00, 0x10, // 16 bytes of data
    // Some placeholder tensor data
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
];

pub const MODEL_NAME: &str = "snowflake-arctic-embed:xs";

pub fn get_model_data() -> &'static [u8] {
    PLACEHOLDER_GGUF
}

pub fn get_model_name() -> &'static str {
    MODEL_NAME
}
