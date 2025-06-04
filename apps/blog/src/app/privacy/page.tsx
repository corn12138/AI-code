import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策',
  description: 'TechBlog的隐私政策',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">隐私政策</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg">最后更新日期: 2023年9月1日</p>
          
          <h2>简介</h2>
          <p>
            TechBlog（"我们"、"我们的"或"本网站"）非常重视您的隐私。本隐私政策旨在说明我们如何收集、使用、
            披露和保护您在使用我们的网站和服务时提供的个人信息。
          </p>
          
          <h2>信息收集</h2>
          <p>我们可能会收集以下几类信息：</p>
          <ul>
            <li><strong>个人识别信息</strong>：包括姓名、电子邮件地址、用户名等。</li>
            <li><strong>账户信息</strong>：如您在我们平台上的注册和个人资料信息。</li>
            <li><strong>使用数据</strong>：如您如何使用我们的网站、访问的页面、点击的链接等。</li>
            <li><strong>设备信息</strong>：如IP地址、浏览器类型、操作系统等。</li>
            <li><strong>Cookie和类似技术</strong>：我们使用cookie和类似技术来收集信息。</li>
          </ul>
          
          <h2>信息使用</h2>
          <p>我们可能将收集的信息用于以下目的：</p>
          <ul>
            <li>提供、维护和改进我们的服务</li>
            <li>个性化您的使用体验</li>
            <li>与您沟通，包括发送通知和更新</li>
            <li>分析网站流量和使用模式</li>
            <li>检测和防止欺诈活动</li>
          </ul>
          
          <h2>信息分享</h2>
          <p>
            我们不会出售、交易或出租您的个人信息给第三方。但在以下情况下，我们可能会分享您的信息：
          </p>
          <ul>
            <li>经您同意</li>
            <li>与我们的服务提供商分享，以辅助我们的业务运营</li>
            <li>为遵守法律义务、保护我们的权利和财产</li>
            <li>在公司交易（如合并、收购）的情况下</li>
          </ul>
          
          <h2>数据保护</h2>
          <p>
            我们实施适当的技术和组织措施来保护您的个人信息免遭意外丢失、未经授权的访问、使用、更改和披露。
            然而，没有任何网络传输或电子存储方式是100%安全的。
          </p>
          
          <h2>您的权利</h2>
          <p>根据适用的数据保护法律，您可能享有以下权利：</p>
          <ul>
            <li>访问和获取我们收集的关于您的个人信息</li>
            <li>要求更正不准确的个人信息</li>
            <li>要求删除您的个人信息</li>
            <li>反对我们处理您的个人信息</li>
            <li>数据可携权</li>
            <li>撤销您之前的同意</li>
          </ul>
          
          <h2>变更</h2>
          <p>
            我们可能会不时更新本隐私政策。我们会在网站上发布新的隐私政策，并在有实质性变更时通知您。
          </p>
          
          <h2>联系我们</h2>
          <p>
            如果您对本隐私政策有任何疑问或顾虑，请通过以下方式联系我们：
            <a href="mailto:privacy@techblog.com" className="ml-1">privacy@techblog.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
