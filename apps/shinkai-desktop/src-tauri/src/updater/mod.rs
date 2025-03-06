use log::info;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_updater::{Update, Updater, UpdaterExt};
use tokio::sync::RwLock;

use crate::globals::SHINKAI_NODE_MANAGER_INSTANCE;

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMetadata {
    version: String,
    current_version: String,
}

#[derive(Clone, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DownloadUpdateState {
    chunk_length: usize,
    content_length: u64,
    last_chunk_length: u64,
    accumulated_length: u64,
    download_progress_percent: f64,
}

#[derive(Serialize, Clone, Debug)]
#[serde(
    tag = "event",
    content = "data",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum UpdateManagerState {
    NoUpdateAvailable,
    Available { update_metadata: UpdateMetadata },
    Downloading { download_state: DownloadUpdateState },
    ReadyToInstall { update_bytes: Vec<u8> },
    Installing { update_bytes: Vec<u8> },
    RestartPending {},
}

pub struct UpdateManagerStateAppState(RwLock<UpdateManagerState>);
pub struct UpdateAppState(RwLock<Option<Update>>);

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Updater(#[from] tauri_plugin_updater::Error),
    #[error("there is no pending update")]
    NoPendingUpdate,
    #[error("update is not ready to install")]
    UpdateNotReadyToInstall,
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

type Result<T> = std::result::Result<T, Error>;

pub fn get_updater(app_handle: &AppHandle) -> Result<Updater> {
    info!("getting updater");
    let app_handle_clone = app_handle.clone();
    let updater = app_handle.updater_builder().on_before_exit(move || {
        tauri::async_runtime::block_on(async {
            SHINKAI_NODE_MANAGER_INSTANCE
                .get()
                .unwrap()
                .write()
                .await
                .kill()
                .await;
        });
        app_handle_clone.cleanup_before_exit();
    });
    Ok(updater.build()?)
}

async fn set_update_manager_state(
    app_handle: &AppHandle,
    new_update_manager_state: UpdateManagerState,
) {
    let update_manager_app_state = app_handle
        .try_state::<UpdateManagerStateAppState>()
        .unwrap();
    let mut update_manager_state_write_guard = update_manager_app_state.0.write().await;
    *update_manager_state_write_guard = new_update_manager_state;
    app_handle
        .emit(
            "update-manager-state-changed",
            update_manager_state_write_guard.clone(),
        )
        .unwrap();
    drop(update_manager_state_write_guard);
}

#[tauri::command]
pub async fn fetch_update(
    app: AppHandle,
    pending_update: State<'_, UpdateAppState>,
    update_manager_state: State<'_, UpdateManagerStateAppState>,
) -> Result<UpdateManagerState> {
    info!("fetching update");

    {
        let update_manager_state_guard = update_manager_state.0.read().await;
        if !matches!(
            *update_manager_state_guard,
            UpdateManagerState::NoUpdateAvailable
        ) {
            info!("update already in progress, skipping fetch...");
            return Ok(update_manager_state_guard.clone());
        }
    }

    let update = get_updater(&app)?.check().await?;
    match update {
        Some(update) => {
            info!("update available: {}", update.version);
            let update_metadata = UpdateMetadata {
                version: update.version.clone(),
                current_version: update.current_version.clone(),
            };
            set_update_manager_state(
                &app,
                UpdateManagerState::Available {
                    update_metadata: update_metadata.clone(),
                },
            )
            .await;
            let mut pending_update_guard = pending_update.0.write().await;
            *pending_update_guard = Some(update);
        }
        None => {
            info!("no update available");
            set_update_manager_state(&app, UpdateManagerState::NoUpdateAvailable).await;
        }
    }
    let update_manager_state_guard = update_manager_state.0.read().await;
    Ok(update_manager_state_guard.clone())
}

#[tauri::command]
pub async fn download_update(
    app: AppHandle,
    pending_update_app_state: State<'_, UpdateAppState>,
    update_manager_state_app_state: State<'_, UpdateManagerStateAppState>,
) -> Result<UpdateManagerState> {
    info!("starting update download");

    {
        let update_manager_state_read_guard = update_manager_state_app_state.0.read().await;
        if matches!(
            *update_manager_state_read_guard,
            UpdateManagerState::NoUpdateAvailable
        ) {
            info!("no pending update to download");
            return Err(Error::NoPendingUpdate);
        }
    }

    {
        let pending_update_app_state = pending_update_app_state.clone();
        let pending_update_guard = pending_update_app_state.0.read().await;
        if pending_update_guard.is_none() {
            info!("no pending update found");
            return Err(Error::NoPendingUpdate);
        }
    }

    info!("initializing download state");
    let app_clone = app.clone();
    let download_state = DownloadUpdateState {
        chunk_length: 0,
        content_length: 0,
        last_chunk_length: 0,
        accumulated_length: 0,
        download_progress_percent: 0.0,
    };
    set_update_manager_state(
        &app_clone,
        UpdateManagerState::Downloading {
            download_state: download_state.clone(),
        },
    )
    .await;

    let app_clone = app.clone();

    let mut pending_update_guard = pending_update_app_state.0.write().await;
    let Some(update) = pending_update_guard.take() else {
        info!("no pending update found");
        return Err(Error::NoPendingUpdate);
    };

    let update_manager_state_read_guard = update_manager_state_app_state.0.read().await;
    let mut download_state = match update_manager_state_read_guard.clone() {
        UpdateManagerState::Downloading { download_state, .. } => download_state,
        _ => {
            log::info!("no download state found {:?}", download_state.clone());
            return Err(Error::NoPendingUpdate);
        }
    };
    drop(update_manager_state_read_guard);
    let update_bytes = update
        .download(
            move |chunk_length, content_length| {
                let content_length = content_length.unwrap_or(download_state.content_length);

                let accumulated_length = download_state.accumulated_length + chunk_length as u64;

                let download_progress =
                    (accumulated_length as f64 / content_length as f64 * 100.0).round() as u32;

                let updated_download_state = DownloadUpdateState {
                    chunk_length,
                    content_length,
                    last_chunk_length: chunk_length as u64,
                    accumulated_length: accumulated_length as u64,
                    download_progress_percent: download_progress as f64,
                };

                let new_update_manager_state = UpdateManagerState::Downloading {
                    download_state: updated_download_state.clone(),
                };
                let _ = set_update_manager_state(&app_clone, new_update_manager_state.clone());

                // Return early if progress hasn't changed
                if download_state.download_progress_percent
                    != updated_download_state.download_progress_percent
                {
                    log::info!("emitting update-manager-state-changed");
                    app_clone
                        .emit("update-manager-state-changed", new_update_manager_state)
                        .unwrap();
                    log::info!("emitted update-manager-state-changed");
                }
                download_state = updated_download_state;
            },
            move || {},
        )
        .await;

    if let Ok(update_bytes) = update_bytes {
        info!("download completed successfully");
        set_update_manager_state(&app, UpdateManagerState::ReadyToInstall { update_bytes }).await;
    } else {
        info!("download failed");
        let update_metadata = UpdateMetadata {
            version: update.version.clone(),
            current_version: update.current_version.clone(),
        };
        set_update_manager_state(&app, UpdateManagerState::Available { update_metadata }).await;
        return Err(Error::Updater(update_bytes.unwrap_err()));
    }
    log::info!("finished download");
    let update_manager_state_guard = update_manager_state_app_state.0.read().await;
    Ok(update_manager_state_guard.clone())
}

#[tauri::command]
pub async fn install_update(
    app: AppHandle,
    pending_update: State<'_, UpdateAppState>,
    update_manager_state: State<'_, UpdateManagerStateAppState>,
) -> Result<UpdateManagerState> {
    info!("installing update");
    let Some(update) = pending_update.0.write().await.take() else {
        info!("no update ready to install");
        return Err(Error::UpdateNotReadyToInstall);
    };

    let update_manager_state_read_guard = update_manager_state.0.read().await;
    let update_bytes = match update_manager_state_read_guard.clone() {
        UpdateManagerState::ReadyToInstall { update_bytes } => update_bytes,
        _ => {
            info!("update not in ready state");
            return Err(Error::UpdateNotReadyToInstall);
        }
    };
    let app_clone = app.clone();
    set_update_manager_state(
        &app_clone,
        UpdateManagerState::Installing {
            update_bytes: update_bytes.clone(),
        },
    )
    .await;

    let install_result = update.install(update_bytes.clone());
    if let Err(e) = install_result {
        info!("installation failed");
        set_update_manager_state(&app, UpdateManagerState::ReadyToInstall { update_bytes }).await;
        return Err(Error::Updater(e));
    }

    info!("installation successful, restart pending");
    set_update_manager_state(&app, UpdateManagerState::RestartPending {}).await;
    let update_manager_state_guard = update_manager_state.0.read().await;
    Ok(update_manager_state_guard.clone())
}

// Kill the shinkai node to avoid conflicts
// On Windows, when install the update, the app will restart automatically and there is an event to kill the node from the rust side
#[tauri::command]
pub async fn restart_to_apply_update(app: AppHandle) {
    info!("restarting to apply update");
    SHINKAI_NODE_MANAGER_INSTANCE
        .get()
        .unwrap()
        .write()
        .await
        .kill()
        .await;

    app.restart();
}

#[tauri::command]
pub async fn get_update_manager_state(
    update_manager_state: State<'_, UpdateManagerStateAppState>,
) -> Result<UpdateManagerState> {
    let update_manager_state = update_manager_state.0.read().await;
    Ok(update_manager_state.clone())
}

pub fn initialize_update_manager(app_handle: AppHandle, poll_updates_every_secs: u64) {
    app_handle.manage(UpdateManagerStateAppState(RwLock::new(
        UpdateManagerState::NoUpdateAvailable,
    )));
    app_handle.manage(UpdateAppState(RwLock::new(None)));
    poll_for_updates(app_handle, poll_updates_every_secs);
}

pub fn poll_for_updates(app_handle: AppHandle, poll_every_secs: u64) {
    tauri::async_runtime::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(poll_every_secs));
        loop {
            interval.tick().await;
            info!("polling for updates");
            let _ = fetch_update(
                app_handle.clone(),
                app_handle.try_state::<UpdateAppState>().unwrap(),
                app_handle
                    .try_state::<UpdateManagerStateAppState>()
                    .unwrap(),
            )
            .await;
        }
    });
}
