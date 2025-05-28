import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttrs?: string[];
}

/**
 * 安全渲染HTML内容的共享组件
 */
const SafeHtml: React.FC<SafeHtmlProps> = ({
  html,
  className,
  allowedTags = ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br'],
  allowedAttrs = ['href', 'target', 'rel']
}) => {
  // 配置DOMPurify
  const sanitizeConfig = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttrs,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false
  };

  // 清理HTML
  const sanitizedHtml = DOMPurify.sanitize(html, sanitizeConfig);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeHtml;
