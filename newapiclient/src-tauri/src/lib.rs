mod api;
mod auth;
mod commands;

use std::sync::Mutex;
use commands::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            api_client: Mutex::new(None),
            credentials: Mutex::new(None),
            base_url: Mutex::new(String::new()),
        })
        .invoke_handler(tauri::generate_handler![
            // 认证相关
            commands::auth::login,
            commands::auth::logout,
            commands::auth::check_auth,
            commands::auth::get_current_user,
            // 用户管理
            commands::user::get_users,
            commands::user::search_users,
            commands::user::create_user,
            commands::user::update_user,
            commands::user::delete_user,
            commands::user::manage_user_quota,
            // 兑换码管理
            commands::redemption::get_redemptions,
            commands::redemption::create_redemptions,
            commands::redemption::clean_invalid_redemptions,
            commands::redemption::delete_redemption,
            // Dashboard
            commands::dashboard::get_system_status,
            commands::dashboard::get_dashboard_stats,
            commands::dashboard::get_quota_data,
            commands::dashboard::get_log_stats,
            // Token
            commands::token::get_tokens,
            commands::token::search_tokens,
            commands::token::create_token,
            commands::token::update_token,
            commands::token::delete_token,
            commands::token::get_token_key,
            commands::token::delete_tokens_batch,
            // Settings
            commands::settings::get_system_options,
            commands::settings::update_system_option,
            commands::settings::get_performance_stats,
            commands::settings::clear_disk_cache,
            commands::settings::force_gc,
            commands::settings::get_log_files,
            commands::settings::cleanup_log_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
