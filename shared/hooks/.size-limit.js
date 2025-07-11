module.exports = [
    {
        name: 'ESM Build',
        path: 'dist/index.esm.js',
        limit: '15 KB',
        gzip: true,
        running: false
    },
    {
        name: 'CommonJS Build',
        path: 'dist/index.js',
        limit: '15 KB',
        gzip: true,
        running: false
    },
    {
        name: 'UMD Build',
        path: 'dist/index.umd.js',
        limit: '20 KB',
        gzip: true,
        running: false
    },
    {
        name: 'Individual useAuth',
        path: 'dist/index.esm.js',
        import: '{ useAuth }',
        limit: '3 KB',
        gzip: true,
        running: false
    },
    {
        name: 'Individual useDebounce',
        path: 'dist/index.esm.js',
        import: '{ useDebounce }',
        limit: '1 KB',
        gzip: true,
        running: false
    },
    {
        name: 'Individual useAsync',
        path: 'dist/index.esm.js',
        import: '{ useAsync }',
        limit: '2 KB',
        gzip: true,
        running: false
    }
]; 