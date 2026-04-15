use tauri::State;
use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use crate::api::client::ApiClient;
use crate::auth::{AuthManager, Credentials};

pub struct AppState {
    pub api_client: Mutex<Option<ApiClient>>,
    pub credentials: Mutex<Option<Credentials>>,
    pub base_url: Mutex<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub base_url: String,
    pub username: String,
    pub password: String,
}

#[tauri::command]
pub async fn login(
    request: LoginRequest,
    state: State<'_, AppState>,
) -> Result<Credentials, String> {
    // 执行登录
    let credentials = AuthManager::login(&request.base_url, &request.username, &request.password)
        .await
        .map_err(|e| e.to_string())?;
    
    // 保存凭证到系统密钥链
    let auth_manager = AuthManager::new(&request.username)
        .map_err(|e| e.to_string())?;
    auth_manager.save_credentials(&credentials)
        .map_err(|e| e.to_string())?;
    
    // 初始化 API 客户端
    let mut client = ApiClient::new(request.base_url.clone())
        .map_err(|e| e.to_string())?;
    client.set_credentials(
        credentials.access_token.clone(),
        credentials.user_id,
    );
    
    // 更新状态
    *state.api_client.lock().unwrap() = Some(client);
    *state.credentials.lock().unwrap() = Some(credentials.clone());
    *state.base_url.lock().unwrap() = request.base_url;
    
    Ok(credentials)
}

#[tauri::command]
pub async fn logout(
    username: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // 清除凭证
    let auth_manager = AuthManager::new(&username)
        .map_err(|e| e.to_string())?;
    auth_manager.clear_credentials()
        .map_err(|e| e.to_string())?;
    
    // 清除状态
    *state.api_client.lock().unwrap() = None;
    *state.credentials.lock().unwrap() = None;
    
    Ok(())
}

#[tauri::command]
pub async fn check_auth(
    username: String,
    base_url: String,
    state: State<'_, AppState>,
) -> Result<Option<Credentials>, String> {
    let auth_manager = AuthManager::new(&username)
        .map_err(|e| e.to_string())?;
    
    if let Some(credentials) = auth_manager.load_credentials()
        .map_err(|e| e.to_string())? {
        // 恢复 API 客户端
        let mut client = ApiClient::new(base_url.clone())
            .map_err(|e| e.to_string())?;
        client.set_credentials(
            credentials.access_token.clone(),
            credentials.user_id,
        );
        
        *state.api_client.lock().unwrap() = Some(client);
        *state.credentials.lock().unwrap() = Some(credentials.clone());
        *state.base_url.lock().unwrap() = base_url;
        
        Ok(Some(credentials))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn get_current_user(
    state: State<'_, AppState>,
) -> Result<Option<Credentials>, String> {
    let credentials = state.credentials.lock().unwrap();
    Ok(credentials.clone())
}
