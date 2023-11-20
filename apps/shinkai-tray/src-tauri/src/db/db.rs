use std::path::Path;

use rocksdb::{
    AsColumnFamilyRef, ColumnFamily, ColumnFamilyDescriptor, DBCommon, DBIteratorWithThreadMode, Error, IteratorMode,
    Options, SingleThreaded, WriteBatch, DB,
};

use crate::models::setup_data::SetupData;

pub enum Topic {
    SetupData,
}

impl Topic {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::SetupData => "setup_data",
        }
    }
}

pub struct TrayDB {
    pub db: DB,
    pub path: String,
}

impl TrayDB {
    pub fn new(db_path: &str) -> Result<Self, Error> {
        let mut db_opts = Options::default();
        db_opts.create_if_missing(true);
        db_opts.create_missing_column_families(true);
        // if we want to enable compression
        // db_opts.set_compression_type(DBCompressionType::Lz4);

        let cf_names = if Path::new(db_path).exists() {
            // If the database file exists, get the list of column families from the database
            DB::list_cf(&db_opts, db_path)?
        } else {
            // If the database file does not exist, use the default list of column families
            vec![
                Topic::SetupData.as_str().to_string(),
            ]
        };

        let mut cfs = vec![];
        for cf_name in &cf_names {
            let mut cf_opts = Options::default();
            cf_opts.create_if_missing(true);
            cf_opts.create_missing_column_families(true);

            let cf_desc = ColumnFamilyDescriptor::new(cf_name.to_string(), cf_opts);
            cfs.push(cf_desc);
        }

        let db = DB::open_cf_descriptors(&db_opts, db_path, cfs)?;

        Ok(TrayDB {
            db,
            path: db_path.to_string(),
        })
    }
}
