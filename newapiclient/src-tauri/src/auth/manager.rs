use keyring::Entry;
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};
use crate::api::client::ApiClient;

const SERVICE_NAME: &str = "new-api-desktop";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credentials {
    pub access_token: String,
    pub user_id: i32,
    pub username: String,
    pub role: i32,
}

pub struct AuthManager {
    keyring_entry: Entry,
}

impl AuthManager {
    pub fn new(username: &str) -> Result<Self> {
        let entry = Entry::new(SERVICE_NAME, username)
            .context("Failed to create keyring entry")?;
        Ok(Self {
            keyring_entry: entry,
        })
    }
    
    pub async fn login(
        base_url: &str,
        username: &str,
        password: &str,
    ) -> Result<Credentials> {
        let client = ApiClient::new(base_url.to_string())?;
        
        // 1. 登录获取 Session
        #[derive(Serialize)]
        struct LoginRequest {
            username: String,
            password: String,
        }
        
        let login_req = LoginRequest {
            username: username.to_string(),
            password: password.to_string(),
        };
        
        let response: crate::api::client::ApiResponse<serde_json::Value> = 
            client.post("/api/user/login", &login_req).await?;
        
        if !response.success {
            anyhow::bail!("Login failed: {}", response.message.unwrap_or_default());
        }
        
        // 2. 生成 Access Token
        let token_response: crate::api::client::ApiResponse<String> = 
            client.get("/api/user/token").await?;
        
        if !token_response.success {
            anyhow::bail!("Failed to generate access token");
        }
        
        let access_token = token_response.data
            .context("No access token in response")?;
        
        // 3. 获取用户信息
        let mut auth_client = ApiClient::new(base_url.to_string())?;
        auth_client.set_credentials(access_token.clone(), 0);
        
        #[derive(Deserialize)]
        struct UserInfo {
            id: i32,
            username: String,
            role: i32,
        }
        
        let user_response: crate::api::client::ApiResponse<UserInfo> = 
            auth_client.get("/api/user/self").await?;
        
        let user_info = user_response.data
            .context("No user info in response")?;
        
        Ok(Credentials {
            access_token,
            user_id: user_info.id,
            username: user_info.username,
            role: user_info.role,
        })
    }
    
    pub fn save_credentials(&self, credentials: &Credentials) -> Result<()> {
        let json = serde_json::to_string(credentials)
            .context("Failed to serialize credentials")?;
        
        self.keyring_entry.set_password(&json)
            .context("Failed to save credentials to keyring")?;
        
        Ok(())
    }
    
    pub fn load_credentials(&self) -> Result<Option<Credentials>> {
        match self.keyring_entry.get_password() {
            Ok(json) => {
                let credentials = serde_json::from_str(&json)
                    .context("Failed to deserialize credentials")?;
                Ok(Some(credentials))
            }
            Err(keyring::Error::NoEntry) => Ok(None),
            Err(e) => Err(e).context("Failed to load credentials from keyring"),
        }
    }
    
    pub fn clear_credentials(&self) -> Result<()> {
        match self.keyring_entry.delete_password() {
            Ok(_) => Ok(()),
            Err(keyring::Error::NoEntry) => Ok(()),
            Err(e) => Err(e).context("Failed to clear credentials"),
        }
    }
}
