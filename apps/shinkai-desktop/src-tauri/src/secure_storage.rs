use security_framework::base::Error;
use security_framework::os::macos::keychain::SecKeychain;

#[cfg(target_os = "macos")]
pub fn store_secure_info(key: &str, value: &str) -> Result<(), Error> {
    let keychain = SecKeychain::default()?;
    keychain.add_generic_password("com.shinkai.desktop.local", key, value.as_bytes())?;
    Ok(())
}

#[cfg(target_os = "macos")]
pub fn retrieve_secure_info(key: &str) -> Result<String, Error> {
    let keychain = SecKeychain::default()?;
    let (password, _) = keychain.find_generic_password("com.shinkai.desktop.local", key)?;
    Ok(String::from_utf8(password.to_vec()).unwrap())
}

// Add similar functions for other OSes here
// #[cfg(target_os = "windows")]
// pub fn store_secure_info(key: &str, value: &str) -> Result<(), Error> {
//     // Windows-specific implementation
// }

// #[cfg(target_os = "windows")]
// pub fn retrieve_secure_info(key: &str) -> Result<String, Error> {
//     // Windows-specific implementation
// }

pub fn store_info(key: &str, value: &str) -> Result<(), Error> {
    #[cfg(target_os = "macos")]
    {
        store_secure_info(key, value)
    }
    // Add other OS-specific calls here
    // #[cfg(target_os = "windows")]
    // {
    //     store_secure_info(key, value)
    // }
}

pub fn retrieve_info(key: &str) -> Result<String, Error> {
    #[cfg(target_os = "macos")]
    {
        retrieve_secure_info(key)
    }
    // Add other OS-specific calls here
    // #[cfg(target_os = "windows")]
    // {
    //     retrieve_secure_info(key)
    // }
}

// Alternative: asking the user for any password like a normal crypto wallet
// Probably this approach is better and easier across all platforms
