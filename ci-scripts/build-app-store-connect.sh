app_path="./apps/shinkai-desktop/src-tauri/target/release/bundle/macos/Shinkai Desktop.app";

sign_app="3rd Party Mac Developer Application: dcSpark Global LTD (PKYM3LZ24S)";

sign_install="3rd Party Mac Developer Installer: dcSpark Global LTD (PKYM3LZ24S)";

build_name="./Shinkai Desktop.pkg";

profile="./embedded.provisionprofile";

cp_dir="${app_path}/Contents/";

npx nx build shinkai-desktop --config="./src-tauri/tauri.macos-app-store-connect.conf.json";
cp "${profile}" "${cp_dir}";

codesign -d -vvv -f -s "${sign_app}" --entitlements "./apps/shinkai-desktop/src-tauri/ollama-entitlements.plist" -i "com.shinkai.desktop" "${app_path}/Contents/MacOS/ollama"
codesign -d -vvv -f -s "${sign_app}" --entitlements "./apps/shinkai-desktop/src-tauri/shinkai-node-entitlements.plist" -i "com.shinkai.desktop" "${app_path}/Contents/MacOS/shinkai-node"

./main -p "apps/shinkai-desktop/src-tauri/Info.plist" "${app_path}/Contents/MacOS/ollama"
./main -p "apps/shinkai-desktop/src-tauri/Info.plist" "${app_path}/Contents/MacOS/shinkai-node"

mv "${app_path}/Contents/MacOS/ollama.patched" "${app_path}/Contents/MacOS/ollama"
mv "${app_path}/Contents/MacOS/shinkai-node.patched" "${app_path}/Contents/MacOS/shinkai-node"

codesign -d -vvv -f -s "${sign_app}" --entitlements "./apps/shinkai-desktop/src-tauri/ollama-entitlements.plist" -i "com.shinkai.desktop" "${app_path}/Contents/MacOS/ollama"
codesign -d -vvv -f -s "${sign_app}" --entitlements "./apps/shinkai-desktop/src-tauri/shinkai-node-entitlements.plist" -i "com.shinkai.desktop" "${app_path}/Contents/MacOS/shinkai-node"
codesign -d -vvv -f -s "${sign_app}" --entitlements "./apps/shinkai-desktop/src-tauri/entitlements.plist" "${app_path}/Contents/MacOS/Shinkai Desktop"
codesign -d -vvv -f -s "${sign_app}" --entitlements "./apps/shinkai-desktop/src-tauri/entitlements.plist" "${app_path}";

productbuild --sign "${sign_install}" --component "${app_path}" /Applications/ "${build_name}";
