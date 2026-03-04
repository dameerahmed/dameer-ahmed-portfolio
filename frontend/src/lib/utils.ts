export const getDeviceId = () => {
    if (typeof window === "undefined") return "";
    let deviceId = localStorage.getItem("dameer_device_id");
    if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("dameer_device_id", deviceId);
    }
    return deviceId;
};

export const getContactIcon = (tag: string, url?: string) => {
    const t = (tag || "").toLowerCase();
    const u = (url || "").toLowerCase();

    // Detection Priority: URL first, then Tag
    const check = (key: string) => t.includes(key) || u.includes(key);

    // Socials & Tech
    if (check('linkedin')) return "https://www.vectorlogo.zone/logos/linkedin/linkedin-icon.svg";
    if (check('github')) return "https://www.vectorlogo.zone/logos/github/github-icon.svg";
    if (check('whatsapp')) return "https://www.vectorlogo.zone/logos/whatsapp/whatsapp-icon.svg";
    if (check('gmail') || check('google') || check('primary') || check('personal')) return "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg";
    if (check('telegram')) return "https://www.vectorlogo.zone/logos/telegram/telegram-icon.svg";
    if (check('skype')) return "https://www.vectorlogo.zone/logos/skype/skype-icon.svg";
    if (check('zoom')) return "https://www.vectorlogo.zone/logos/zoom/zoom-icon.svg";
    if (check('outlook') || check('microsoft')) return "https://www.vectorlogo.zone/logos/microsoft_outlook/microsoft_outlook-icon.svg";
    if (check('apple') || check('icloud')) return "https://www.vectorlogo.zone/logos/apple/apple-icon.svg";
    if (check('discord')) return "https://www.vectorlogo.zone/logos/discord/discord-icon.svg";
    if (check('twitter') || check(' x ')) return "https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg";
    if (check('facebook')) return "https://www.vectorlogo.zone/logos/facebook/facebook-icon.svg";
    if (check('instagram')) return "https://www.vectorlogo.zone/logos/instagram/instagram-icon.svg";

    // Freelancer & Creative
    if (check('fiverr')) return "https://www.vectorlogo.zone/logos/fiverr/fiverr-icon.svg";
    if (check('upwork')) return "https://www.vectorlogo.zone/logos/upwork/upwork-icon.svg";
    if (check('freelancer')) return "https://www.vectorlogo.zone/logos/freelancer/freelancer-icon.svg";
    if (check('behance')) return "https://www.vectorlogo.zone/logos/behance/behance-icon.svg";
    if (check('dribbble')) return "https://www.vectorlogo.zone/logos/dribbble/dribbble-icon.svg";
    if (check('pinterest')) return "https://www.vectorlogo.zone/logos/pinterest/pinterest-icon.svg";

    // Multimedia & Dev
    if (check('youtube')) return "https://www.vectorlogo.zone/logos/youtube/youtube-icon.svg";
    if (check('tiktok')) return "https://www.vectorlogo.zone/logos/tiktok/tiktok-icon.svg";
    if (check('medium')) return "https://www.vectorlogo.zone/logos/medium/medium-icon.svg";
    if (check('dev.to') || check('devto')) return "https://www.vectorlogo.zone/logos/devto/devto-icon.svg";
    if (check('hashnode')) return "https://cdn.hashnode.com/res/hashnode/image/upload/v1611902473383/CDHH-f69g.png";

    // General
    if (check('phone') || check('call') || check('mobile')) return "https://upload.wikimedia.org/wikipedia/commons/6/6c/Phone_icon.png";
    if (check('email') || check('mail')) return "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg";

    return null;
};
