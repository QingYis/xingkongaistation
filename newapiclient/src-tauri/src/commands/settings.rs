use tauri::State;
use crate::commands::auth::{get_authenticated_client, AppState};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemOption {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceStats {
    pub cpu_usage: f64,
    pub memory_usage: f64,
    pub disk_usage: f64,
    pub goroutines: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogFile {
    pub name: String,
    pub size: i64,
    pub modified_time: i64,
}

#[tauri::command]
pub async fn get_system_options(
    state: State<'_, AppState>,
) -> Result<Vec<SystemOption>, String> {
    let client = get_authenticated_client(&state)?;

    let response = client.get::<Vec<SystemOption>>("/api/option/")
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to get system options".to_string()));
    }

    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn update_system_option(
    key: String,
    value: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = get_authenticated_client(&state)?;

    let response = client.put::<serde_json::Value, serde_json::Value>(
        "/api/option/",
        &serde_json::json!({ "key": key, "value": value })
    )
    .await
    .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to update system option".to_string()));
    }

    Ok(())
}

#[tauri::command]
pub async fn get_performance_stats(
    state: State<'_, AppState>,
) -> Result<PerformanceStats, String> {
    let client = get_authenticated_client(&state)?;

    let response = client.get::<serde_json::Value>("/api/performance/stats")
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to get performance stats".to_string()));
    }

    let data = response.data.ok_or("No data in response")?;

    Ok(PerformanceStats {
        cpu_usage: data.get("cpu_usage")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0),
        memory_usage: data.get("memory_usage")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0),
        disk_usage: data.get("disk_usage")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0),
        goroutines: data.get("goroutines")
            .and_then(|v| v.as_i64())
            .unwrap_or(0) as i32,
    })
}

#[tauri::command]
pub async fn clear_disk_cache(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = get_authenticated_client(&state)?;

    let response = client.delete::<serde_json::Value>("/api/performance/disk_cache")
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to clear disk cache".to_string()));
    }

    Ok(())
}

#[tauri::command]
pub async fn force_gc(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = get_authenticated_client(&state)?;

    let response = client.post::<serde_json::Value, serde_json::Value>(
        "/api/performance/gc",
        &serde_json::json!({})
    )
    .await
    .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to force GC".to_string()));
    }

    Ok(())
}

#[tauri::command]
pub async fn get_log_files(
    state: State<'_, AppState>,
) -> Result<Vec<LogFile>, String> {
    let client = get_authenticated_client(&state)?;

    let response = client.get::<Vec<LogFile>>("/api/performance/logs")
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to get log files".to_string()));
    }

    response.data.ok_or("No data in response".to_string())
}

#[tauri::command]
pub async fn cleanup_log_files(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let client = get_authenticated_client(&state)?;

    let response = client.delete::<serde_json::Value>("/api/performance/logs")
        .await
        .map_err(|e| e.to_string())?;

    if !response.success {
        return Err(response.message.unwrap_or("Failed to cleanup log files".to_string()));
    }

    Ok(())
}
