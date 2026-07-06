import os
import re

config_path = "/etc/nginx/nginx.conf"

if not os.path.exists(config_path):
    print(f"Error: {config_path} not found.")
    exit(1)

with open(config_path, "r") as f:
    content = f.read()

# Define the pattern to find log_format upstream_monitoring block
pattern = r'(log_format\s+upstream_monitoring\s+\'.*?agent="\$http_user_agent"\';)'

# Check if log_format contains x_app_version already to prevent duplicate edits
if "$http_x_app_version" in content:
    print("Nginx log format already includes app version/platform variables.")
    exit(0)

replacement = """log_format upstream_monitoring '$remote_addr - ClientIP: $real_client_ip - [$time_local] '
                               '"$request" $status $body_bytes_sent '
                               'to_server=$upstream_addr status=$upstream_status '
                               'resp_time=$upstream_response_time '
                               'agent="$http_user_agent" '
                               'app_ver="$http_x_app_version" app_plat="$http_x_app_platform"';"""

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write to temp file first
temp_path = "/tmp/nginx.conf.tmp"
with open(temp_path, "w") as f:
    f.write(new_content)

print(f"Successfully wrote modified Nginx config to {temp_path}.")
