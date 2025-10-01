import { Article, ArticleCategory } from '../src/types';

export interface ServerStoreState {
    articles: Article[];
    currentCategory: ArticleCategory;
    currentArticle: Article | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };
}

export class ArticleStore {
    private state: ServerStoreState;

    constructor(initialData?: Partial<ServerStoreState>) {
        this.state = {
            articles: [],
            currentCategory: 'latest',
            currentArticle: null,
            loading: false,
            error: null,
            pagination: {
                page: 1,
                pageSize: 10,
                total: 0,
                hasMore: true,
            },
            ...initialData,
        };
    }

    getState(): ServerStoreState {
        return { ...this.state };
    }

    setState(newState: Partial<ServerStoreState>) {
        this.state = { ...this.state, ...newState };
    }

    setArticles(articles: Article[]) {
        this.setState({ articles });
    }

    setCurrentArticle(article: Article | null) {
        this.setState({ currentArticle: article });
    }

    setCurrentCategory(category: ArticleCategory) {
        this.setState({ currentCategory: category });
    }

    setPagination(pagination: Partial<ServerStoreState['pagination']>) {
        this.setState({
            pagination: { ...this.state.pagination, ...pagination }
        });
    }

    setLoading(loading: boolean) {
        this.setState({ loading });
    }

    setError(error: string | null) {
        this.setState({ error });
    }
}
