import { useEffect } from 'react';
// At the top of your file
declare global {
    interface Window {
      $crisp: unknown[];
      CRISP_WEBSITE_ID: string;
    }
  }

interface CrispChatProps {
  websiteId: string;
}

export const CrispChat = ({ websiteId }: CrispChatProps) => {
  useEffect(() => {
    // Initialize Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;
    
    // Load Crisp script
    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      try {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (e) {
        console.error('Error removing Crisp script:', e);
      }
    };
  }, [websiteId]);
  
  return null;
};