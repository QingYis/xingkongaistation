use tauri::State;
use crate::commands::auth::AppState;
use crate::api::types::{Redemption, CreateRedemptionRequest, PageInfo};

#[tauri::command]
pub async fn get_redemptions(
    page: i32,
    page_size: i32,
    state: State<'_, AppState>,
) -> Result<PageInfo<Redemption>, String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let endpoint = format!("/api/redemption/?page={}&page_size={}", page, page_size);
    let response = client.get::<PageInfo<Redemption>>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;
    
    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn create_redemptions(
    request: CreateRedemptionRequest,
    state: State<'_, AppState>,
) -> Result<Vec<String>, String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let response = client.post::<CreateRedemptionRequest, Vec<String>>(
        "/api/redemption/",
        &request
    )
    .await
    .map_err(|e| e.to_string())?;
    
    if !response.success {
        return Err(response.message.unwrap_or("Failed to create redemptions".to_string()));
    }
    
    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn clean_invalid_redemptions(
    state: State<'_, AppState>,
) -> Result<i32, String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let response = client.delete::<i32>("/api/redemption/invalid")
        .await
        .map_err(|e| e.to_string())?;
    
    if !response.success {
        return Err(response.message.unwrap_or("Failed to clean redemptions".to_string()));
    }
    
    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn delete_redemption(
    redemption_id: i32,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = state.api_client.lock().unwrap();
    let client = client.as_ref()
        .ok_or("Not authenticated")?;
    
    let endpoint = format!("/api/redemption/{}", redemption_id);
    let response = client.delete::<serde_json::Value>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;
    
    if !response.success {
        return Err(response.message.unwrap_or("Failed to delete redemption".to_string()));
    }
    
    Ok(())
}
