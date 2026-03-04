import requests
import random
from config import settings

def send_otp_email(to_email: str, otp_code: str):
    """
    Sends an OTP email using the Resend HTTP API.
    Bypasses SMTP port restrictions on Render Free Tier.
    """
    if not settings.RESEND_API_KEY:
        print("DEBUG: RESEND_API_KEY not set. Logging OTP code to console for development.")
        print(f"OTP CODE: {otp_code}")
        return True

    print(f"DEBUG: Attempting to send OTP email to {to_email} via Resend API...")
    
    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "Admin <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "Dameer Portfolio: Your 6-Digit OTP Code",
            "html": f"""
            <html>
            <body style="font-family: sans-serif; background-color: #080810; color: #ffffff; padding: 40px; text-align: center;">
                <h1 style="color: #00f3ff; margin-bottom: 20px;">Ghost Dashboard Access</h1>
                <p style="font-size: 16px; color: #a1a1aa;">Use the code below to complete your secure login.</p>
                <div style="font-size: 42px; font-weight: bold; font-family: monospace; letter-spacing: 5px; color: #00f3ff; background: rgba(0, 243, 255, 0.1); padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px solid #00f3ff;">
                    {otp_code}
                </div>
                <p style="font-size: 12px; color: #52525b;">This code will expire in 10 minutes. If you did not request this, please ignore.</p>
            </body>
            </html>
            """
        }

        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code in (200, 201):
            print(f"SUCCESS: OTP email sent via Resend API to {to_email}")
            return True
        else:
            print(f"ERROR: Resend API failed with status {response.status_code}: {response.text}")
            return False

    except Exception as e:
        print(f"ERROR: Failed to send email via Resend API to {to_email}: {str(e)}")
        return False

def generate_otp():
    return "".join([str(random.randint(0, 9)) for _ in range(6)])
