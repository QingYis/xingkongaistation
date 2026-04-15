use tauri::State;
use crate::commands::auth::{get_authenticated_client, AppState};
use crate::api::types::{Token, PageInfo};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTokenRequest {
    pub name: String,
    pub remain_quota: i64,
    pub expired_time: i64,
    pub unlimited_quota: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTokenRequest {
    pub id: i32,
    pub name: Option<String>,
    pub status: Option<i32>,
    pub remain_quota: Option<i64>,
    pub expired_time: Option<i64>,
    pub unlimited_quota: Option<bool>,
}

#[tauri::command]
pub async fn get_tokens(
    page: i32,
    page_size: i32,
    state: State<'_, AppState>,
) -> Result<PageInfo<Token>, String> {
    let client = get_authenticated_client(&state)?;

    let endpoint = format!("/api/token/?page={}&page_size={}", page, page_size);
    let response = client.get::<PageInfo<Token>>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;

    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn search_tokens(
    keyword: String,
    page: i32,
    page_size: i32,
    state: State<'_, AppState>,
) -> Result<PageInfo<Token>, String> {
    let client = get_authenticated_client(&state)?;

    let endpoint = format!("/api/token/search?keyword={}&page={}&page_size={}", keyword, page, page_size);
    let response = client.get::<PageInfo<Token>>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;

    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn create_token(
    request: CreateTokenRequest,
    state: State<'_, AppState>,
) -> Result<Token, String> {
    let client = get_authenticated_client(&state)?;

    let response = client.post::<CreateTokenRequest, Token>(
        "/api/token/",
        &request
    )
    .await
    .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to create token".to_string()));
    }

    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn update_token(
    request: UpdateTokenRequest,
    state: State<'_, AppState>,
) -> Result<Token, String> {
    let client = get_authenticated_client(&state)?;

    let response = client.put::<UpdateTokenRequest, Token>(
        "/api/token/",
        &request
    )
    .await
    .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to update token".to_string()));
    }

    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn delete_token(
    token_id: i32,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = get_authenticated_client(&state)?;

    let endpoint = format!("/api/token/{}", token_id);
    let response = client.delete::<serde_json::Value>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to delete token".to_string()));
    }

    Ok(())
}

#[tauri::command]
pub async fn get_token_key(
    token_id: i32,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let client = get_authenticated_client(&state)?;

    let endpoint = format!("/api/token/{}/key", token_id);
    let response = client.post::<serde_json::Value, String>(
        &endpoint,
        &serde_json::json!({})
    )
    .await
    .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to get token key".to_string()));
    }

    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn delete_tokens_batch(
    token_ids: Vec<i32>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = get_authenticated_client(&state)?;

    let response = client.post::<serde_json::Value, serde_json::Value>(
        "/api/token/batch",
        &serde_json::json!({ "ids": token_ids })
    )
    .await
    .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to delete tokens".to_string()));
    }

    Ok(())
}
