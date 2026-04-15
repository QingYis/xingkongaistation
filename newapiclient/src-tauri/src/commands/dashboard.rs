use tauri::State;
use crate::commands::auth::{get_authenticated_client, AppState};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStatus {
    pub version: String,
    pub start_time: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardStats {
    pub user_count: i32,
    pub channel_count: i32,
    pub token_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotaDataPoint {
    pub date: String,
    pub quota: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogStats {
    pub total_count: i32,
    pub total_quota: i64,
    pub today_count: i32,
    pub today_quota: i64,
}

#[tauri::command]
pub async fn get_system_status(
    state: State<'_, AppState>,
) -> Result<SystemStatus, String> {
    let client = get_authenticated_client(&state)?;

    let response = client.get::<serde_json::Value>("/api/status")
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to get system status".to_string()));
    }

    let data = response.data.ok_or("No data in response")?;

    Ok(SystemStatus {
        version: data.get("version")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown")
            .to_string(),
        start_time: data.get("start_time")
            .and_then(|v| v.as_i64())
            .unwrap_or(0),
    })
}

#[tauri::command]
pub async fn get_dashboard_stats(
    state: State<'_, AppState>,
) -> Result<DashboardStats, String> {
    let client = get_authenticated_client(&state)?;

    // Get user count
    let users_response = client.get::<serde_json::Value>("/api/user/?page=1&page_size=1")
        .await
        .map_err(|e| e.to_string())?;

    let user_count = if users_response.success {
        users_response.data
            .and_then(|d| d.get("total").and_then(|t| t.as_i64()))
            .unwrap_or(0) as i32
    } else {
        0
    };

    // Get channel count
    let channels_response = client.get::<serde_json::Value>("/api/channel/?page=1&page_size=1")
        .await
        .map_err(|e| e.to_string())?;

    let channel_count = if channels_response.success {
        channels_response.data
            .and_then(|d| d.get("total").and_then(|t| t.as_i64()))
            .unwrap_or(0) as i32
    } else {
        0
    };

    // Get token count
    let tokens_response = client.get::<serde_json::Value>("/api/token/?page=1&page_size=1")
        .await
        .map_err(|e| e.to_string())?;

    let token_count = if tokens_response.success {
        tokens_response.data
            .and_then(|d| d.get("total").and_then(|t| t.as_i64()))
            .unwrap_or(0) as i32
    } else {
        0
    };

    Ok(DashboardStats {
        user_count,
        channel_count,
        token_count,
    })
}

#[tauri::command]
pub async fn get_quota_data(
    start_timestamp: i64,
    end_timestamp: i64,
    state: State<'_, AppState>,
) -> Result<Vec<QuotaDataPoint>, String> {
    let client = get_authenticated_client(&state)?;

    let endpoint = format!("/api/data/?start_timestamp={}&end_timestamp={}", start_timestamp, end_timestamp);
    let response = client.get::<Vec<QuotaDataPoint>>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to get quota data".to_string()));
    }

    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn get_log_stats(
    start_timestamp: i64,
    end_timestamp: i64,
    state: State<'_, AppState>,
) -> Result<LogStats, String> {
    let client = get_authenticated_client(&state)?;

    let endpoint = format!("/api/log/stat?start_timestamp={}&end_timestamp={}", start_timestamp, end_timestamp);
    let response = client.get::<serde_json::Value>(&endpoint)
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to get log stats".to_string()));
    }

    let data = response.data.ok_or("No data in response")?;

    Ok(LogStats {
        total_count: 0, // API doesn't return count, only quota/rpm/tpm
        total_quota: data.get("quota")
            .and_then(|v| v.as_i64())
            .unwrap_or(0),
        today_count: 0,
        today_quota: data.get("quota")
            .and_then(|v| v.as_i64())
            .unwrap_or(0),
    })
}
