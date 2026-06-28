module.exports = {
  apps: [
    {
      name: "sorter",
      script: "npm",
      args: "start",
      cwd: "/home/deploy/sorter/current",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};