use tauri::State;
use serde::{Deserialize, Serialize};
use crate::commands::auth::AppState;
use crate::api::types::{User, CreateUserRequest, PageInfo};

#[tauri::command]
pub async fn get_users(
    page: i32,
    page_size: i32,
    state: State<'_, AppState>,
) -> Result<PageInfo<User>, String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let endpoint = format!("/api/user/?page={}&page_size={}", page, page_size);
    let response = client.get::<PageInfo<User>>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;
    
    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn search_users(
    keyword: String,
    page: i32,
    page_size: i32,
    state: State<'_, AppState>,
) -> Result<PageInfo<User>, String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let endpoint = format!(
        "/api/user/search?keyword={}&page={}&page_size={}",
        keyword, page, page_size
    );
    let response = client.get::<PageInfo<User>>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;
    
    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn create_user(
    request: CreateUserRequest,
    state: State<'_, AppState>,
) -> Result<User, String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let response = client.post::<CreateUserRequest, User>("/api/user/", &request)
        .await
        .map_err(|e| e.to_string())?;
    
    if !response.success {
        return Err(response.message.unwrap_or("Failed to create user".to_string()));
    }
    
    response.data.ok_or("No data in response".to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub id: i32,
    pub username: Option<String>,
    pub role: Option<i32>,
    pub status: Option<i32>,
    pub quota: Option<i64>,
}

#[tauri::command]
pub async fn update_user(
    request: UpdateUserRequest,
    state: State<'_, AppState>,
) -> Result<User, String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let response = client.put::<UpdateUserRequest, User>("/api/user/", &request)
        .await
        .map_err(|e| e.to_string())?;
    
    if !response.success {
        return Err(response.message.unwrap_or("Failed to update user".to_string()));
    }
    
    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn delete_user(
    user_id: i32,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let endpoint = format!("/api/user/{}", user_id);
    let response = client.delete::<serde_json::Value>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;
    
    if !response.success {
        return Err(response.message.unwrap_or("Failed to delete user".to_string()));
    }
    
    Ok(())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ManageUserRequest {
    pub id: i32,
    pub action: String, // "increase" or "decrease"
    pub quota: i64,
}

#[tauri::command]
pub async fn manage_user_quota(
    request: ManageUserRequest,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let response = client.post::<ManageUserRequest, serde_json::Value>("/api/user/manage", &request)
        .await
        .map_err(|e| e.to_string())?;
    
    if !response.success {
        return Err(response.message.unwrap_or("Failed to manage user quota".to_string()));
    }
    
    Ok(())
}
