module.exports = {
  apps: [
    {
      name: "manavwelfare-api",
      script: "dist/index.cjs",
      cwd: "/www/wwwroot/manavwelfaresevasociety.com",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "5011",
      },
    },
  ],
};
