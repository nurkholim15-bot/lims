import os
import re
import base64
import hashlib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Load environment variables with basic interpolation
def load_env_file(filepath):
    if not os.path.exists(filepath):
        print(f"Warning: env file not found at {filepath}")
        return
    env_vars = {}
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                # Remove comments at the end of the line if any
                if ' #' in val:
                    val = val.split(' #', 1)[0]
                val = val.strip().strip("'").strip('"')
                env_vars[key.strip()] = val
    
    # Resolve interpolation
    pattern = re.compile(r'\$\{([^}]+)\}')
    for key, val in env_vars.items():
        for _ in range(5):
            matches = pattern.findall(val)
            if not matches:
                break
            for match in matches:
                if match in env_vars:
                    val = val.replace(f"${{{match}}}", env_vars[match])
                elif match in os.environ:
                    val = val.replace(f"${{{match}}}", os.environ[match])
            env_vars[key] = val
        os.environ[key] = val

# Load backend's env (it resides in parent folder '../.env')
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_env_file(os.path.join(parent_dir, '.env'))

# Fallback check for WSL/Linux env or local testing env
if not os.getenv("DB_NAME"):
    load_env_file(os.path.join(parent_dir, '.env Linux'))

def decrypt_aes(crypto_text: str, key: str) -> str:
    ciphertext = base64.urlsafe_b64decode(crypto_text)
    hash_key = hashlib.sha256(key.encode('utf-8')).digest()
    
    if len(ciphertext) < 16:
        raise ValueError("Ciphertext too short")
        
    iv = ciphertext[:16]
    ciphertext = ciphertext[16:]
    
    cipher = Cipher(algorithms.AES(hash_key), modes.CFB(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_bytes = decryptor.update(ciphertext) + decryptor.finalize()
    return decrypted_bytes.decode('utf-8')

# Retrieve and decrypt password
jwt_secret = os.getenv("JWT_SECRET", "your_super_secret_key")
db_password = os.getenv("DB_PASSWORD", "")
encrypted_password = os.getenv("DB_PASSWORD_ENCRYPTED", "")

if encrypted_password and not db_password:
    try:
        db_password = decrypt_aes(encrypted_password, jwt_secret)
        print("Successfully decrypted database password.")
    except Exception as e:
        print(f"Error decrypting database password: {e}")

import urllib.parse

# Build SQLAlchemy connection
db_host = os.getenv("DB_HOST", "127.0.0.1")
db_port = os.getenv("DB_PORT", "5433")
db_user = os.getenv("DB_USER", "lims_app")
db_name = os.getenv("DB_NAME", "lims_prod_db")
db_sslmode = os.getenv("DB_SSLMODE", "disable")
db_schema = os.getenv("DB_SCHEMA", "lims")

# Handle sslmode translation from postgres to sqlalchemy
ssl_arg = f"?sslmode={db_sslmode}" if db_sslmode else ""

safe_user = urllib.parse.quote_plus(db_user)
safe_password = urllib.parse.quote_plus(db_password)

DATABASE_URL = f"postgresql://{safe_user}:{safe_password}@{db_host}:{db_port}/{db_name}{ssl_arg}"

# Use connect_args to set the search path to the schema
engine = create_engine(
    DATABASE_URL,
    connect_args={"options": f"-c search_path={db_schema},public"}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
