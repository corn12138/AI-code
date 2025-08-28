// Teardown Testcontainers
module.exports = async () => {
    const pg = global.__PG_CONTAINER__;
    const redis = global.__REDIS_CONTAINER__;

    if (redis) {
        try { await redis.stop(); } catch { }
    }
    if (pg) {
        try { await pg.stop(); } catch { }
    }
};


