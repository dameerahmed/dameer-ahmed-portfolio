import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
from config import settings

def send_otp_email(to_email: str, otp_code: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("SMTP credentials not set. Logging OTP code to console for development.")
        print(f"OTP CODE: {otp_code}")
        # In development, we return True so the flow continues even without email
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = f"Dameer Portfolio: Your 6-Digit OTP Code"

        body = f"""
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
        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def generate_otp():
    return "".join([str(random.randint(0, 9)) for _ in range(6)])
