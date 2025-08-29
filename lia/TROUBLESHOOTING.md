# LIA v3 Backend Troubleshooting Guide

## 🚨 "LIA backend is not available, using fallback mode" Error

This error indicates that the frontend cannot connect to the LIA Python backend. Follow these steps to resolve it:

### Step 1: Check if LIA Backend is Running

#### Quick Test:
```bash
curl http://localhost:5002/health
```

**Expected Response:**
```json
{"status": "ok", "message": "LIA v3 is running", "version": "3.0"}
```

If you get a connection error, the backend is not running.

### Step 2: Start the LIA Backend

#### Option A: Use Setup Script (Recommended)
```bash
cd lia/
python setup.py
```

#### Option B: Use Startup Scripts
```bash
# Linux/macOS
cd lia/
chmod +x start_lia.sh
./start_lia.sh

# Windows
cd lia\
start_lia.bat
```

#### Option C: Manual Start
```bash
cd lia/
python3 -m venv lia_env
source lia_env/bin/activate  # Linux/macOS
# or
lia_env\Scripts\activate.bat  # Windows

pip install -r requirements.txt
python lia_enhanced_lia.py --api --port 5002
```

### Step 3: Verify Dependencies

Ensure you have the required Python packages:
```bash
pip install flask flask-cors
```

### Step 4: Check Port Availability

Make sure port 5002 is not in use:
```bash
# Linux/macOS
netstat -an | grep 5002

# Windows
netstat -an | findstr 5002
```

If port 5002 is in use, either:
1. Kill the process using it
2. Use a different port: `python lia_enhanced_lia.py --api --port 5003`
3. Update frontend config in `/utils/lia.ts`

### Step 5: Frontend Configuration Check

Verify the frontend is pointing to the correct backend URL:

**File: `/utils/lia.ts`**
```typescript
export const lia = new EnhancedLIA({
  apiUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5002'  // <-- Make sure this matches your backend port
    : 'https://your-lia-backend.com',
  fallbackEnabled: true
});
```

## Common Issues and Solutions

### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
cd lia/
source lia_env/bin/activate  # or lia_env\Scripts\activate.bat on Windows
pip install flask flask-cors
```

### Issue: "Permission denied" on startup scripts

**Solution (Linux/macOS):**
```bash
chmod +x start_lia.sh
./start_lia.sh
```

### Issue: "Port already in use"

**Solutions:**
1. **Find and kill the process:**
   ```bash
   # Linux/macOS
   lsof -ti:5002 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5002
   taskkill /PID <PID> /F
   ```

2. **Use a different port:**
   ```bash
   python lia_enhanced_lia.py --api --port 5003
   ```
   
   Then update frontend config:
   ```typescript
   apiUrl: 'http://localhost:5003'
   ```

### Issue: CORS Errors in Browser

**Symptoms:**
- Frontend shows "network error"
- Browser console shows CORS policy errors

**Solution:**
The LIA backend includes CORS support. If you still get CORS errors:

1. Install flask-cors: `pip install flask-cors`
2. Restart the backend
3. Check browser developer tools for specific CORS error messages

### Issue: "SQLite3 database is locked"

**Solution:**
```bash
cd lia/
rm lia_v3.db  # This will reset the database
python lia_enhanced_lia.py --api --port 5002
```

### Issue: Backend starts but frontend still shows "not available"

**Solutions:**
1. **Check browser network tab:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Try using LIA
   - Look for failed requests to localhost:5002

2. **Verify API response:**
   ```bash
   curl -X POST http://localhost:5002/lia \
        -H "Content-Type: application/json" \
        -d '{"text": "hello", "user_id": "test_user"}'
   ```

3. **Check firewall/antivirus:**
   - Temporarily disable firewall
   - Add exception for Python/Flask

4. **Try different browser:**
   - Some browsers block localhost connections
   - Try Chrome/Firefox with CORS extensions disabled

## Environment-Specific Issues

### Windows-Specific

**Issue: "python3 not found"**
```cmd
# Use 'python' instead of 'python3'
python lia_enhanced_lia.py --api --port 5002
```

**Issue: Script execution policy**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS-Specific

**Issue: SSL certificate errors**
```bash
# Install certificates
/Applications/Python\ 3.x/Install\ Certificates.command
```

### Linux-Specific

**Issue: Python3-venv not available**
```bash
# Ubuntu/Debian
sudo apt-get install python3-venv

# CentOS/RHEL
sudo yum install python3-venv
```

## Development Mode

For development, you can run LIA with debug mode:

```bash
cd lia/
python lia_enhanced_lia.py --api --port 5002
# Add debug flag in the Python file if needed
```

## Testing the Connection

### 1. Health Check
```bash
curl http://localhost:5002/health
```

### 2. Send Test Message
```bash
curl -X POST http://localhost:5002/lia \
     -H "Content-Type: application/json" \
     -d '{"text": "create post about coding", "user_id": "test_user"}'
```

### 3. Check Logs
Look for error messages in the terminal where LIA is running.

## Production Deployment

For production deployment, consider:

1. **Use a process manager** (systemd, pm2, supervisor)
2. **Configure reverse proxy** (nginx, apache)
3. **Set environment variables:**
   ```bash
   export LIA_HOST=0.0.0.0
   export LIA_PORT=5002
   export LIA_DB_PATH=/var/lib/lia/lia_v3.db
   ```

## Still Having Issues?

### Check This Checklist:

- [ ] Python 3.8+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Port 5002 available
- [ ] No firewall blocking connections
- [ ] Frontend pointing to correct URL (`http://localhost:5002`)
- [ ] CORS enabled in backend (automatic)

### Debug Commands:

```bash
# 1. Check Python version
python3 --version

# 2. Check if Flask is installed
python3 -c "import flask; print('Flask OK')"

# 3. Check if LIA module loads
python3 -c "from lia_enhanced_lia import LIA; print('LIA OK')"

# 4. Test direct API call
curl -v http://localhost:5002/health

# 5. Check port usage
netstat -an | grep 5002  # Linux/macOS
netstat -an | findstr 5002  # Windows
```

### Getting More Help:

1. **Check the terminal output** where LIA is running for error messages
2. **Check browser developer tools** Network tab for failed requests
3. **Try running LIA in CLI mode** first: `python lia_enhanced_lia.py`
4. **Reset everything** and start fresh:
   ```bash
   rm -rf lia_env lia_v3.db
   python setup.py
   ```

## Success Indicators

When LIA v3 backend is working correctly, you should see:

### In Terminal:
```
🚀 LIA v3 API starting on 127.0.0.1:5002
📡 CORS enabled for frontend connections
* Running on http://127.0.0.1:5002
```

### In Browser:
- LIA button shows green dot (online status)
- "Enhanced Mode • v3.0" displayed
- No "fallback mode" warnings
- Quick actions work properly

### Frontend Console:
```
✅ LIA v3 backend is online
```

## Contact Support

If you're still experiencing issues after following this guide:

1. Include your Python version (`python --version`)
2. Include your operating system
3. Include the complete error message
4. Include the output from the debug commands above