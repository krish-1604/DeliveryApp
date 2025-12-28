# 🔐 Production Release Signing Setup

## Step 1: Generate Production Keystore

Run this command in the `android/app` directory:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore delivery-app-release.keystore -alias delivery-app -keyalg RSA -keysize 2048 -validity 10000
```

You will be prompted to enter:
- **Keystore password**: Choose a strong password (remember this!)
- **Key password**: Choose a strong password (can be same as keystore password)
- **First and last name**: Your name or company name
- **Organizational unit**: Your department (e.g., "Development")
- **Organization**: Your company name
- **City**: Your city
- **State**: Your state/province
- **Country code**: Two-letter country code (e.g., "US", "IN")

**IMPORTANT**: Save these passwords securely! You'll need them to sign future updates.

## Step 2: Secure Your Keystore

1. **DO NOT commit the keystore to Git!** Add it to `.gitignore`:
   ```bash
   echo "android/app/*.keystore" >> .gitignore
   ```

2. **Backup the keystore** to a secure location (password manager, encrypted drive, etc.)

3. If you lose this keystore, you **CANNOT** update your app on the Play Store!

## Step 3: Configure Gradle Properties

Create or edit `android/gradle.properties` and add:

```properties
# Release signing configuration
DELIVERY_APP_RELEASE_STORE_FILE=delivery-app-release.keystore
DELIVERY_APP_RELEASE_KEY_ALIAS=delivery-app
DELIVERY_APP_RELEASE_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
DELIVERY_APP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

**Replace** `YOUR_KEYSTORE_PASSWORD` and `YOUR_KEY_PASSWORD` with your actual passwords.

## Step 4: Secure gradle.properties

Add `gradle.properties` to `.gitignore` to prevent committing passwords:

```bash
echo "android/gradle.properties" >> .gitignore
```

## Alternative: Use Environment Variables (More Secure)

Instead of storing passwords in `gradle.properties`, use environment variables:

### On Windows (PowerShell):
```powershell
$env:DELIVERY_APP_RELEASE_STORE_FILE="delivery-app-release.keystore"
$env:DELIVERY_APP_RELEASE_KEY_ALIAS="delivery-app"
$env:DELIVERY_APP_RELEASE_STORE_PASSWORD="your_password"
$env:DELIVERY_APP_RELEASE_KEY_PASSWORD="your_password"
```

### On macOS/Linux:
```bash
export DELIVERY_APP_RELEASE_STORE_FILE=delivery-app-release.keystore
export DELIVERY_APP_RELEASE_KEY_ALIAS=delivery-app
export DELIVERY_APP_RELEASE_STORE_PASSWORD=your_password
export DELIVERY_APP_RELEASE_KEY_PASSWORD=your_password
```

Then update `android/gradle.properties` to read from env:
```properties
DELIVERY_APP_RELEASE_STORE_FILE=${env.DELIVERY_APP_RELEASE_STORE_FILE}
DELIVERY_APP_RELEASE_KEY_ALIAS=${env.DELIVERY_APP_RELEASE_KEY_ALIAS}
DELIVERY_APP_RELEASE_STORE_PASSWORD=${env.DELIVERY_APP_RELEASE_STORE_PASSWORD}
DELIVERY_APP_RELEASE_KEY_PASSWORD=${env.DELIVERY_APP_RELEASE_KEY_PASSWORD}
```

## Step 5: Build Release APK/AAB

After configuration, build your release:

```bash
cd android
./gradlew bundleRelease    # For AAB (Play Store)
./gradlew assembleRelease  # For APK
```

Output:
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
- **APK**: `android/app/build/outputs/apk/release/app-release.apk`

## Verification

To verify the signing configuration worked:

```bash
# For APK
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk

# For AAB
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

You should see your certificate details, NOT the debug certificate.

## 🚨 Security Checklist

- [ ] Keystore file backed up securely
- [ ] Passwords stored in password manager
- [ ] `*.keystore` added to `.gitignore`
- [ ] `gradle.properties` added to `.gitignore` (if it contains passwords)
- [ ] Release build tested before upload
- [ ] Certificate details verified with jarsigner

## For CI/CD (GitHub Actions, etc.)

Store these as **encrypted secrets** in your CI/CD platform:
- `RELEASE_STORE_FILE` (base64 encoded keystore)
- `RELEASE_STORE_PASSWORD`
- `RELEASE_KEY_ALIAS`
- `RELEASE_KEY_PASSWORD`
