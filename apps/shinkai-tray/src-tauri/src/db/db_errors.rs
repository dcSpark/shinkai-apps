use std::fmt;
use std::io;
use serde_json::Error as SerdeError;
use rocksdb::Error as RocksDBError;

#[derive(Debug)]
pub enum TrayDBError {
    RocksDBError(RocksDBError),
    IOError(io::Error),
    JsonSerializationError(SerdeError),
    DataNotFound,
    InvalidKey,
}

impl fmt::Display for TrayDBError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            TrayDBError::RocksDBError(e) => write!(f, "RocksDB error: {}", e),
            TrayDBError::IOError(e) => write!(f, "IO Error: {}", e),
            TrayDBError::JsonSerializationError(e) => write!(f, "Json Serialization Error: {}", e),
            TrayDBError::DataNotFound => write!(f, "Data not found"),
            TrayDBError::InvalidKey => write!(f, "Invalid key"),
        }
    }
}

impl std::error::Error for TrayDBError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            TrayDBError::RocksDBError(e) => Some(e),
            TrayDBError::IOError(e) => Some(e),
            TrayDBError::JsonSerializationError(e) => Some(e),
            _ => None,
        }
    }
}

impl From<RocksDBError> for TrayDBError {
    fn from(error: RocksDBError) -> Self {
        TrayDBError::RocksDBError(error)
    }
}

impl From<io::Error> for TrayDBError {
    fn from(error: io::Error) -> Self {
        TrayDBError::IOError(error)
    }
}

impl From<SerdeError> for TrayDBError {
    fn from(error: SerdeError) -> Self {
        TrayDBError::JsonSerializationError(error)
    }
}