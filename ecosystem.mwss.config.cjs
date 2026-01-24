module.exports = {
  apps: [
    {
      name: "mwss-app",
      script: "dist/index.cjs",
      cwd: "/www/wwwroot/manavwelfaresevasociety.com",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "5011",
        PUBLIC_BASE_URL: "https://manavwelfaresevasociety.com",
        UPLOADS_DIR: "/www/wwwroot/manavwelfaresevasociety.com/uploads",
        UPLOAD_MAX_SIZE: "100mb"
      }
    }
  ]
};
