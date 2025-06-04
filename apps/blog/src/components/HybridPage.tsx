// 这是一个服务器组件 (默认)
import { getServerData } from '../lib/data';
import ClientSection from './ClientSection';

export default async function HybridPage() {
    // 在服务器上获取数据
    const serverData = await getServerData();

    return (
        <div>
            <h1>服务器渲染部分</h1>
            <p>这部分内容在服务器上渲染: {serverData.title}</p>

            {/* 将服务器数据传递给客户端组件 */}
            <ClientSection initialData={serverData} />
        </div>
    );
}
