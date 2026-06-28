# config valid for current version and patch releases of Capistrano
lock "~> 3.20.1"

set :application, "sorter"
set :repo_url, "git@github.com:jedaeroweb/parcel_sorter.git"

# Default branch is :master
set :branch, "main"
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, "/home/deploy/sorter"

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# append :linked_files, "config/database.yml", 'config/master.key'

# Default value for linked_dirs is []
append :linked_dirs,
       ".next/cache",
       "node_modules"

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for local_user is ENV['USER']
# set :local_user, -> { `git config user.name`.chomp }

set :default_env, {
  PATH: "/home/deploy/.nvm/versions/node/v22.23.1/bin:$PATH"
}

# Default value for keep_releases is 5
set :keep_releases, 5

# Uncomment the following to require manually verifying the host key before first deploy.
# set :ssh_options, verify_host_key: :secure

namespace :deploy do

  after :updated, :npm_install do

    on roles(:app) do

      within release_path do

        execute :npm, "install"

      end

    end

  end

  after :npm_install, :build do

    on roles(:app) do

      within release_path do

        execute :npm, "run build"

      end

    end

  end

end


namespace :deploy do

  task :restart do

    on roles(:app) do

      within current_path do

        execute :pm2, "reload ecosystem.config.js"
      end

    end

  end

end

after "deploy:publishing", "deploy:restart"