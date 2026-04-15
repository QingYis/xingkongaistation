use reqwest::{Client, header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE}};
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};

#[derive(Debug, Clone)]
pub struct ApiClient {
    base_url: String,
    access_token: Option<String>,
    user_id: Option<i32>,
    client: Client,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
}

impl ApiClient {
    pub fn new(base_url: String) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .context("Failed to create HTTP client")?;
        
        Ok(Self {
            base_url: base_url.trim_end_matches('/').to_string(),
            access_token: None,
            user_id: None,
            client,
        })
    }
    
    pub fn set_credentials(&mut self, token: String, user_id: i32) {
        self.access_token = Some(token);
        self.user_id = Some(user_id);
    }
    
    pub fn clear_credentials(&mut self) {
        self.access_token = None;
        self.user_id = None;
    }
    
    fn build_headers(&self) -> Result<HeaderMap> {
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
        
        if let Some(token) = &self.access_token {
            let auth_value = format!("Bearer {}", token);
            headers.insert(
                AUTHORIZATION,
                HeaderValue::from_str(&auth_value)
                    .context("Invalid authorization header")?
            );
        }
        
        if let Some(user_id) = self.user_id {
            headers.insert(
                "New-Api-User",
                HeaderValue::from_str(&user_id.to_string())
                    .context("Invalid user ID header")?
            );
        }
        
        Ok(headers)
    }
    
    pub async fn get<T: for<'de> Deserialize<'de>>(
        &self,
        endpoint: &str,
    ) -> Result<ApiResponse<T>> {
        let url = format!("{}{}", self.base_url, endpoint);
        let headers = self.build_headers()?;
        
        let response = self.client
            .get(&url)
            .headers(headers)
            .send()
            .await
            .context("Failed to send GET request")?;
        
        let status = response.status();
        let body = response.json::<ApiResponse<T>>()
            .await
            .context(format!("Failed to parse response (status: {})", status))?;
        
        Ok(body)
    }
    
    pub async fn post<T, R>(
        &self,
        endpoint: &str,
        body: &T,
    ) -> Result<ApiResponse<R>>
    where
        T: Serialize,
        R: for<'de> Deserialize<'de>,
    {
        let url = format!("{}{}", self.base_url, endpoint);
        let headers = self.build_headers()?;
        
        let response = self.client
            .post(&url)
            .headers(headers)
            .json(body)
            .send()
            .await
            .context("Failed to send POST request")?;
        
        let body = response.json::<ApiResponse<R>>()
            .await
            .context("Failed to parse response")?;
        
        Ok(body)
    }
    
    pub async fn put<T, R>(
        &self,
        endpoint: &str,
        body: &T,
    ) -> Result<ApiResponse<R>>
    where
        T: Serialize,
        R: for<'de> Deserialize<'de>,
    {
        let url = format!("{}{}", self.base_url, endpoint);
        let headers = self.build_headers()?;
        
        let response = self.client
            .put(&url)
            .headers(headers)
            .json(body)
            .send()
            .await
            .context("Failed to send PUT request")?;
        
        let body = response.json::<ApiResponse<R>>()
            .await
            .context("Failed to parse response")?;
        
        Ok(body)
    }
    
    pub async fn delete<T: for<'de> Deserialize<'de>>(
        &self,
        endpoint: &str,
    ) -> Result<ApiResponse<T>> {
        let url = format!("{}{}", self.base_url, endpoint);
        let headers = self.build_headers()?;
        
        let response = self.client
            .delete(&url)
            .headers(headers)
            .send()
            .await
            .context("Failed to send DELETE request")?;
        
        let body = response.json::<ApiResponse<T>>()
            .await
            .context("Failed to parse response")?;
        
        Ok(body)
    }
}
