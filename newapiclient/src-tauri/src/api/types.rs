use serde::{Deserialize, Serialize};

// 用户相关类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub role: i32,
    pub status: i32,
    pub quota: i64,
    pub used_quota: i64,
    pub created_time: i64,
    pub group: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub password: String,
    pub role: i32,
    pub quota: i64,
}

// 渠道相关类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Channel {
    pub id: i32,
    pub name: String,
    #[serde(rename = "type")]
    pub channel_type: i32,
    pub status: i32,
    pub models: Vec<String>,
    pub balance: f64,
    pub priority: i32,
    pub created_time: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateChannelRequest {
    pub name: String,
    #[serde(rename = "type")]
    pub channel_type: i32,
    pub key: String,
    pub models: Vec<String>,
    pub base_url: Option<String>,
}

// 模型相关类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    pub id: i32,
    pub name: String,
    pub ratio: f64,
    pub enabled: bool,
}

// 兑换码相关类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Redemption {
    pub id: i32,
    pub name: String,
    pub key: String,
    pub quota: i32,
    pub status: i32,
    pub created_time: i64,
    pub expired_time: i64,
    pub redeemed_time: i64,
    pub used_user_id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateRedemptionRequest {
    pub name: String,
    pub quota: i32,
    pub count: i32,
    pub expired_time: i64,
}

// 令牌相关类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Token {
    pub id: i32,
    pub name: String,
    pub key: String,
    pub status: i32,
    pub remain_quota: i64,
    pub unlimited_quota: bool,
    pub created_time: i64,
    pub expired_time: i64,
}

// 日志相关类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Log {
    pub id: i32,
    pub user_id: i32,
    pub username: String,
    pub model_name: String,
    pub quota: i32,
    pub created_at: i64,
    pub channel_id: i32,
}

// 系统状态类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStatus {
    pub version: String,
    pub start_time: i64,
    pub user_count: i32,
    pub channel_count: i32,
    pub token_count: i32,
}

// 分页信息
#[derive(Debug, Serialize, Deserialize)]
pub struct PageInfo<T> {
    pub items: Vec<T>,
    pub total: i32,
    pub page: i32,
    pub page_size: i32,
}
