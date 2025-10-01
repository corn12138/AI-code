import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from '../src/App';
import { ArticleStore } from './store-server';

export interface SSRContext {
    url: string;
    initialData?: any;
}

export async function render(context: SSRContext) {
    const { url, initialData } = context;

    // 创建服务端store实例
    const store = new ArticleStore(initialData);

    const html = renderToString(
        <StaticRouter location={url}>
            <App />
        </StaticRouter>
    );

    return {
        html,
        initialData: store.getState(),
    };
}
