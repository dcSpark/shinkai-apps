use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::{path, thread};

use std::fs::{self, DirEntry};
use std::path::{Path, PathBuf};

#[derive(Clone, Debug)]
pub struct SyncingFolder {
    pub profile_name: String,
    pub vector_fs_path: String,
    pub local_os_folder_path: String,
    pub last_synchronized_file_datetime: String, // UTC with milliseconds
}

// for simplicity we don't use this wrapper right now
pub struct LocalOSFolderPath(String);

pub trait DirectoryVisitor {
    fn visit_dirs(&self, dir: &Path) -> std::io::Result<()>;
}

impl DirectoryVisitor for FilesystemSynchronizer {
    fn visit_dirs(&self, dir: &Path) -> std::io::Result<()> {
        if dir.is_dir() {
            for entry in fs::read_dir(dir)? {
                let entry = entry?;
                let path = entry.path();

                if path.is_dir() {
                    println!("Directory: {:?}", path);
                    // check if directory already exists in specific place on the Node
                    // if it does, proceed
                    // if it doesn't create it

                    // TODO: edge case to be handled differently: if the folder on the disk was moved or deleted, but it is found in specific place on the node vector_fs, remove the whole directory on the vector_fs

                    self.visit_dirs(&path)?;
                } else {
                    // check all the files inside the directory - one by one
                    // if the file is not found in the specific place on the node vector_fs, save it there

                    // if the file is found in the specific place on the node vector_fs, check if it is up to date
                    // if it is up to date, do nothing
                    // if it is not up to date, save the new one (it will be overwritten)

                    // because we're doing recursive search, we just need to exit at this point in here
                }
            }
        }

        Ok(())
    }
}

#[derive(Clone, Debug)]
pub struct FilesystemSynchronizer {
    client_keypairs: Vec<String>, // Placeholder for shinkai node keypairs (TODO: adjust structure later on)
    syncing_folders: Arc<Mutex<HashMap<String, SyncingFolder>>>, // LocalOSFolderPath, SyncingFolder

    // because we're just sending content, we should only need sender here
    sender: std::sync::mpsc::Sender<String>,
}

impl FilesystemSynchronizer {
    pub fn new(
        major_directory_path: &str,
        client_keypairs: Vec<String>,
        syncing_folders: HashMap<String, SyncingFolder>,
    ) -> Self {
        let (sender, receiver) = std::sync::mpsc::channel();
        let syncing_folders = Arc::new(Mutex::new(syncing_folders));

        // TODO: read last syncing state if there was one saved in the past

        let syncing_folders_clone_for_thread = Arc::clone(&syncing_folders);
        thread::spawn(move || loop {
            // let folders = syncing_folders_clone_for_thread.lock().unwrap();
            // for (path, folder) in folders.iter() {
            //     println!("Checking if folder at path {} is out of date.", path);
            // }
            std::thread::sleep(std::time::Duration::from_secs(60));
        });

        FilesystemSynchronizer {
            client_keypairs,
            syncing_folders,
            sender,
        }
    }

    pub fn add_syncing_folder(
        &mut self,
        path: String,
        folder: SyncingFolder,
    ) -> Result<(), String> {
        let mut folders = self.syncing_folders.lock().unwrap();
        if let std::collections::hash_map::Entry::Vacant(e) = folders.entry(path) {
            e.insert(folder);
            Ok(())
        } else {
            Err("Folder already exists".to_string())
        }
    }

    pub fn get_current_syncing_folders_map(&self) -> HashMap<String, SyncingFolder> {
        let folders = self.syncing_folders.lock().unwrap();

        // TODO: save the current state of sync somewhere
        folders.clone()
    }

    pub fn stop(self) -> HashMap<String, SyncingFolder> {
        drop(self.sender); // This will close the thread
        self.syncing_folders.lock().unwrap().clone()
    }

    pub fn traverse_and_synchronize<F, D>(&self, major_directory_path: &str, visitor: &D)
    where
        D: DirectoryVisitor,
    {
        let major_directory_path = Path::new(major_directory_path);

        if major_directory_path.is_dir() {
            match visitor.visit_dirs(major_directory_path) {
                Ok(_) => println!("Traversal complete."),
                Err(e) => println!("Error during traversal: {}", e),
            }
        } else {
            println!("The provided path is not a directory.");
        }
    }
}
