fn main() {
  // fix for crashing bundle dmg/app on MACOS
  println!("cargo:rustc-env=MACOSX_DEPLOYMENT_TARGET=10.13");

  // triggers tauri build
  tauri_build::build()
}
