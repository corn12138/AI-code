import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  content: string;
  style?: React.CSSProperties;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 清理HTML内容
    const sanitizedHtml = DOMPurify.sanitize(content, {
      // 在低代码平台中可能需要更严格的设置
      ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'span', 'div', 'img'],
      ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'id', 'style'],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target'], // 为链接添加target属性
      FORCE_BODY: true,
      SANITIZE_DOM: true,
    });
    
    // 设置清理后的内容
    containerRef.current.innerHTML = sanitizedHtml;
    
    // 为所有链接添加target="_blank"和安全属性
    if (containerRef.current) {
      const links = containerRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }
  }, [content]);
  
  return <div ref={containerRef} style={style} />;
};

export default HtmlContent;
