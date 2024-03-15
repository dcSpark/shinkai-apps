use shinkai_file_synchronizer::synchronizer::FilesystemSynchronizer;

#[cfg(test)]
mod tests {
    use shinkai_file_synchronizer::synchronizer::DirectoryVisitor;

    use super::*;
    use std::{
        collections::HashMap,
        path::{Path, PathBuf},
        sync::{Arc, Mutex},
    };

    struct MockDirectoryVisitor {
        visited_files: Arc<Mutex<Vec<PathBuf>>>,
    }

    impl DirectoryVisitor for MockDirectoryVisitor {
        fn visit_dirs(&self, dir: &Path) -> std::io::Result<()> {
            let mut visited = self.visited_files.lock().unwrap();
            visited.push(dir.to_path_buf());
            Ok(())
        }
    }

    #[test]
    fn test_traverse_and_synchronize_visits_all_files() {
        use std::fs::{self, File};
        use std::io::Write;
        use std::path::Path;

        // Setup - specify the main directory structure
        let knowledge_dir = PathBuf::from("/Users/bartlomiejryba/Projects/work/dcSpark/shinkai-apps/libs/shinkai-fs-synchronizer/tests/knowledge/");

        dbg!(&knowledge_dir.to_str().unwrap());

        // Initialize the synchronizer with the main directory
        let client_keypairs = vec![];
        let syncing_folders = HashMap::new();
        let synchronizer = FilesystemSynchronizer::new(
            knowledge_dir.to_str().unwrap(),
            client_keypairs,
            syncing_folders,
        );

        // Use a shared variable to track visited files
        let visited_files = Arc::new(Mutex::new(Vec::<PathBuf>::new()));

        // Act - call the method under test with the mock
        let mock_visitor = MockDirectoryVisitor {
            visited_files: Arc::clone(&visited_files),
        };

        synchronizer.traverse_and_synchronize::<(), MockDirectoryVisitor>(
            knowledge_dir.to_str().unwrap(),
            &mock_visitor,
        );

        // Assert - check if all files were visited
        // Note: The actual number of visited files will depend on the current state of the directory
        // For the purpose of this test, we're assuming the directory structure and files are pre-set and known
        let visited = visited_files.lock().unwrap();

        dbg!(visited.len());
        // The expected count should be adjusted based on the actual directory structure
        // assert_eq!(visited.len(), <expected_number_of_files>);
        // assert!(visited.contains(&knowledge_dir.join("file1.txt")));
        // assert!(visited.contains(&knowledge_dir.join("test_1/file2.txt")));
    }
}
