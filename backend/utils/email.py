import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
from config import settings

def send_otp_email(to_email: str, otp_code: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("SMTP credentials not set. Logging OTP code to console for development.")
        print(f"OTP CODE: {otp_code}")
        return True

    import socket
    # Force IPv4 for the SMTP connection to avoid Errno 101 (Network is unreachable)
    # common on some cloud providers with broken IPv6 routing
    original_getaddrinfo = socket.getaddrinfo

    def forced_ipv4_getaddrinfo(*args, **kwargs):
        res = original_getaddrinfo(*args, **kwargs)
        return [r for r in res if r[0] == socket.AF_INET]

    try:
        socket.getaddrinfo = forced_ipv4_getaddrinfo
        print(f"DEBUG: Attempting to send OTP email to {to_email}...")
        
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

        # Strategy 1: Attempt Port 465 (SMTPS) - Usually more reliable in cloud
        try:
            print(f"DEBUG: Attempting SMTP_SSL on smtp.gmail.com:465...")
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            print(f"SUCCESS: OTP email sent via Port 465 to {to_email}")
            return True
        except Exception as e465:
            print(f"DEBUG: Port 465 failed ({str(e465)}). Falling back to Port 587...")
            # Strategy 2: Fallback to Port 587 (STARTTLS)
            with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            print(f"SUCCESS: OTP email sent via Port 587 (fallback) to {to_email}")
            return True

    except Exception as e:
        print(f"ERROR: All email strategies failed for {to_email}: {str(e)}")
        return False
    finally:
        # Restore original socket behavior
        socket.getaddrinfo = original_getaddrinfo

def generate_otp():
    return "".join([str(random.randint(0, 9)) for _ in range(6)])
